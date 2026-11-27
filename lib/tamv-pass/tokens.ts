import { randomUUID, createPrivateKey, createPublicKey, type KeyObject } from "node:crypto";
import {
  calculateJwkThumbprint,
  decodeProtectedHeader,
  importPKCS8,
  importSPKI,
  jwtVerify,
  SignJWT,
  type JWK,
  type JWTPayload,
} from "jose";

export const TAMV_PASS_TOKEN_TTL_SECONDS = 180;
export const TAMV_PASS_SUPPORTED_SCOPES = ["profile:read", "tamv:read"] as const;
const TOKEN_TYPE = "tamv-pass+jwt";
const TOKEN_PURPOSE = "tamv_pass";
const ALGORITHM = "RS256";
const KID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export type TamvPassScope = (typeof TAMV_PASS_SUPPORTED_SCOPES)[number];

export interface TamvPassSubject {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  role?: string | null;
}

export interface TamvPassClaims extends JWTPayload {
  sub: string;
  token_use: typeof TOKEN_PURPOSE;
  tamv_version: 1;
  scope: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  tamv_role?: "member" | "moderator" | "admin";
}

interface SigningMaterial {
  kid: string;
  privateKey: Awaited<ReturnType<typeof importPKCS8>>;
  publicJwk: JWK;
  publicPem: string;
}

interface VerificationKey {
  kid: string;
  key: Awaited<ReturnType<typeof importSPKI>>;
  jwk: JWK;
}

let signingCache: { fingerprint: string; promise: Promise<SigningMaterial> } | undefined;
let previousCache: { fingerprint: string; promise: Promise<VerificationKey | null> } | undefined;

function decodePemVariable(name: string): string {
  const encoded = process.env[name]?.trim();
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new Error(`${name} must be a single-line base64-encoded PEM value.`);
  }

  const pem = Buffer.from(encoded, "base64").toString("utf8");
  if (!pem.includes("-----BEGIN ") || !pem.includes("-----END ")) {
    throw new Error(`${name} does not contain a valid PEM envelope.`);
  }
  return pem;
}

function normalizeOrigin(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute HTTP(S) origin.`);
  }
  if (url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) {
    throw new Error(`${label} must be an origin without credentials, path, query, or fragment.`);
  }
  const isLocalHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error(`${label} must use HTTPS outside local development.`);
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS in production.`);
  }
  return url.origin;
}

export function isTamvPassEnabled(): boolean {
  return process.env.TAMV_PASS_ENABLED === "true";
}

function getConfiguration(requireEnabled: boolean) {
  if (requireEnabled && !isTamvPassEnabled()) {
    throw new Error("TAMV Pass is disabled.");
  }

  const rawIssuer = process.env.TAMV_PASS_ISSUER?.trim()
    || process.env.APP_URL?.trim()
    || process.env.BETTER_AUTH_URL?.trim();
  if (!rawIssuer) throw new Error("TAMV_PASS_ISSUER is not configured.");
  const issuer = normalizeOrigin(rawIssuer, "TAMV_PASS_ISSUER");

  const rawAudiences = process.env.TAMV_PASS_ALLOWED_AUDIENCES?.trim();
  if (!rawAudiences) throw new Error("TAMV_PASS_ALLOWED_AUDIENCES is not configured.");
  const allowedAudiences = [...new Set(rawAudiences.split(",").map((value) => value.trim()).filter(Boolean))]
    .map((value) => normalizeOrigin(value, "TAMV_PASS_ALLOWED_AUDIENCES"));
  if (allowedAudiences.length === 0) throw new Error("No allowed audiences are configured.");

  return { issuer, allowedAudiences };
}

function publicJwkFrom(key: KeyObject): JWK {
  const jwk = key.export({ format: "jwk" }) as JWK;
  if (jwk.kty !== "RSA" || typeof jwk.n !== "string" || typeof jwk.e !== "string") {
    throw new Error("TAMV Pass only supports RSA public keys.");
  }
  return { kty: "RSA", n: jwk.n, e: jwk.e, alg: ALGORITHM, use: "sig", key_ops: ["verify"] };
}

async function getSigningMaterial(): Promise<SigningMaterial> {
  const encoded = process.env.TAMV_PASS_PRIVATE_KEY_B64?.trim() ?? "";
  const configuredKid = process.env.TAMV_PASS_KEY_ID?.trim() ?? "";
  const fingerprint = `${encoded}:${configuredKid}`;
  if (signingCache?.fingerprint === fingerprint) return signingCache.promise;

  const promise = (async () => {
    const pem = decodePemVariable("TAMV_PASS_PRIVATE_KEY_B64");
    const privateKeyObject = createPrivateKey(pem);
    if (privateKeyObject.asymmetricKeyType !== "rsa" || (privateKeyObject.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
      throw new Error("TAMV Pass requires an RSA private key of at least 2048 bits.");
    }
    const publicKeyObject = createPublicKey(privateKeyObject);
    const publicJwk = publicJwkFrom(publicKeyObject);
    const kid = configuredKid || await calculateJwkThumbprint(publicJwk, "sha256");
    if (!KID_PATTERN.test(kid)) throw new Error("TAMV_PASS_KEY_ID has an invalid format.");

    const privatePem = privateKeyObject.export({ format: "pem", type: "pkcs8" }).toString();
    const publicPem = publicKeyObject.export({ format: "pem", type: "spki" }).toString();
    return {
      kid,
      privateKey: await importPKCS8(privatePem, ALGORITHM),
      publicJwk: { ...publicJwk, kid },
      publicPem,
    };
  })();

  signingCache = { fingerprint, promise };
  return promise;
}

async function getPreviousVerificationKey(): Promise<VerificationKey | null> {
  const encoded = process.env.TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64?.trim() ?? "";
  const kid = process.env.TAMV_PASS_PREVIOUS_KEY_ID?.trim() ?? "";
  const fingerprint = `${encoded}:${kid}`;
  if (previousCache?.fingerprint === fingerprint) return previousCache.promise;

  const promise = (async () => {
    if (!encoded && !kid) return null;
    if (!encoded || !kid || !KID_PATTERN.test(kid)) {
      throw new Error("Previous-key rotation requires both a valid public key and key ID.");
    }
    const pem = decodePemVariable("TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64");
    const publicKeyObject = createPublicKey(pem);
    if (publicKeyObject.asymmetricKeyType !== "rsa" || (publicKeyObject.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
      throw new Error("Previous TAMV Pass public key must be RSA with at least 2048 bits.");
    }
    const jwk = publicJwkFrom(publicKeyObject);
    const current = await getSigningMaterial();
    if (kid === current.kid) throw new Error("Current and previous TAMV Pass key IDs must differ.");
    const publicPem = publicKeyObject.export({ format: "pem", type: "spki" }).toString();
    return { kid, key: await importSPKI(publicPem, ALGORITHM), jwk: { ...jwk, kid } };
  })();

  previousCache = { fingerprint, promise };
  return promise;
}

function normalizeAudience(value: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("An audience is required.");
  return normalizeOrigin(value.trim(), "audience");
}

function normalizeScopes(scopes?: unknown): TamvPassScope[] {
  if (scopes === undefined) return ["profile:read"];
  if (!Array.isArray(scopes) || scopes.length < 1 || scopes.length > TAMV_PASS_SUPPORTED_SCOPES.length) {
    throw new Error("Scopes must be a non-empty array containing only supported scopes.");
  }
  const unique = [...new Set(scopes)];
  if (unique.some((scope) => typeof scope !== "string" || !TAMV_PASS_SUPPORTED_SCOPES.includes(scope as TamvPassScope))) {
    throw new Error("One or more requested scopes are not supported.");
  }
  return (unique as TamvPassScope[]).sort();
}

export async function createTamvPassToken(
  subject: TamvPassSubject,
  audienceInput: string,
  requestedScopes?: unknown,
): Promise<{ accessToken: string; expiresIn: number; audience: string; scopes: TamvPassScope[]; keyId: string }> {
  const { issuer, allowedAudiences } = getConfiguration(true);
  if (!subject?.id || typeof subject.id !== "string" || subject.id.length > 200) {
    throw new Error("A valid authenticated subject is required.");
  }

  const audience = normalizeAudience(audienceInput);
  if (!allowedAudiences.includes(audience)) throw new Error("The requested audience is not allowlisted.");
  const scopes = normalizeScopes(requestedScopes);
  const material = await getSigningMaterial();

  const claims: Record<string, unknown> = {
    token_use: TOKEN_PURPOSE,
    tamv_version: 1,
    scope: scopes.join(" "),
  };
  if (scopes.includes("profile:read")) {
    if (typeof subject.name === "string" && subject.name.length <= 160) claims.name = subject.name;
    if (typeof subject.email === "string" && subject.email.length <= 254) claims.email = subject.email;
    claims.email_verified = subject.emailVerified === true;
  }
  if (scopes.includes("tamv:read")) {
    const role = subject.role;
    claims.tamv_role = role === "admin" || role === "moderator" ? role : "member";
  }

  const accessToken = await new SignJWT(claims)
    .setProtectedHeader({ alg: ALGORITHM, typ: TOKEN_TYPE, kid: material.kid })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(subject.id)
    .setIssuedAt()
    .setExpirationTime(`${TAMV_PASS_TOKEN_TTL_SECONDS}s`)
    .setJti(randomUUID())
    .sign(material.privateKey);

  return { accessToken, expiresIn: TAMV_PASS_TOKEN_TTL_SECONDS, audience, scopes, keyId: material.kid };
}

export async function verifyTamvPassToken(token: string, expectedAudience: string): Promise<TamvPassClaims> {
  const { issuer } = getConfiguration(false);
  const audience = normalizeAudience(expectedAudience);
  const header = decodeProtectedHeader(token);
  if (header.alg !== ALGORITHM || header.typ !== TOKEN_TYPE || typeof header.kid !== "string") {
    throw new Error("Invalid TAMV Pass token header.");
  }

  const current = await getSigningMaterial();
  let verificationKey: Awaited<ReturnType<typeof importSPKI>> | undefined;
  if (header.kid === current.kid) {
    verificationKey = await importSPKI(current.publicPem, ALGORITHM);
  } else {
    const previous = await getPreviousVerificationKey();
    if (previous && header.kid === previous.kid) verificationKey = previous.key;
  }
  if (!verificationKey) throw new Error("Unknown TAMV Pass key ID.");

  const { payload } = await jwtVerify(token, verificationKey, {
    algorithms: [ALGORITHM],
    issuer,
    audience,
    clockTolerance: 5,
    maxTokenAge: `${TAMV_PASS_TOKEN_TTL_SECONDS}s`,
  });

  if (
    payload.token_use !== TOKEN_PURPOSE
    || payload.tamv_version !== 1
    || typeof payload.sub !== "string"
    || payload.sub.length === 0
    || typeof payload.scope !== "string"
  ) {
    throw new Error("TAMV Pass token claims are invalid.");
  }

  const scopes = payload.scope.split(" ").filter(Boolean);
  if (scopes.length === 0 || scopes.some((scope) => !TAMV_PASS_SUPPORTED_SCOPES.includes(scope as TamvPassScope))) {
    throw new Error("TAMV Pass token has unsupported scopes.");
  }
  if (typeof payload.iat !== "number" || typeof payload.exp !== "number" || payload.exp <= payload.iat || payload.exp - payload.iat > TAMV_PASS_TOKEN_TTL_SECONDS) {
    throw new Error("TAMV Pass token lifetime is invalid.");
  }

  return payload as TamvPassClaims;
}

export async function getTamvPassJwks(): Promise<{ keys: JWK[] }> {
  const current = await getSigningMaterial();
  const keys = [current.publicJwk];
  const previous = await getPreviousVerificationKey();
  if (previous) keys.push(previous.jwk);
  return { keys };
}

export function getTamvPassMetadata() {
  const { issuer, allowedAudiences } = getConfiguration(true);
  return {
    service: "TAMV Pass",
    protocol: "tamv-pass-session-exchange-v1",
    issuer,
    token_endpoint: `${issuer}/api/tamv-pass/token`,
    jwks_uri: `${issuer}/.well-known/jwks.json`,
    token_signing_alg_values_supported: [ALGORITHM],
    scopes_supported: [...TAMV_PASS_SUPPORTED_SCOPES],
    token_lifetime_seconds: TAMV_PASS_TOKEN_TTL_SECONDS,
    allowed_audiences: allowedAudiences,
    authentication_source: "Better Auth database-backed session",
    openid_connect: false,
  };
}
