import test from "node:test";
import assert from "node:assert/strict";
import { ecosystemSystems } from "../lib/ecosystem/registry.ts";
import { fetchPublicRepositoryMetadata } from "../lib/ecosystem/github-metadata.ts";

function payloadFor(system, overrides = {}) {
  const repository = new URL(system.repository);
  const [owner, name] = repository.pathname.split("/").filter(Boolean);
  return {
    id: 123456,
    full_name: `${owner}/${name}`,
    html_url: system.repository,
    private: false,
    archived: false,
    default_branch: "main",
    updated_at: "2026-11-24T00:00:00Z",
    pushed_at: null,
    language: "TypeScript",
    license: { spdx_id: "MIT" },
    ...overrides,
  };
}

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

test("metadata adapter calls only the fixed GitHub API and returns a minimal public projection", async () => {
  const system = ecosystemSystems[0];
  let capturedUrl;
  let capturedInit;
  const response = await fetchPublicRepositoryMetadata(system, async (input, init) => {
    capturedUrl = new URL(String(input));
    capturedInit = init;
    return jsonResponse(payloadFor(system));
  });

  assert.equal(capturedUrl.origin, "https://api.github.com");
  assert.equal(capturedUrl.pathname, "/repos/OsoPanda1/desarrollo-tamv-online-network");
  assert.equal(capturedInit.method, "GET");
  assert.equal(capturedInit.redirect, "error");
  assert.equal(capturedInit.headers.Authorization, undefined);
  assert.equal(capturedInit.headers.Accept, "application/vnd.github+json");
  assert.equal(response.sourceMetadataStatus, "metadata_available");
  assert.equal(response.metadata.fullName, "OsoPanda1/desarrollo-tamv-online-network");
  assert.equal(response.metadata.licenseSpdxId, "MIT");
  assert.equal("private" in response.metadata, false);
  assert.equal("default_branch" in response.metadata, false);
});

test("metadata adapter handles a missing or non-public repository without leaking details", async () => {
  const system = ecosystemSystems[1];
  const response = await fetchPublicRepositoryMetadata(system, async () => jsonResponse({ message: "Not Found" }, 404));
  assert.equal(response.sourceMetadataStatus, "not_found");
  assert.equal(response.metadata, null);
  assert.equal("message" in response, false);
});

test("metadata adapter classifies GitHub rate limiting and timeout", async () => {
  const system = ecosystemSystems[2];
  const limited = await fetchPublicRepositoryMetadata(system, async () =>
    jsonResponse({ message: "rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0" }),
  );
  assert.equal(limited.sourceMetadataStatus, "rate_limited");

  const timeout = await fetchPublicRepositoryMetadata(system, async () => {
    throw new DOMException("do not expose upstream details", "TimeoutError");
  });
  assert.equal(timeout.sourceMetadataStatus, "timeout");
  assert.equal("message" in timeout, false);
});

test("metadata adapter rejects upstream identity mismatches, invalid JSON, and oversized payloads", async () => {
  const system = ecosystemSystems[3];
  const wrongIdentity = await fetchPublicRepositoryMetadata(system, async () =>
    jsonResponse(payloadFor(system, { full_name: "someone-else/private-project" })),
  );
  assert.equal(wrongIdentity.sourceMetadataStatus, "invalid_response");
  assert.equal(wrongIdentity.metadata, null);

  const invalidJson = await fetchPublicRepositoryMetadata(system, async () =>
    new Response("{", { status: 200, headers: { "content-type": "application/json" } }),
  );
  assert.equal(invalidJson.sourceMetadataStatus, "invalid_response");

  const oversized = await fetchPublicRepositoryMetadata(system, async () =>
    new Response("x".repeat(64 * 1024 + 1), { status: 200 }),
  );
  assert.equal(oversized.sourceMetadataStatus, "invalid_response");
});

test("metadata adapter rejects unregistered hosts before issuing a request", async () => {
  const system = { ...ecosystemSystems[4], repository: "https://example.org/attacker/repository" };
  let called = false;
  const response = await fetchPublicRepositoryMetadata(system, async () => {
    called = true;
    throw new Error("should not call network");
  });
  assert.equal(called, false);
  assert.equal(response.sourceMetadataStatus, "invalid_response");
});

test("metadata endpoint returns eight per-repository results and labels its limited scope", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.github.com");
    const parts = url.pathname.split("/").filter(Boolean);
    assert.equal(parts[0], "repos");
    const system = ecosystemSystems.find((candidate) => {
      const repository = new URL(candidate.repository);
      const [owner, name] = repository.pathname.split("/").filter(Boolean);
      return owner.toLowerCase() === parts[1].toLowerCase() && name.toLowerCase() === parts[2].toLowerCase();
    });
    assert.ok(system);
    if (system.id === "litle-atlas-suite") {
      return jsonResponse({ message: "rate limited" }, 429);
    }
    return jsonResponse(payloadFor(system));
  };

  try {
    const { GET } = await import("../app/api/v1/ecosystem/metadata/route.ts");
    const response = await GET();
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(response.headers.get("cache-control") ?? "", /s-maxage=300/);
    assert.equal(body.schemaVersion, "1.0.0");
    assert.equal(body.systems.length, 8);
    assert.equal(new Set(body.systems.map((entry) => entry.systemId)).size, 8);
    assert.equal(body.systems.find((entry) => entry.systemId === "litle-atlas-suite").sourceMetadataStatus, "rate_limited");
    assert.equal(body.systems.filter((entry) => entry.sourceMetadataStatus === "metadata_available").length, 7);
    assert.match(body.scope, /does not assert deployed application health/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
