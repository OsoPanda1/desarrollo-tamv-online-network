import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchInstitutionalResearch, getInstitutionalResearchSearchEndpoint } from "../lib/ecosystem/institutional-research.ts";

const canonicalOpenApi = readFileSync("docs/api/openapi-v1-ecosystem.yaml", "utf8");
const publicOpenApi = readFileSync("public/openapi.yaml", "utf8");

test("both OpenAPI files document the institutional research bridge", () => {
  for (const document of [canonicalOpenApi, publicOpenApi]) {
    assert.match(document, /\/api\/v1\/research\/federated/);
    assert.match(document, /FederatedResearchRequest/);
    assert.match(document, /FederatedResearchResponse/);
    assert.match(document, /provider_not_configured/);
    assert.match(document, /does not share sessions/i);
  }
});

test("route validates JSON and returns normalized bounded public results", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  const originalFetch = globalThis.fetch;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  globalThis.fetch = async (_input, _init) => jsonResponse(validResearchResponse("memoria viva"));
  try {
    const { POST } = await import("../app/api/v1/research/federated/route.ts");
    const response = await POST(new Request("https://tamv.online/api/v1/research/federated", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "  memoria   viva  " }),
    }));
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(result.query, "memoria viva");
    assert.equal(result.type, "research");
    assert.equal(result.results.length, 1);
    assert.match(result.semantics, /does not establish authorship/i);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("route rejects unsupported media types, malformed JSON and client-supplied destinations", async () => {
  const { POST } = await import("../app/api/v1/research/federated/route.ts");
  const unsupported = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "text/plain" }, body: "memoria viva",
  }));
  assert.equal(unsupported.status, 415);

  const malformed = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{",
  }));
  assert.equal(malformed.status, 400);

  const invalidQuery = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "memoria viva", url: "https://attacker.example/" }),
  }));
  assert.equal(invalidQuery.status, 422);
});

const validResearchResponse = (query = "memoria viva", type = "research") => ({
  ok: true,
  query,
  type,
  retrievedAt: "2026-11-24T10:00:00.000Z",
  results: [{
    id: "https://openalex.org/W123",
    provider: "OpenAlex",
    title: "Public metadata example",
    url: "https://openalex.org/W123",
    doi: "10.1000/example",
    year: 2025,
    authors: ["Example Author"],
    venue: null,
    resourceType: "article",
    citedByCount: 0,
    license: null,
    openAccess: null,
    evidenceClass: "Public bibliographic metadata; no peer-review claim.",
    retrievedAt: "2026-11-24T10:00:00.000Z",
  }],
  providers: [{ id: "openalex", name: "OpenAlex", status: "ok", count: 1, note: "Public API" }],
  methodology: "Public metadata only.",
});

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

test("endpoint configuration accepts only HTTPS public search URL and blocks private targets", () => {
  assert.equal(getInstitutionalResearchSearchEndpoint("https://research.tamv.online/api/research/search")?.pathname, "/api/research/search");
  assert.equal(getInstitutionalResearchSearchEndpoint("http://research.tamv.online/api/research/search"), null);
  assert.equal(getInstitutionalResearchSearchEndpoint("https://127.0.0.1/api/research/search"), null);
  assert.equal(getInstitutionalResearchSearchEndpoint("https://localhost/api/research/search"), null);
  assert.equal(getInstitutionalResearchSearchEndpoint("https://research.tamv.online/other"), null);
  assert.equal(getInstitutionalResearchSearchEndpoint("https://research.tamv.online/api/research/search?target=x"), null);
  assert.equal(getInstitutionalResearchSearchEndpoint("https://user:pass@research.tamv.online/api/research/search"), null);
});

test("adapter posts only query/type and validates a minimal public metadata response", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  let capturedUrl;
  let capturedInit;
  try {
    const result = await fetchInstitutionalResearch("memoria viva", "research", async (input, init) => {
      capturedUrl = new URL(String(input));
      capturedInit = init;
      return jsonResponse(validResearchResponse());
    });
    assert.equal(capturedUrl.origin, "https://research.tamv.online");
    assert.equal(capturedUrl.pathname, "/api/research/search");
    assert.equal(capturedInit.method, "POST");
    assert.equal(capturedInit.credentials, "omit");
    assert.equal(capturedInit.redirect, "error");
    assert.equal(capturedInit.cache, "no-store");
    assert.equal(capturedInit.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(capturedInit.body), { query: "memoria viva", type: "research" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.results.length, 1);
      assert.equal(result.data.results[0].title, "Public metadata example");
    }
  } finally {
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("adapter fails closed when the provider is not configured", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  try {
    let called = false;
    const result = await fetchInstitutionalResearch("memoria viva", "research", async () => {
      called = true;
      throw new Error("network must not be called");
    });
    assert.deepEqual(result, { ok: false, error: "provider_not_configured", httpStatus: 503 });
    assert.equal(called, false);
  } finally {
    if (previous !== undefined) process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("adapter classifies rate limits, timeout and upstream failure without reflecting provider bodies", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  try {
    const limited = await fetchInstitutionalResearch("memoria viva", "research", async () => jsonResponse({ secret: "no-echo" }, 429));
    assert.deepEqual(limited, { ok: false, error: "provider_rate_limited", httpStatus: 503 });

    const timeout = await fetchInstitutionalResearch("memoria viva", "research", async () => {
      throw new DOMException("opaque upstream details", "TimeoutError");
    });
    assert.deepEqual(timeout, { ok: false, error: "provider_timeout", httpStatus: 504 });

    const unavailable = await fetchInstitutionalResearch("memoria viva", "research", async () => jsonResponse({ secret: "no-echo" }, 503));
    assert.deepEqual(unavailable, { ok: false, error: "provider_unavailable", httpStatus: 502 });
  } finally {
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("adapter rejects wrong query, invalid URLs, malformed JSON and oversized responses", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  try {
    const wrongQuery = await fetchInstitutionalResearch("memoria viva", "research", async () =>
      jsonResponse(validResearchResponse("different query")),
    );
    assert.deepEqual(wrongQuery, { ok: false, error: "provider_invalid_response", httpStatus: 502 });

    const invalidUrl = await fetchInstitutionalResearch("memoria viva", "research", async () =>
      jsonResponse({
        ...validResearchResponse(),
        results: [{ ...validResearchResponse().results[0], url: "javascript:alert(1)" }],
      }),
    );
    assert.deepEqual(invalidUrl, { ok: false, error: "provider_invalid_response", httpStatus: 502 });

    const malformed = await fetchInstitutionalResearch("memoria viva", "research", async () =>
      new Response("{", { status: 200, headers: { "content-type": "application/json" } }),
    );
    assert.deepEqual(malformed, { ok: false, error: "provider_invalid_response", httpStatus: 502 });

    const oversized = await fetchInstitutionalResearch("memoria viva", "research", async () =>
      new Response("x".repeat(256 * 1024 + 1), { status: 200 }),
    );
    assert.deepEqual(oversized, { ok: false, error: "provider_response_too_large", httpStatus: 502 });
  } finally {
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});
