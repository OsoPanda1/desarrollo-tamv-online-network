import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
} from "jose";
import {
  TAMV_PASS_SUPPORTED_SCOPES,
  TAMV_PASS_TOKEN_TTL_SECONDS,
  type TamvPassClaims,
  type TamvPassScope,
} from "./tokens";

const TOKEN_TYPE = "tamv-pass+jwt";
const TOKEN_PURPOSE = "tamv_pass";
const ALGORITHM = "RS256";
const MAX_TOKEN_BYTES = 8_192;
const ISSUER_KEYS = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function normalizeOrigin(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(label + " must be an absolute HTTP(S) origin.");
  }

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    throw new Error(label + " must be an origin without credentials, path, query, or fragment.");
  }

  const isLocalHttp =
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error(label + " must use HTTPS outside local development.");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error(label + " must use HTTPS in production.");
  }
  return url.origin;
}

function getIssuer(): string {
  const raw = process.env.TAMV_PASS_ISSUER?.trim()
    || process.env.APP_URL?.trim()
    || process.env.BETTER_AUTH_URL?.trim();
  if (!raw) throw new Error("TAMV_PASS_ISSUER is not configured.");
  return normalizeOrigin(raw, "TAMV_PASS_ISSUER");
}

function getJwks(issuer: string): ReturnType<typeof createRemoteJWKSet> {
  const cached = ISSUER_KEYS.get(issuer);
  if (cached) return cached;

  const url = new URL("/.well-known/jwks.json", issuer);
  const resolver = createRemoteJWKSet(url, {
    timeoutDuration: 3_000,
    cooldownDuration: 1_000,
    cacheMaxAge: 60_000,
  });
  ISSUER_KEYS.set(issuer, resolver);
  return resolver;
}

export interface VerifiedTamvPassIdentity {
  subject: string;
  scopes: TamvPassScope[];
  claims: TamvPassClaims;
}

/**
 * Consumer-side verifier. It does not load or require the issuer's private key:
 * it fetches public verification keys from the configured, trusted issuer.
 * Never derive issuer or audience from an untrusted HTTP request parameter.
 */
export async function verifyTamvPassAccessToken(
  token: string,
  expectedAudience: string,
): Promise<VerifiedTamvPassIdentity> {
  if (typeof token !== "string" || token.length === 0 || Buffer.byteLength(token, "utf8") > MAX_TOKEN_BYTES) {
    throw new Error("TAMV Pass token is missing or too large.");
  }

  const issuer = getIssuer();
  const audience = normalizeOrigin(expectedAudience, "expected audience");
  const untrustedHeader = decodeProtectedHeader(token);
  if (
    untrustedHeader.alg !== ALGORITHM ||
    untrustedHeader.typ !== TOKEN_TYPE ||
    typeof untrustedHeader.kid !== "string" ||
    untrustedHeader.kid.length === 0 ||
    untrustedHeader.kid.length > 64
  ) {
    throw new Error("Invalid TAMV Pass token header.");
  }

  const { payload, protectedHeader } = await jwtVerify(token, getJwks(issuer), {
    algorithms: [ALGORITHM],
    issuer,
    audience,
    clockTolerance: 5,
    maxTokenAge: String(TAMV_PASS_TOKEN_TTL_SECONDS) + "s",
  });

  if (
    protectedHeader.alg !== ALGORITHM ||
    protectedHeader.typ !== TOKEN_TYPE ||
    payload.token_use !== TOKEN_PURPOSE ||
    payload.tamv_version !== 1 ||
    typeof payload.sub !== "string" ||
    payload.sub.length === 0 ||
    typeof payload.scope !== "string" ||
    typeof payload.jti !== "string" ||
    payload.jti.length === 0
  ) {
    throw new Error("TAMV Pass token claims are invalid.");
  }

  const rawScopes = payload.scope.split(" ").filter(Boolean);
  const scopes = [...new Set(rawScopes)];
  if (
    scopes.length === 0 ||
    scopes.length !== rawScopes.length ||
    scopes.some((scope) => !TAMV_PASS_SUPPORTED_SCOPES.includes(scope as TamvPassScope))
  ) {
    throw new Error("TAMV Pass token has unsupported or duplicated scopes.");
  }

  if (
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number" ||
    payload.exp <= payload.iat ||
    payload.exp - payload.iat > TAMV_PASS_TOKEN_TTL_SECONDS
  ) {
    throw new Error("TAMV Pass token lifetime is invalid.");
  }

  return {
    subject: payload.sub,
    scopes: scopes as TamvPassScope[],
    claims: payload as JWTPayload & TamvPassClaims,
  };
}
