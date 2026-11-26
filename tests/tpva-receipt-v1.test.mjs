import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { canonicalReceiptBytes, canonicalizeReceiptPayload } from "../lib/proofs/canonical.ts";
import { hashReceiptPayload } from "../lib/proofs/hash.ts";
import { validateReceiptShape } from "../lib/proofs/validate.ts";
import { verifyReceipt, verifyReceiptSignature } from "../lib/proofs/verify.ts";

const VECTOR_DIR = "docs/specs/tpva-test-vectors";
const CHECKED_AT = "2026-11-25T12:00:00.000Z";
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

const keys = [
  { kid: "tpva-test-key-01", publicKey: publicKeyPem, status: "active" },
  { kid: "tpva-revoked-key-01", publicKey: publicKeyPem, status: "revoked" },
];

function vector(name) {
  return JSON.parse(readFileSync(resolve(process.cwd(), VECTOR_DIR, `${name}.receipt.json`), "utf8"));
}

function signVector(receipt, kid = "tpva-test-key-01") {
  const signed = structuredClone(receipt);
  signed.signature.kid = kid;
  signed.signature.value = sign(null, canonicalReceiptBytes(signed), privateKey).toString("hex");
  return signed;
}

function verify(name, options = {}) {
  const receipt = options.useStoredSignature ? vector(name) : signVector(vector(name), options.kid);
  return { receipt, result: verifyReceipt(receipt, { keys, now: CHECKED_AT }) };
}

test("TPVA canonicalization sorts nested keys and evidence/check arrays deterministically", () => {
  const base = vector("valid");
  const reordered = structuredClone(base);
  reordered.checks.reverse();
  reordered.evidence.reverse();
  reordered.issued_at = "2026-11-25T13:00:00+01:00";

  const canonical = canonicalizeReceiptPayload(base);
  assert.equal(canonicalizeReceiptPayload(reordered), canonical);
  assert.equal(canonical.includes('"revocation"'), false);
  assert.match(canonical, /"issued_at":"2026-11-25T12:00:00\.000Z"/);
  assert.ok(canonical.indexOf('"artifact_digest"') < canonical.indexOf('"checks"'));
  assert.match(hashReceiptPayload(base), /^sha256:[a-f0-9]{64}$/);
});

test("schema and specification are versioned and mark the contract as partial", () => {
  const schema = JSON.parse(readFileSync(resolve(process.cwd(), "docs/specs/tpva-receipt-v1.schema.json"), "utf8"));
  const spec = readFileSync(resolve(process.cwd(), "docs/specs/tpva-receipt-v1.md"), "utf8");

  assert.equal(schema.$id, "urn:tamv:spec:tpva-receipt:v1");
  assert.equal(schema.properties.signature.properties.algorithm.const, "Ed25519");
  assert.equal(schema.properties.checks.items.required.includes("mandatory"), true);
  assert.match(schema.properties.evidence.items.properties.path.pattern, /A-Za-z0-9/);
  assert.match(spec, /Estado: \*\*spec \/ Fase 1\*\*/);
  assert.match(spec, /No emite recibos productivos/);
  assert.match(spec, /No se afirma SLSA runtime/);
});

test("valid receipt verifies with a real in-memory Ed25519 key", () => {
  const { receipt, result } = verify("valid");
  assert.deepEqual(result, {
    state: "VERIFIED",
    reasons: [],
    receiptHash: hashReceiptPayload(receipt),
    checkedAt: CHECKED_AT,
  });
  assert.equal(verifyReceiptSignature(receipt, keys[0]), true);
});

test("optional check and documented limitations produce WITH NOTES", () => {
  const { result } = verify("with-notes");
  assert.equal(result.state, "WITH NOTES");
  assert.ok(result.reasons.includes("optional_check_not_passed"));
  assert.ok(result.reasons.includes("documented_limitations"));
});

test("external-review claims never become an external badge in offline verification", () => {
  const { result } = verify("external-claim");
  assert.equal(result.state, "WITH NOTES");
  assert.ok(result.reasons.includes("independent_claim_offline"));
  assert.ok(result.reasons.includes("external_claim_offline"));
  assert.equal(result.state.includes("VERIFIED"), false);
});

test("negative vectors fail closed with deterministic states", () => {
  const cases = [
    ["altered-hash", "FAILED", "receipt_hash_mismatch", { useStoredSignature: true }],
    ["invalid-signature", "FAILED", "signature_invalid", { useStoredSignature: true }],
    ["revoked-key", "REVOKED", "key_revoked", { kid: "tpva-revoked-key-01" }],
    ["unknown-key", "UNVERIFIED", "key_unavailable", { kid: "tpva-unknown-key-01" }],
    ["incomplete-receipt", "UNVERIFIED", "schema_invalid"],
    ["missing-evidence-ref", "UNVERIFIED", "evidence_ref_missing"],
    ["mandatory-failed", "FAILED", "mandatory_check_failed"],
    ["path-traversal", "UNVERIFIED", "schema_invalid"],
    ["oversized-evidence", "UNVERIFIED", "schema_invalid"],
    ["additional-property", "UNVERIFIED", "schema_invalid"],
    ["noncanonical-date", "UNVERIFIED", "schema_invalid"],
    ["external-without-provider", "UNVERIFIED", "schema_invalid"],
  ];

  for (const [name, state, reason, options] of cases) {
    const { result } = verify(name, options ?? {});
    assert.equal(result.state, state, `${name} state`);
    assert.ok(result.reasons.includes(reason), `${name} reason ${reason}`);
  }
});

test("malformed signature bytes and unreachable keys never return VERIFIED", () => {
  const receipt = signVector(vector("valid"));
  receipt.signature.value = "ff";
  assert.equal(verifyReceipt(receipt, { keys, now: CHECKED_AT }).state, "UNVERIFIED");

  const unknown = signVector(vector("valid"), "tpva-missing-key");
  assert.equal(verifyReceipt(unknown, { keys, now: CHECKED_AT }).state, "UNVERIFIED");
  assert.equal(verifyReceipt(null, { keys, now: CHECKED_AT }).state, "UNVERIFIED");
  assert.equal(verifyReceipt(vector("valid"), { now: CHECKED_AT }).state, "UNVERIFIED");
});

test("evidence paths reject traversal and absolute forms", () => {
  const invalid = validateReceiptShape(vector("path-traversal"));
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes("path has an invalid format")));
});

test("spec directory contains no private key material", () => {
  const files = [
    "docs/specs/tpva-receipt-v1.md",
    "docs/specs/tpva-test-vectors/README.md",
    "docs/specs/tpva-test-vectors/valid.receipt.json",
  ];
  for (const file of files) {
    const content = readFileSync(resolve(process.cwd(), file), "utf8");
    assert.doesNotMatch(content, /PRIVATE KEY|BEGIN OPENSSH|sk-[A-Za-z0-9]{20,}/);
  }
});
