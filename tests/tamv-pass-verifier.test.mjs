import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "node:http";
import test from "node:test";
import { exportJWK, importPKCS8, SignJWT } from "jose";
import { verifyTamvPassAccessToken } from "../lib/tamv-pass/verifier.ts";

const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKey = await importPKCS8(
  pair.privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
  "RS256",
);
const jwk = await exportJWK(pair.publicKey);
jwk.kid = "remote-test-key";
jwk.alg = "RS256";
jwk.use = "sig";
jwk.key_ops = ["verify"];

const server = createServer((request, response) => {
  if (request.url !== "/.well-known/jwks.json") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60",
  });
  response.end(JSON.stringify({ keys: [jwk] }));
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
if (!address || typeof address === "string") throw new Error("Test JWKS server did not bind a TCP port.");
const issuer = "http://127.0.0.1:" + address.port;
process.env.NODE_ENV = "test";
process.env.TAMV_PASS_ISSUER = issuer;

async function signedToken(audience = "https://api.example.test") {
  return new SignJWT({
    token_use: "tamv_pass",
    tamv_version: 1,
    scope: "profile:read",
  })
    .setProtectedHeader({ alg: "RS256", typ: "tamv-pass+jwt", kid: "remote-test-key" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject("remote-user-42")
    .setIssuedAt()
    .setExpirationTime("180s")
    .setJti("remote-token-test")
    .sign(privateKey);
}

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("resource-server verifier consumes a public JWKS without the issuer private key", async () => {
  const token = await signedToken();
  const identity = await verifyTamvPassAccessToken(token, "https://api.example.test");

  assert.equal(identity.subject, "remote-user-42");
  assert.deepEqual(identity.scopes, ["profile:read"]);
  assert.equal(identity.claims.iss, issuer);
  assert.equal(identity.claims.aud, "https://api.example.test");
});

test("resource-server verifier refuses a different audience and a malformed token", async () => {
  const token = await signedToken();
  await assert.rejects(
    () => verifyTamvPassAccessToken(token, "https://different-api.example.test"),
  );
  await assert.rejects(
    () => verifyTamvPassAccessToken("not-a-jwt", "https://api.example.test"),
  );
});

test("resource-server verifier rejects a known but expired signature", async () => {
  const token = await new SignJWT({
    token_use: "tamv_pass",
    tamv_version: 1,
    scope: "profile:read",
  })
    .setProtectedHeader({ alg: "RS256", typ: "tamv-pass+jwt", kid: "remote-test-key" })
    .setIssuer(issuer)
    .setAudience("https://api.example.test")
    .setSubject("expired-user")
    .setIssuedAt()
    .setExpirationTime("-10s")
    .setJti("expired-token-test")
    .sign(privateKey);

  await assert.rejects(
    () => verifyTamvPassAccessToken(token, "https://api.example.test"),
  );
});
