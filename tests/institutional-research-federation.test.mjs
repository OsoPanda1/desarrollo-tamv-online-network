import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fetchInstitutionalResearch, getInstitutionalResearchSearchEndpoint } from "../lib/ecosystem/institutional-research.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export%20%7B%7D", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
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

const canonicalOpenApi = readFileSync("docs/api/openapi-v1-ecosystem.yaml", "utf8");
const publicOpenApi = readFileSync("public/openapi.yaml", "utf8");

test("both OpenAPI files document institutional and anonymous research bridges", () => {
  for (const document of [canonicalOpenApi, publicOpenApi]) {
    assert.match(document, /^  \/api\/v1\/research\/federated:\n/m);
    assert.match(document, /FederatedResearchRequest/);
    assert.match(document, /FederatedResearchResponse/);
    assert.match(document, /provider_not_configured/);
    assert.match(document, /origin_not_allowed/);
    assert.match(document, /does not share sessions/i);
    assert.match(document, /Zenodo, Figshare, DataCite, OSF and CERN Open Data/);
    assert.match(document, /4 records per provider and 24 overall/);
    assert.match(document, /title-filtered metadata bridge, not full-text search/);
    assert.match(document, /TAMV Online Network — Public Research Providers/);
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
      headers: { "content-type": "application/json", "origin": "https://tamv.online" },
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

test("route falls back to direct anonymous research providers when institutional configuration is absent", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  const originalFetch = globalThis.fetch;
  const destinations = [];
  delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    destinations.push(url.origin);
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    if (url.hostname === "zenodo.org") {
      return jsonResponse({ hits: { hits: [{
        id: 4242,
        metadata: { title: "Anonymous fallback record", publication_date: "2025-02-03" },
        links: { self_html: "https://zenodo.org/records/4242" },
      }] } });
    }
    if (url.hostname === "api.datacite.org") throw new Error("private-upstream-detail");
    if (url.hostname === "api.figshare.com") return jsonResponse([]);
    if (url.hostname === "api.osf.io") return jsonResponse({ data: [] });
    if (url.hostname === "opendata.cern.ch") return jsonResponse({ hits: { hits: [] } });
    throw new Error(`unexpected destination ${url.href}`);
  };
  try {
    const { POST } = await import("../app/api/v1/research/federated/route.ts");
    const response = await POST(new Request("https://tamv.online/api/v1/research/federated", {
      method: "POST",
      headers: { "content-type": "application/json", "origin": "https://tamv.online" },
      body: JSON.stringify({ query: "  memoria   viva  ", type: "research" }),
    }));
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(result.provider, "TAMV Online Network — Public Research Providers");
    assert.equal(result.query, "memoria viva");
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].provider, "Zenodo");
    assert.equal(result.providers.find((state) => state.id === "zenodo").status, "ok");
    assert.equal(result.providers.find((state) => state.id === "datacite").status, "unavailable");
    assert.match(result.methodology, /title-filtered metadata bridge, not full-text search/i);
    assert.doesNotMatch(JSON.stringify(result), /private-upstream-detail/);
    assert.deepEqual(new Set(destinations), new Set([
      "https://zenodo.org",
      "https://api.figshare.com",
      "https://api.datacite.org",
      "https://api.osf.io",
      "https://opendata.cern.ch",
    ]));
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("route preserves invalid institutional configuration and configured upstream errors", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    const { POST } = await import("../app/api/v1/research/federated/route.ts");
    const request = () => new Request("https://tamv.online/api/v1/research/federated", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://tamv.online" },
      body: JSON.stringify({ query: "memoria viva", type: "research" }),
    });

    process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "http://127.0.0.1/api/research/search";
    globalThis.fetch = async () => { calls += 1; throw new Error("must not be called"); };
    const invalid = await POST(request());
    assert.equal(invalid.status, 503);
    assert.deepEqual(await invalid.json(), { ok: false, error: "provider_configuration_invalid" });
    assert.equal(calls, 0);

    process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
    globalThis.fetch = async () => { calls += 1; return jsonResponse({ secret: "configured-upstream-secret" }, 503); };
    const failed = await POST(request());
    assert.equal(failed.status, 502);
    const failedBody = await failed.json();
    assert.deepEqual(failedBody, { ok: false, error: "provider_unavailable" });
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(failedBody), /configured-upstream-secret/);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("organization search has no fabricated direct fallback when the institutional bridge is absent", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  const originalFetch = globalThis.fetch;
  let called = false;
  delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  globalThis.fetch = async () => { called = true; throw new Error("must not be called"); };
  try {
    const { POST } = await import("../app/api/v1/research/federated/route.ts");
    const response = await POST(new Request("https://tamv.online/api/v1/research/federated", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://tamv.online" },
      body: JSON.stringify({ query: "memoria viva", type: "organizations" }),
    }));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, error: "provider_not_configured" });
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("route rejects cross-origin browser requests before invoking the provider", async () => {
  const { POST } = await import("../app/api/v1/research/federated/route.ts");
  const response = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST",
    headers: { "content-type": "application/json", "origin": "https://attacker.example" },
    body: JSON.stringify({ query: "memoria viva", type: "research" }),
  }));
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, error: "origin_not_allowed" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("route honors the public origin behind a proxy and rejects cross-site browser requests", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  const originalFetch = globalThis.fetch;
  let calls = 0;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  globalThis.fetch = async () => { calls += 1; return jsonResponse(validResearchResponse()); };
  const request = (headers) => new Request("http://internal:3000/api/v1/research/federated", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ query: "memoria viva" }),
  });
  try {
    const { POST } = await import("../app/api/v1/research/federated/route.ts");
    const accepted = await POST(request({
      origin: "https://tamv.online",
      host: "internal:3000",
      "x-forwarded-host": "tamv.online",
      "x-forwarded-proto": "https",
    }));
    assert.equal(accepted.status, 200);
    assert.equal(calls, 1);

    const serverToServer = await POST(request({}));
    assert.equal(serverToServer.status, 200);
    assert.equal(calls, 2);

    for (const headers of [
      { origin: "https://tamv.online", "sec-fetch-site": "cross-site" },
      { "sec-fetch-site": "cross-site" },
    ]) {
      const rejected = await POST(request(headers));
      assert.equal(rejected.status, 403);
      assert.deepEqual(await rejected.json(), { ok: false, error: "origin_not_allowed" });
    }
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});

test("route rejects unsupported media types, malformed JSON and client-supplied destinations", async () => {
  const { POST } = await import("../app/api/v1/research/federated/route.ts");
  const unsupported = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "text/plain", origin: "https://tamv.online" }, body: "memoria viva",
  }));
  assert.equal(unsupported.status, 415);

  const malformed = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "application/json", origin: "https://tamv.online" }, body: "{",
  }));
  assert.equal(malformed.status, 400);

  const invalidQuery = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "application/json", origin: "https://tamv.online" },
    body: JSON.stringify({ query: "memoria viva", url: "https://attacker.example/" }),
  }));
  assert.equal(invalidQuery.status, 422);

  const oversized = await POST(new Request("https://tamv.online/api/v1/research/federated", {
    method: "POST", headers: { "content-type": "application/json", origin: "https://tamv.online" }, body: JSON.stringify({ query: "x".repeat(2500) }),
  }));
  assert.equal(oversized.status, 413);
});

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

test("adapter fails closed when the configured endpoint is invalid", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "http://127.0.0.1/api/research/search";
  try {
    let called = false;
    const result = await fetchInstitutionalResearch("memoria viva", "research", async () => {
      called = true;
      throw new Error("network must not be called");
    });
    assert.deepEqual(result, { ok: false, error: "provider_configuration_invalid", httpStatus: 503 });
    assert.equal(called, false);
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

test("adapter classifies a locked upstream response body without throwing", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  const response = jsonResponse(validResearchResponse());
  const lock = response.body.getReader();
  try {
    const result = await fetchInstitutionalResearch("memoria viva", "research", async () => response);
    assert.deepEqual(result, { ok: false, error: "provider_invalid_response", httpStatus: 502 });
  } finally {
    lock.releaseLock();
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

    for (const unsafeUrl of ["https://127.0.0.1/private", "https://localhost/private", "https://localhost./private", "https://user@openalex.org/works/W1", "http://openalex.org/works/W1"]) {
      const unsafe = await fetchInstitutionalResearch("memoria viva", "research", async () =>
        jsonResponse({
          ...validResearchResponse(),
          results: [{ ...validResearchResponse().results[0], url: unsafeUrl }],
        }),
      );
      assert.deepEqual(unsafe, { ok: false, error: "provider_invalid_response", httpStatus: 502 });
    }

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


test("adapter strips unexpected top-level fields from the institutional provider response", async () => {
  const previous = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
  process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = "https://research.tamv.online/api/research/search";
  try {
    const upstream = {
      ...validResearchResponse("memoria viva", "research"),
      internalDebugToken: "must-not-cross-the-federation-boundary",
      unexpectedPrivateContext: { operatorNote: "must-not-be-forwarded" },
    };
    const result = await fetchInstitutionalResearch("memoria viva", "research", async () =>
      jsonResponse(upstream),
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal("internalDebugToken" in result.data, false);
      assert.equal("unexpectedPrivateContext" in result.data, false);
      assert.equal(result.data.query, "memoria viva");
      assert.equal(result.data.results.length, 1);
    }
  } finally {
    if (previous === undefined) delete process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL;
    else process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL = previous;
  }
});
