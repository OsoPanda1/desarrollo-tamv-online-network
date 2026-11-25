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
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("provenance API returns a bounded client error when the body stream fails", async () => {
  const brokenBody = new ReadableStream({
    start(controller) {
      controller.error(new Error("simulated transport failure"));
    },
  });
  const requestWithBrokenBody = new Request("https://tamv.online/api/v1/provenance/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: brokenBody,
    duplex: "half",
  });
  const response = await POST(requestWithBrokenBody);
  const result = await response.json();
  assert.equal(response.status, 400);
  assert.equal(result.error, "request_body_unreadable");
  assert.equal(JSON.stringify(result).includes("simulated transport failure"), false);
});

test("provenance API classifies a locked request body without throwing", async () => {
  const lockedRequest = request(JSON.stringify(validRecord));
  const bodyReader = lockedRequest.body.getReader();
  try {
    const response = await POST(lockedRequest);
    const result = await response.json();
    assert.equal(response.status, 400);
    assert.equal(result.error, "request_body_unreadable");
  } finally {
    bodyReader.releaseLock();
  }
});

test("provenance API rejects malformed JSON and unsupported content types", async () => {
  assert.equal((await POST(request("{", "application/json"))).status, 400);
  assert.equal((await POST(request(JSON.stringify(validRecord), "text/plain"))).status, 415);
});

test("provenance API rejects invalid UTF-8 without reflecting request bytes", async () => {
  const body = new Uint8Array([0x7b, 0xff, 0x7d]);
  const response = await POST(request(body));
  const result = await response.json();
  assert.equal(response.status, 400);
  assert.equal(result.error, "invalid_utf8");
  assert.equal(JSON.stringify(result).includes("�"), false);
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

test("provenance API handles malformed URI values as schema errors", async () => {
  const invalid = { ...validRecord, sourceUri: "http://[" };
  const response = await POST(request(JSON.stringify(invalid)));
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.equal(result.error, "schema_validation_failed");
  assert.ok(result.issues.length > 0);
});

test("provenance API rejects private, local and credentialed source URIs before any fetch", async () => {
  const unsafeUris = [
    "http://127.0.0.1/latest/meta-data/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.5/internal",
    "http://localhost:3000/secret",
    "https://user:pass@example.org/record",
    "http://[::1]/record",
  ];
  for (const sourceUri of unsafeUris) {
    const response = await POST(request(JSON.stringify({ ...validRecord, sourceUri })));
    const result = await response.json();
    assert.equal(response.status, 422, sourceUri);
    assert.equal(result.error, "schema_validation_failed", sourceUri);
  }
});

test("provenance API rejects mismatched digest length and timezone-free timestamps", async () => {
  const invalidDigest = { ...validRecord, contentDigest: { algorithm: "sha-256", value: "a".repeat(63) } };
  const invalidTimestamp = { ...validRecord, observedAt: "2026-11-23T12:00:00" };

  assert.equal((await POST(request(JSON.stringify(invalidDigest)))).status, 422);
  assert.equal((await POST(request(JSON.stringify(invalidTimestamp)))).status, 422);
});

test("provenance API enforces payload size limit", async () => {
  const response = await POST(request("x".repeat(64 * 1024 + 1)));
  const result = await response.json();
  assert.equal(response.status, 413);
  assert.equal(result.error, "payload_too_large");
  assert.equal(result.maxBytes, 64 * 1024);
});
