import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/v1/provenance/validate/route.ts";

const validRecord = {
  schemaVersion: "1.0.0",
  sourceUri: "https://github.com/OsoPanda1/desarrollo-tamv-online-network/commit/0123456789abcdef",
  sourceSystem: "github",
  sourceRecordId: "0123456789abcdef",
  sourceVersion: "0123456789abcdef",
  observedAt: "2026-11-23T12:00:00Z",
  license: null,
  contentDigest: { algorithm: "sha-256", value: "a".repeat(64) },
  validationState: "schema_valid",
  validationEvidenceUri: null,
  notes: null,
};

function request(body, contentType = "application/json", extraHeaders = {}) {
  return new Request("https://tamv.online/api/v1/provenance/validate", {
    method: "POST",
    headers: { "content-type": contentType, ...extraHeaders },
    body,
  });
}

test("provenance API returns valid schema result without claiming source truth", async () => {
  const response = await POST(request(JSON.stringify(validRecord)));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.valid, true);
  assert.equal(result.submittedValidationState, "schema_valid");
  assert.equal("validationState" in result, false);
  assert.match(result.semantics, /Schema validation only/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("provenance API rejects malformed JSON and unsupported content types", async () => {
  assert.equal((await POST(request("{", "application/json"))).status, 400);
  assert.equal((await POST(request(JSON.stringify(validRecord), "text/plain"))).status, 415);
});

test("provenance API returns validation issues without echoing submitted payload", async () => {
  const invalid = { ...validRecord, sourceUri: "javascript:alert(1)", secret: "must-not-be-echoed" };
  const response = await POST(request(JSON.stringify(invalid)));
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.equal(result.valid, false);
  assert.equal(result.error, "schema_validation_failed");
  assert.equal(JSON.stringify(result).includes("must-not-be-echoed"), false);
});

test("provenance API enforces payload size limit", async () => {
  const response = await POST(request("x".repeat(64 * 1024 + 1)));
  assert.equal(response.status, 413);
});
