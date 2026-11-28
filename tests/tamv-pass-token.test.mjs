import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { importPKCS8, SignJWT } from "jose";

const currentPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const currentPrivatePem = currentPair.privateKey.export({ format: "pem", type: "pkcs8" }).toString();

process.env.TAMV_PASS_ENABLED = "true";
process.env.TAMV_PASS_ISSUER = "https://issuer.example.test";
process.env.TAMV_PASS_ALLOWED_AUDIENCES = "https://api.example.test,https://worker.example.test";
process.env.TAMV_PASS_PRIVATE_KEY_B64 = Buffer.from(currentPrivatePem).toString("base64");
process.env.TAMV_PASS_KEY_ID = "test-current-key";
delete process.env.TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64;
delete process.env.TAMV_PASS_PREVIOUS_KEY_ID;

const {
  createTamvPassToken,
  getTamvPassJwks,
  getTamvPassMetadata,
  isTamvPassEnabled,
  verifyTamvPassToken,
  TAMV_PASS_TOKEN_TTL_SECONDS,
} = await import("../lib/tamv-pass/tokens.ts");

const subject = {
  id: "user_test_123",
  name: "Example Member",
  email: "member@example.test",
  emailVerified: true,
  role: "admin",
};

test("issues a short-lived audience-bound RS256 token from a known authenticated subject", async () => {
  const issued = await createTamvPassToken(subject, "https://api.example.test", ["profile:read", "tamv:read"]);
  const claims = await verifyTamvPassToken(issued.accessToken, "https://api.example.test");

  assert.equal(issued.expiresIn, TAMV_PASS_TOKEN_TTL_SECONDS);
  assert.equal(issued.audience, "https://api.example.test");
  assert.equal(claims.iss, "https://issuer.example.test");
  assert.equal(claims.aud, "https://api.example.test");
  assert.equal(claims.sub, subject.id);
  assert.equal(claims.token_use, "tamv_pass");
  assert.equal(claims.tamv_version, 1);
  assert.equal(claims.scope, "profile:read tamv:read");
  assert.equal(claims.name, subject.name);
  assert.equal(claims.email, subject.email);
  assert.equal(claims.email_verified, true);
  assert.equal(claims.tamv_role, "admin");
  assert.equal(typeof claims.jti, "string");
  assert.ok(Number(claims.exp) - Number(claims.iat) <= TAMV_PASS_TOKEN_TTL_SECONDS);
});

test("maps application moderation roles to the federated moderator role without elevating unknown roles", async () => {
  for (const role of ["reviewer", "editor", "moderator"]) {
    const issued = await createTamvPassToken({ ...subject, role }, "https://api.example.test", ["tamv:read"]);
    const claims = await verifyTamvPassToken(issued.accessToken, "https://api.example.test");
    assert.equal(claims.tamv_role, "moderator");
  }
  for (const role of ["member", "owner", "", null]) {
    const issued = await createTamvPassToken({ ...subject, role }, "https://api.example.test", ["tamv:read"]);
    const claims = await verifyTamvPassToken(issued.accessToken, "https://api.example.test");
    assert.equal(claims.tamv_role, "member");
  }
});

test("rejects missing or inconsistent role claims and duplicated scopes", async () => {
  const privateKey = await importPKCS8(currentPrivatePem, "RS256");
  const sign = (claims) => new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", typ: "tamv-pass+jwt", kid: "test-current-key" })
    .setIssuer("https://issuer.example.test")
    .setAudience("https://api.example.test")
    .setSubject("role-validation-user")
    .setIssuedAt()
    .setExpirationTime("180s")
    .setJti("role-validation-token")
    .sign(privateKey);

  await assert.rejects(
    async () => verifyTamvPassToken(await sign({ token_use: "tamv_pass", tamv_version: 1, scope: "tamv:read" }), "https://api.example.test"),
    /role claim is invalid/,
  );
  await assert.rejects(
    async () => verifyTamvPassToken(await sign({ token_use: "tamv_pass", tamv_version: 1, scope: "profile:read", tamv_role: "admin" }), "https://api.example.test"),
    /role claim is invalid/,
  );
  await assert.rejects(
    async () => verifyTamvPassToken(await sign({ token_use: "tamv_pass", tamv_version: 1, scope: "profile:read profile:read" }), "https://api.example.test"),
    /duplicated scopes/,
  );
});

test("requires explicit scopes rather than silently disclosing a default profile", async () => {
  await assert.rejects(
    () => createTamvPassToken(subject, "https://api.example.test"),
    /Scopes must be explicitly requested/,
  );
});

test("refuses an audience not explicitly allowlisted and an unsupported scope", async () => {
  await assert.rejects(
    () => createTamvPassToken(subject, "https://attacker.example.test", ["profile:read"]),
    /not allowlisted/,
  );
  await assert.rejects(
    () => createTamvPassToken(subject, "https://api.example.test", ["admin:all"]),
    /scopes are not supported/,
  );
});

test("rejects a correctly signed token after its expiration", async () => {
  const privateKey = await importPKCS8(currentPrivatePem, "RS256");
  const expiredToken = await new SignJWT({
    token_use: "tamv_pass",
    tamv_version: 1,
    scope: "profile:read",
  })
    .setProtectedHeader({ alg: "RS256", typ: "tamv-pass+jwt", kid: "test-current-key" })
    .setIssuer("https://issuer.example.test")
    .setAudience("https://api.example.test")
    .setSubject("expired-user")
    .setIssuedAt()
    .setExpirationTime("-10s")
    .setJti("expired-token-test")
    .sign(privateKey);

  await assert.rejects(
    () => verifyTamvPassToken(expiredToken, "https://api.example.test"),
  );
});

test("verifier rejects audience substitution and a modified signature", async () => {
  const issued = await createTamvPassToken(subject, "https://api.example.test", ["profile:read"]);
  await assert.rejects(
    () => verifyTamvPassToken(issued.accessToken, "https://worker.example.test"),
  );

  const parts = issued.accessToken.split(".");
  assert.equal(parts.length, 3);
  parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
  await assert.rejects(
    () => verifyTamvPassToken(parts.join("."), "https://api.example.test"),
  );
});

test("publishes only public JWKS material and does not claim to be OpenID Connect", async () => {
  const result = await getTamvPassJwks();
  assert.equal(result.keys.length, 1);
  assert.equal(result.keys[0].kty, "RSA");
  assert.equal(result.keys[0].alg, "RS256");
  assert.equal(result.keys[0].use, "sig");
  assert.equal(result.keys[0].kid, "test-current-key");
  for (const privateField of ["d", "p", "q", "dp", "dq", "qi", "oth", "k"]) {
    assert.equal(privateField in result.keys[0], false, "JWKS must not expose private key material");
  }

  const metadata = getTamvPassMetadata();
  assert.equal(metadata.openid_connect, false);
  assert.equal(metadata.protocol, "tamv-pass-session-exchange-v1");
  assert.equal(metadata.token_lifetime_seconds, 180);
  assert.deepEqual(metadata.scopes_supported, ["profile:read", "tamv:read"]);
});

test("supports a planned signing-key rotation overlap using a previous public key only", async () => {
  const previousPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const previousPrivatePem = previousPair.privateKey.export({ format: "pem", type: "pkcs8" }).toString();
  const previousPublicPem = previousPair.publicKey.export({ format: "pem", type: "spki" }).toString();
  const previousPrivate = await importPKCS8(previousPrivatePem, "RS256");
  const oldToken = await new SignJWT({
    token_use: "tamv_pass",
    tamv_version: 1,
    scope: "profile:read",
  })
    .setProtectedHeader({ alg: "RS256", typ: "tamv-pass+jwt", kid: "test-previous-key" })
    .setIssuer("https://issuer.example.test")
    .setAudience("https://api.example.test")
    .setSubject("legacy-user")
    .setIssuedAt()
    .setExpirationTime("180s")
    .setJti("previous-key-test")
    .sign(previousPrivate);

  process.env.TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64 = Buffer.from(previousPublicPem).toString("base64");
  process.env.TAMV_PASS_PREVIOUS_KEY_ID = "test-previous-key";

  const jwks = await getTamvPassJwks();
  assert.deepEqual(jwks.keys.map((key) => key.kid), ["test-current-key", "test-previous-key"]);
  const claims = await verifyTamvPassToken(oldToken, "https://api.example.test");
  assert.equal(claims.sub, "legacy-user");
  assert.equal(claims.scope, "profile:read");

  delete process.env.TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64;
  delete process.env.TAMV_PASS_PREVIOUS_KEY_ID;
});

test("feature flag can be closed without issuing tokens", async () => {
  process.env.TAMV_PASS_ENABLED = "false";
  assert.equal(isTamvPassEnabled(), false);
  await assert.rejects(
    () => createTamvPassToken(subject, "https://api.example.test", ["profile:read"]),
    /TAMV Pass is disabled/,
  );
  process.env.TAMV_PASS_ENABLED = "true";
});

test("fails closed when the signing key is removed or malformed", async () => {
  const preserved = process.env.TAMV_PASS_PRIVATE_KEY_B64;
  delete process.env.TAMV_PASS_PRIVATE_KEY_B64;
  await assert.rejects(() => createTamvPassToken(subject, "https://api.example.test", ["profile:read"]));
  process.env.TAMV_PASS_PRIVATE_KEY_B64 = "not-a-pem";
  await assert.rejects(() => createTamvPassToken(subject, "https://api.example.test"));
  process.env.TAMV_PASS_PRIVATE_KEY_B64 = preserved;
});
