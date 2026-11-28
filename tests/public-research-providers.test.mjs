import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";

// Plain Node needs the application's server-only build guard stubbed.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export%20%7B%7D", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const {
  fetchPublicResearchProviders,
  PUBLIC_RESEARCH_MAX_RESPONSE_BYTES,
  PUBLIC_RESEARCH_MAX_TOTAL_RESULTS,
  PUBLIC_RESEARCH_PROVIDER_TIMEOUT_MS,
} = await import("../lib/ecosystem/public-research-providers.ts");

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const fixtures = {
  zenodo: {
    hits: {
      hits: [{
        id: 12345,
        doi: "10.5281/zenodo.12345",
        metadata: {
          title: "Open heritage metadata study",
          publication_date: "2025-03-04",
          creators: [{ name: "Source Author" }],
          resource_type: { type: "dataset" },
          license: { id: "CC-BY-4.0" },
          journal_title: "Open Metadata Journal",
        },
        links: { self_html: "https://zenodo.org/records/12345" },
        upstreamSecret: "zenodo-secret",
      }],
    },
  },
  figshare: [{
    id: 67890,
    title: "Community data stewardship",
    resource_type: "article",
    published_date: "2024-06-01T12:00:00Z",
    authors: [{ name: "Example Contributor" }],
    doi: "10.6084/m9.figshare.67890",
    url_public_html: "https://figshare.com/articles/dataset/67890",
    license: { name: "CC BY 4.0" },
    upstreamSecret: "figshare-secret",
  }],
  datacite: {
    data: [{
      id: "10.1234/example.2025.1",
      attributes: {
        doi: "10.1234/example.2025.1",
        titles: [{ title: "Reproducible metadata workflow" }],
        creators: [{ name: "Data Creator" }],
        publicationYear: 2025,
        types: { resourceTypeGeneral: "Software" },
        url: "https://example.org/research/123",
        rightsList: [{ rightsIdentifierScheme: "SPDX", rightsIdentifier: "CC0-1.0" }],
        container: { title: "Data Studies" },
        citationCount: 7,
      },
      upstreamSecret: "datacite-secret",
    }],
  },
  osf: {
    data: [{
      id: "abc12",
      type: "preprints",
      attributes: {
        title: "Title-only preprint example",
        date_published: "2025-01-02T10:00:00Z",
        doi: null,
        default_license_id: "",
        reviews_state: "accepted",
      },
      relationships: {
        contributors: { data: { id: "contributor-secret", type: "users" } },
        license: { data: { id: "563c1cf88c5e4a3877f9e96a", type: "licenses" } },
      },
      links: { html: "https://osf.io/preprints/psyarxiv/abc12/" },
      upstreamSecret: "osf-secret",
    }],
  },
  cern: {
    hits: {
      hits: [{
        id: "record-9001",
        metadata: {
          title: "Open collision data",
          authors: [{ name: "Example Collaboration" }],
          publication_date: "2023-07-08",
          type: { type: "Dataset" },
          license: { id: "CC0-1.0" },
          doi: "10.17182/hepdata.12345",
        },
        links: { self_html: "https://opendata.cern.ch/record/9001" },
        upstreamSecret: "cern-secret",
      }],
    },
  },
};

const emptyPayloads = {
  zenodo: { hits: { hits: [] } },
  figshare: [],
  datacite: { data: [] },
  osf: { data: [] },
  cern: { hits: { hits: [] } },
};

function providerFor(url) {
  if (url.hostname === "zenodo.org") return "zenodo";
  if (url.hostname === "api.figshare.com") return "figshare";
  if (url.hostname === "api.datacite.org") return "datacite";
  if (url.hostname === "api.osf.io") return "osf";
  if (url.hostname === "opendata.cern.ch") return "cern";
  return null;
}

function fixtureFetcher(overrides = {}) {
  return async (input) => {
    const url = new URL(String(input));
    const provider = providerFor(url);
    assert.ok(provider, `unexpected destination ${url.href}`);
    if (Object.hasOwn(overrides, provider)) return overrides[provider](url);
    return jsonResponse(fixtures[provider]);
  };
}

test("both OpenAPI files and both guides describe anonymous fallback limits and boundaries", () => {
  const documents = [
    "docs/api/openapi-v1-ecosystem.yaml",
    "public/openapi.yaml",
    "docs/api/public-api-quickstart.md",
    "docs/architecture/institutional-research-federation-v1.md",
  ].map((path) => readFileSync(path, "utf8"));
  for (const document of documents) {
    for (const provider of ["Zenodo", "Figshare", "DataCite", "OSF", "CERN Open Data"]) {
      assert.match(document, new RegExp(provider));
    }
    assert.match(document, /256 KiB/);
    assert.match(document, /title-filtered.*not full-text search/i);
    assert.match(document, /license.{0,160}(permission|reuse|rights)/i);
  }
  for (const document of documents.slice(0, 2)) {
    assert.match(document, /4-second timeout per provider/);
    assert.match(document, /4 records per provider and 24 overall/);
    assert.match(document, /TAMV Online Network — Public Research Providers/);
    assert.match(document, /organization query has no configured institutional bridge/);
  }
});

test("all five anonymous providers use fixed destinations, bounded requests and normalized source fields", async () => {
  const query = "open science & heritage https://attacker.example";
  const calls = [];
  const timeouts = [];
  const originalTimeout = AbortSignal.timeout;
  AbortSignal.timeout = (milliseconds) => {
    timeouts.push(milliseconds);
    return originalTimeout(milliseconds);
  };
  try {
    const result = await fetchPublicResearchProviders(query, async (input, init) => {
      calls.push({ url: new URL(String(input)), init });
      return fixtureFetcher()(input, init);
    });
    assert.equal(result.ok, true);
    assert.equal(result.query, query);
    assert.equal(result.type, "research");
    assert.equal(result.results.length, 5);
    assert.equal(result.providers.length, 5);
    assert.ok(Number.isFinite(Date.parse(result.retrievedAt)));
    assert.deepEqual(timeouts, [4000, 4000, 4000, 4000, 4000]);
    assert.ok(PUBLIC_RESEARCH_PROVIDER_TIMEOUT_MS <= 4000);
    assert.equal(PUBLIC_RESEARCH_MAX_TOTAL_RESULTS, 24);

    assert.deepEqual(calls.map((call) => call.url.origin), [
      "https://zenodo.org",
      "https://api.figshare.com",
      "https://api.datacite.org",
      "https://api.osf.io",
      "https://opendata.cern.ch",
    ]);
    assert.equal(calls[0].url.pathname, "/api/records");
    assert.equal(calls[0].url.searchParams.get("q"), query);
    assert.equal(calls[0].url.searchParams.get("size"), "4");
    assert.equal(calls[0].url.searchParams.get("sort"), "mostrecent");
    assert.equal(calls[1].url.pathname, "/v3/items/search");
    assert.equal(calls[1].init.method, "POST");
    assert.deepEqual(JSON.parse(calls[1].init.body), { search_for: query, limit: 4 });
    assert.equal(calls[2].url.pathname, "/dois");
    assert.equal(calls[2].url.searchParams.get("query"), query);
    assert.equal(calls[2].url.searchParams.get("page[size]"), "4");
    assert.equal(calls[3].url.pathname, "/v2/preprints/");
    assert.equal(calls[3].url.searchParams.get("filter[title]"), query);
    assert.equal(calls[4].url.pathname, "/api/records");
    assert.equal(calls[4].url.searchParams.get("q"), query);
    assert.equal(calls[4].url.searchParams.get("size"), "4");

    for (const call of calls) {
      assert.equal(call.init.credentials, "omit");
      assert.equal(call.init.redirect, "error");
      assert.equal(call.init.cache, "no-store");
      assert.ok(call.init.signal instanceof AbortSignal);
      assert.equal(call.init.headers.Authorization, undefined);
      assert.equal(call.init.headers.Cookie, undefined);
    }

    const byProvider = Object.fromEntries(result.results.map((item) => [item.provider, item]));
    assert.equal(byProvider.Zenodo.doi, "10.5281/zenodo.12345");
    assert.equal(byProvider.Zenodo.license, "CC-BY-4.0");
    assert.equal(byProvider.Zenodo.year, 2025);
    assert.deepEqual(byProvider.Zenodo.authors, ["Source Author"]);
    assert.equal(byProvider.Figshare.url, "https://figshare.com/articles/dataset/67890");
    assert.equal(byProvider.Figshare.license, "CC BY 4.0");
    assert.equal(byProvider.DataCite.venue, "Data Studies");
    assert.equal(byProvider.DataCite.citedByCount, 7);
    assert.equal(byProvider.DataCite.license, "CC0-1.0");
    assert.equal(byProvider["OSF"].resourceType, "preprint");
    assert.equal(byProvider["OSF"].license, "563c1cf88c5e4a3877f9e96a");
    assert.equal(byProvider["OSF"].doi, null);
    assert.deepEqual(byProvider["OSF"].authors, []);
    assert.equal(byProvider["CERN Open Data"].url, "https://opendata.cern.ch/record/9001");
    assert.equal(byProvider["CERN Open Data"].license, "CC0-1.0");
    for (const item of result.results) {
      assert.equal(item.openAccess, null);
      assert.match(item.evidenceClass, /no verified authorship, peer review, quality/i);
      assert.ok(Number.isFinite(Date.parse(item.retrievedAt)));
      assert.ok(item.url.startsWith("https://"));
    }
    assert.match(result.providers.find((state) => state.id === "osf").note, /title-filtered.*not full-text search/i);
    assert.match(result.methodology, /title-filtered metadata bridge, not full-text search/i);
    assert.doesNotMatch(JSON.stringify(result), /-secret/);
  } finally {
    AbortSignal.timeout = originalTimeout;
  }
});

test("partial provider failure preserves successful results and never reflects upstream details", async () => {
  const result = await fetchPublicResearchProviders("memoria viva", fixtureFetcher({
    datacite: async () => { throw new Error("datacite-secret-detail"); },
    figshare: async () => jsonResponse({ secret: "figshare-secret-detail" }, 429),
    osf: async () => jsonResponse(emptyPayloads.osf),
    cern: async () => jsonResponse(emptyPayloads.cern),
  }));
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].provider, "Zenodo");
  assert.deepEqual(result.providers.map(({ id, status, count }) => ({ id, status, count })), [
    { id: "zenodo", status: "ok", count: 1 },
    { id: "figshare", status: "unavailable", count: 0 },
    { id: "datacite", status: "unavailable", count: 0 },
    { id: "osf", status: "empty", count: 0 },
    { id: "cern", status: "empty", count: 0 },
  ]);
  assert.doesNotMatch(JSON.stringify(result), /secret-detail/);
});

test("redirect responses and timeout errors become unavailable without following or echoing details", async () => {
  const result = await fetchPublicResearchProviders("transport failures", fixtureFetcher({
    figshare: async () => new Response(null, { status: 302, headers: { location: "https://attacker.example/redirect" } }),
    datacite: async () => { throw new DOMException("timeout-secret-detail", "TimeoutError"); },
    osf: async () => jsonResponse(emptyPayloads.osf),
    cern: async () => jsonResponse(emptyPayloads.cern),
  }));
  assert.equal(result.results.length, 1);
  assert.equal(result.providers.find((state) => state.id === "figshare").status, "unavailable");
  assert.equal(result.providers.find((state) => state.id === "datacite").status, "unavailable");
  assert.doesNotMatch(JSON.stringify(result), /attacker\.example|timeout-secret-detail/);
});

test("unsafe source URLs become empty while safe public HTTPS URLs are preserved", async () => {
  const unsafeUrls = [
    "javascript:alert(1)",
    "http://zenodo.org/records/2",
    "https://127.0.0.1/private",
    "https://user:pass@zenodo.org/records/4",
    "https://localhost/private",
  ];
  const hits = unsafeUrls.map((url, index) => ({
    id: index + 1,
    metadata: { title: `Record ${index + 1}` },
    links: { self_html: url },
  }));
  hits.push({ id: 6, metadata: { title: "Safe record" }, links: { self_html: "https://zenodo.org/records/6" } });
  const result = await fetchPublicResearchProviders("safe urls", async (input) => {
    const provider = providerFor(new URL(String(input)));
    return provider === "zenodo"
      ? jsonResponse({ hits: { hits } })
      : jsonResponse(emptyPayloads[provider]);
  });
  assert.equal(result.results.length, 4);
  assert.deepEqual(result.results.map((item) => item.url), ["", "", "", ""]);
  assert.equal(result.providers[0].count, 4);

  const safeOnly = await fetchPublicResearchProviders("safe urls", async (input) => {
    const provider = providerFor(new URL(String(input)));
    return provider === "zenodo"
      ? jsonResponse({ hits: { hits: [hits[5]] } })
      : jsonResponse(emptyPayloads[provider]);
  });
  assert.equal(safeOnly.results[0].url, "https://zenodo.org/records/6");
});

test("malformed JSON, malformed containers, locked bodies and oversized bodies are isolated as unavailable", async () => {
  const locked = jsonResponse(fixtures.cern);
  const lock = locked.body.getReader();
  try {
    const result = await fetchPublicResearchProviders("bounded bodies", fixtureFetcher({
      figshare: async () => new Response("{", { status: 200 }),
      datacite: async () => jsonResponse({ data: "not-an-array", secret: "container-secret" }),
      osf: async () => locked,
      cern: async () => new Response("x".repeat(PUBLIC_RESEARCH_MAX_RESPONSE_BYTES + 1), { status: 200 }),
    }));
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].provider, "Zenodo");
    for (const id of ["figshare", "datacite", "osf", "cern"]) {
      const state = result.providers.find((candidate) => candidate.id === id);
      assert.equal(state.status, "unavailable", id);
      assert.equal(state.count, 0, id);
    }
    assert.doesNotMatch(JSON.stringify(result), /container-secret/);
    assert.ok(JSON.stringify(result).length < 5000);
  } finally {
    lock.releaseLock();
  }
});

test("declared response lengths above 256 KiB are rejected before parsing", async () => {
  const result = await fetchPublicResearchProviders("declared length", fixtureFetcher({
    figshare: async () => jsonResponse([], 200, { "content-length": String(PUBLIC_RESEARCH_MAX_RESPONSE_BYTES + 1) }),
  }));
  assert.equal(result.providers.find((state) => state.id === "figshare").status, "unavailable");
  assert.equal(result.results.length, 4);
});

test("records are deduplicated by provider:id and capped at four per provider", async () => {
  const ids = ["1", "1", "2", "3", "4", "5", "5"];
  const hits = ids.map((id) => ({ id, metadata: { title: `Duplicate fixture ${id}` } }));
  const result = await fetchPublicResearchProviders("duplicates", async (input) => {
    const provider = providerFor(new URL(String(input)));
    return provider === "zenodo"
      ? jsonResponse({ hits: { hits } })
      : jsonResponse(emptyPayloads[provider]);
  });
  assert.deepEqual(result.results.map((item) => item.id), ["1", "2", "3", "4"]);
  assert.equal(new Set(result.results.map((item) => `${item.provider}:${item.id}`)).size, 4);
  assert.equal(result.providers[0].status, "ok");
  assert.equal(result.providers[0].count, 4);
});

test("missing optional source metadata remains null or empty instead of being inferred", async () => {
  const result = await fetchPublicResearchProviders("minimal metadata", async (input) => {
    const provider = providerFor(new URL(String(input)));
    return provider === "zenodo"
      ? jsonResponse({ hits: { hits: [{ id: 1, metadata: { title: "Minimal source record" } }] } })
      : jsonResponse(emptyPayloads[provider]);
  });
  assert.equal(result.results.length, 1);
  assert.deepEqual(result.results[0], {
    id: "1",
    provider: "Zenodo",
    title: "Minimal source record",
    url: "",
    doi: null,
    year: null,
    authors: [],
    venue: null,
    resourceType: null,
    citedByCount: null,
    license: null,
    openAccess: null,
    evidenceClass: result.results[0].evidenceClass,
    retrievedAt: result.results[0].retrievedAt,
  });
});

test("deduplication keeps equal source ids from different providers", async () => {
  const result = await fetchPublicResearchProviders("provider scoped ids", async (input) => {
    const provider = providerFor(new URL(String(input)));
    if (provider === "zenodo") return jsonResponse({ hits: { hits: [{ id: 1, metadata: { title: "Zenodo record" } }] } });
    if (provider === "figshare") return jsonResponse([{ id: 1, title: "Figshare record" }]);
    return jsonResponse(emptyPayloads[provider]);
  });
  assert.deepEqual(result.results.map((item) => `${item.provider}:${item.id}`), ["Zenodo:1", "Figshare:1"]);
});

test("empty provider arrays are empty states while nonempty unusable records are unavailable", async () => {
  const empty = await fetchPublicResearchProviders("empty", async (input) =>
    jsonResponse(emptyPayloads[providerFor(new URL(String(input)))]),
  );
  assert.equal(empty.results.length, 0);
  assert.ok(empty.providers.every((state) => state.status === "empty" && state.count === 0));

  const invalid = await fetchPublicResearchProviders("invalid records", async (input) => {
    const provider = providerFor(new URL(String(input)));
    return provider === "zenodo"
      ? jsonResponse({ hits: { hits: [{ id: 1, metadata: {} }] } })
      : jsonResponse(emptyPayloads[provider]);
  });
  assert.equal(invalid.results.length, 0);
  assert.equal(invalid.providers[0].status, "unavailable");
  assert.equal(invalid.providers[0].count, 0);
});
