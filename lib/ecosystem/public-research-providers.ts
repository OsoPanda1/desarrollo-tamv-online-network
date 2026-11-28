import "server-only";
import { isIP } from "node:net";
import type { InstitutionalResearchResult, InstitutionalSearchFetch } from "./institutional-research.ts";

export const PUBLIC_RESEARCH_PROVIDER_TIMEOUT_MS = 4_000;
export const PUBLIC_RESEARCH_MAX_RESPONSE_BYTES = 256 * 1024;
export const PUBLIC_RESEARCH_MAX_RESULTS_PER_PROVIDER = 4;
export const PUBLIC_RESEARCH_MAX_TOTAL_RESULTS = 24;

export type PublicResearchResult = InstitutionalResearchResult["results"][number];
export type PublicResearchProviderState = InstitutionalResearchResult["providers"][number];
export type PublicResearchSearchResult = Omit<InstitutionalResearchResult, "type"> & { type: "research" };
export type PublicResearchFetch = InstitutionalSearchFetch;

type JsonRecord = Record<string, unknown>;
type ProviderRequest = { url: URL; method: "GET" | "POST"; body?: string };
type ProviderOutcome = { state: PublicResearchProviderState; results: PublicResearchResult[] };

type ProviderDefinition = {
  id: string;
  name: string;
  note: string;
  evidenceClass: string;
  request: (query: string) => ProviderRequest;
  entries: (payload: unknown) => unknown[] | null;
  normalize: (value: unknown, retrievedAt: string, provider: ProviderDefinition) => PublicResearchResult | null;
};

const EVIDENCE_BOUNDARY = "Source-declared metadata only; no verified authorship, peer review, quality, endorsement, partnership, or access rights. A declared license is not a reuse permission granted by TAMV.";
const PUBLIC_RESEARCH_METHODOLOGY = "Direct anonymous metadata search across fixed Zenodo, Figshare, DataCite, OSF and CERN Open Data HTTPS endpoints. At most 4 records per provider and 24 overall, deduplicated by provider:id. Credentials are omitted, redirects are rejected, each provider has a 4-second timeout and responses are bounded to 256 KiB. OSF is a title-filtered metadata bridge, not full-text search. Individual provider failures do not discard successful results; source order is not a quality ranking.";

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function boundedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}

function identifier(value: unknown): string | null {
  const text = boundedText(value, 1200);
  if (text) return text;
  return typeof value === "number" && Number.isSafeInteger(value) ? String(value) : null;
}

function firstText(record: JsonRecord | null, keys: string[], maxLength: number): string | null {
  if (!record) return null;
  for (const key of keys) {
    const text = boundedText(record[key], maxLength);
    if (text) return text;
  }
  return null;
}

function resourceType(value: unknown): string | null {
  const text = boundedText(value, 100);
  if (text) return text;
  return firstText(asRecord(value), ["type", "name", "title", "resourceTypeGeneral"], 100);
}

function declaredLicense(value: unknown): string | null {
  const text = boundedText(value, 240);
  if (text) return text;
  return firstText(asRecord(value), ["id", "name", "title"], 240);
}

function dataCiteLicense(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const entry of value) {
    const rights = asRecord(entry);
    if (firstText(rights, ["rightsIdentifierScheme"], 40)?.toLowerCase() === "spdx") {
      const license = firstText(rights, ["rightsIdentifier"], 240);
      if (license) return license;
    }
  }
  return null;
}

function sourceAuthors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const authors: string[] = [];
  for (const entry of value) {
    const name = typeof entry === "string"
      ? boundedText(entry, 120)
      : firstText(asRecord(entry), ["name"], 120);
    if (name) authors.push(name);
    if (authors.length === 12) break;
  }
  return authors;
}

function sourceYear(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  const text = boundedText(value, 64);
  if (!text) return null;
  if (/^\d{4}$/.test(text)) return Number(text);
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return null;
  const year = new Date(parsed).getUTCFullYear();
  return Number.isSafeInteger(year) ? year : null;
}

function sourceCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function safeHttpsPublicUrl(value: unknown): string {
  const candidate = boundedText(value, 2048);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const publicHostname = hostname.includes(".")
      && isIP(hostname) === 0
      && hostname !== "localhost"
      && !hostname.endsWith(".localhost")
      && !hostname.endsWith(".local")
      && !hostname.endsWith(".internal")
      && !hostname.endsWith(".test")
      && !hostname.endsWith(".invalid");
    return url.protocol === "https:" && !url.username && !url.password && !url.port && publicHostname
      ? candidate
      : "";
  } catch {
    return "";
  }
}

function buildResult(
  provider: ProviderDefinition,
  fields: {
    id: unknown;
    title: unknown;
    url?: unknown;
    doi?: unknown;
    year?: unknown;
    authors?: unknown;
    venue?: unknown;
    resourceType?: unknown;
    citedByCount?: unknown;
    license?: unknown;
  },
  retrievedAt: string,
): PublicResearchResult | null {
  const id = identifier(fields.id);
  const title = boundedText(fields.title, 600);
  if (!id || !title) return null;
  return {
    id,
    provider: provider.name,
    title,
    url: safeHttpsPublicUrl(fields.url),
    doi: boundedText(fields.doi, 500),
    year: sourceYear(fields.year),
    authors: sourceAuthors(fields.authors),
    venue: boundedText(fields.venue, 240),
    resourceType: resourceType(fields.resourceType),
    citedByCount: sourceCount(fields.citedByCount),
    license: boundedText(fields.license, 240),
    openAccess: null,
    evidenceClass: provider.evidenceClass,
    retrievedAt,
  };
}

function queryUrl(endpoint: string, parameters: Record<string, string>): URL {
  const url = new URL(endpoint);
  url.search = new URLSearchParams(parameters).toString();
  return url;
}

function arrayEntries(payload: unknown, key: string): unknown[] | null {
  const record = asRecord(payload);
  const entries = record?.[key];
  return Array.isArray(entries) ? entries : null;
}

function hitsEntries(payload: unknown): unknown[] | null {
  return arrayEntries(asRecord(payload)?.hits, "hits");
}

function firstArrayRecord(value: unknown): JsonRecord | null {
  return Array.isArray(value) ? asRecord(value[0]) : null;
}

function dataCiteYear(attributes: JsonRecord | null): unknown {
  if (attributes?.publicationYear !== undefined) return attributes.publicationYear;
  if (!Array.isArray(attributes?.dates)) return null;
  const issued = attributes.dates.find((entry) => {
    const date = asRecord(entry);
    return firstText(date, ["dateType"], 40)?.toLowerCase() === "issued";
  });
  return firstText(asRecord(issued), ["date"], 64);
}

function provider(
  id: string,
  name: string,
  note: string,
  scope: string,
  definition: Omit<ProviderDefinition, "id" | "name" | "note" | "evidenceClass">,
): ProviderDefinition {
  return {
    id,
    name,
    note,
    evidenceClass: `${name} ${scope}. ${EVIDENCE_BOUNDARY}`,
    ...definition,
  };
}

// Fixed destinations prevent query values from selecting an upstream host or path.
const PUBLIC_RESEARCH_PROVIDERS: readonly ProviderDefinition[] = [
  provider("zenodo", "Zenodo", "Anonymous Zenodo Records API; public metadata only.", "public repository metadata", {
    request: (query) => ({
      url: queryUrl("https://zenodo.org/api/records", { q: query, size: "4", sort: "mostrecent" }),
      method: "GET",
    }),
    entries: hitsEntries,
    normalize: (value, retrievedAt, definition) => {
      const item = asRecord(value);
      const metadata = asRecord(item?.metadata);
      return buildResult(definition, {
        id: item?.id,
        title: metadata?.title,
        url: asRecord(item?.links)?.self_html,
        doi: metadata?.doi ?? item?.doi,
        year: metadata?.publication_date,
        authors: metadata?.creators,
        venue: metadata?.journal_title,
        resourceType: metadata?.resource_type,
        citedByCount: metadata?.citedByCount ?? item?.citedByCount,
        license: declaredLicense(metadata?.license),
      }, retrievedAt);
    },
  }),
  provider("figshare", "Figshare", "Anonymous Figshare Items Search API; public metadata only.", "public item metadata", {
    request: (query) => ({
      url: new URL("https://api.figshare.com/v3/items/search"),
      method: "POST",
      body: JSON.stringify({ search_for: query, limit: 4 }),
    }),
    entries: (payload) => Array.isArray(payload) ? payload : null,
    normalize: (value, retrievedAt, definition) => {
      const item = asRecord(value);
      return buildResult(definition, {
        id: item?.id,
        title: item?.title,
        url: item?.url_public_html,
        doi: item?.doi,
        year: item?.published_date,
        authors: item?.authors,
        venue: item?.journal_title,
        resourceType: item?.resource_type ?? item?.type,
        license: declaredLicense(item?.license),
      }, retrievedAt);
    },
  }),
  provider("datacite", "DataCite", "Anonymous DataCite DOI metadata API; source-declared fields only.", "DOI registry metadata", {
    request: (query) => ({
      url: queryUrl("https://api.datacite.org/dois", { query, "page[size]": "4" }),
      method: "GET",
    }),
    entries: (payload) => arrayEntries(payload, "data"),
    normalize: (value, retrievedAt, definition) => {
      const item = asRecord(value);
      const attributes = asRecord(item?.attributes);
      const title = firstArrayRecord(attributes?.titles)?.title;
      return buildResult(definition, {
        id: item?.id,
        title,
        url: attributes?.url,
        doi: attributes?.doi,
        year: dataCiteYear(attributes),
        authors: attributes?.creators,
        venue: firstArrayRecord(asRecord(attributes?.container)?.title)?.title
          ?? firstText(asRecord(attributes?.container), ["title"], 240),
        resourceType: asRecord(attributes?.types)?.resourceTypeGeneral
          ?? asRecord(attributes?.types)?.resourceType,
        citedByCount: attributes?.citationCount,
        license: dataCiteLicense(attributes?.rightsList),
      }, retrievedAt);
    },
  }),
  provider("osf", "OSF", "Title-filtered OSF preprints metadata bridge, not full-text search.", "title-filtered preprint metadata", {
    request: (query) => ({
      url: queryUrl("https://api.osf.io/v2/preprints/", { "filter[title]": query }),
      method: "GET",
    }),
    entries: (payload) => arrayEntries(payload, "data"),
    normalize: (value, retrievedAt, definition) => {
      const item = asRecord(value);
      const attributes = asRecord(item?.attributes);
      const licenseData = asRecord(asRecord(asRecord(item?.relationships)?.license)?.data);
      return buildResult(definition, {
        id: item?.id,
        title: attributes?.title,
        url: asRecord(item?.links)?.html,
        doi: attributes?.doi,
        year: attributes?.date_published,
        authors: attributes?.authors,
        resourceType: "preprint",
        license: firstText(attributes, ["default_license_id"], 240) ?? firstText(licenseData, ["id"], 240),
      }, retrievedAt);
    },
  }),
  provider("cern", "CERN Open Data", "Anonymous CERN Open Data records API; public metadata only.", "open-data record metadata", {
    request: (query) => ({
      url: queryUrl("https://opendata.cern.ch/api/records", { q: query, size: "4" }),
      method: "GET",
    }),
    entries: hitsEntries,
    normalize: (value, retrievedAt, definition) => {
      const item = asRecord(value);
      const metadata = asRecord(item?.metadata);
      return buildResult(definition, {
        id: item?.id,
        title: metadata?.title,
        url: asRecord(item?.links)?.self_html,
        doi: metadata?.doi,
        year: metadata?.publication_date ?? metadata?.date_published,
        authors: metadata?.authors,
        venue: metadata?.journal_title,
        resourceType: metadata?.resource_type ?? metadata?.type,
        citedByCount: metadata?.citedByCount ?? metadata?.citation_count,
        license: declaredLicense(metadata?.license),
      }, retrievedAt);
    },
  }),
];

type LimitedJsonResult =
  | { kind: "ok"; value: unknown }
  | { kind: "invalid" | "too_large" | "timeout" };

async function readLimitedJson(response: Response, signal: AbortSignal): Promise<LimitedJsonResult> {
  if (signal.aborted) return { kind: "timeout" };
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > PUBLIC_RESEARCH_MAX_RESPONSE_BYTES) {
    return { kind: "too_large" };
  }
  if (!response.body) return { kind: "invalid" };

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = response.body.getReader();
  } catch {
    return { kind: "invalid" };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > PUBLIC_RESEARCH_MAX_RESPONSE_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // Preserve the bounded-size classification if cancellation fails.
        }
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return signal.aborted ? { kind: "timeout" } : { kind: "invalid" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { kind: "ok", value: JSON.parse(text) as unknown };
  } catch {
    return { kind: "invalid" };
  }
}

function unavailable(definition: ProviderDefinition): ProviderOutcome {
  return {
    state: {
      id: definition.id,
      name: definition.name,
      status: "unavailable",
      count: 0,
      note: `${definition.note} No usable public response was returned for this request.`,
    },
    results: [],
  };
}

async function fetchProvider(
  definition: ProviderDefinition,
  query: string,
  fetcher: PublicResearchFetch,
): Promise<ProviderOutcome> {
  const request = definition.request(query);
  const timeoutSignal = AbortSignal.timeout(PUBLIC_RESEARCH_PROVIDER_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetcher(request.url, {
      method: request.method,
      headers: request.body
        ? { Accept: "application/json", "Content-Type": "application/json" }
        : { Accept: "application/json" },
      body: request.body,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: timeoutSignal,
    });
  } catch {
    return unavailable(definition);
  }
  if (!response.ok) return unavailable(definition);

  const body = await readLimitedJson(response, timeoutSignal);
  if (body.kind !== "ok") return unavailable(definition);

  let entries: unknown[] | null;
  try {
    entries = definition.entries(body.value);
  } catch {
    return unavailable(definition);
  }
  if (entries === null) return unavailable(definition);

  const retrievedAt = new Date().toISOString();
  const results: PublicResearchResult[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    let result: PublicResearchResult | null = null;
    try {
      result = definition.normalize(entry, retrievedAt, definition);
    } catch {
      result = null;
    }
    if (!result) continue;
    const key = `${result.provider}:${result.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(result);
    if (results.length === PUBLIC_RESEARCH_MAX_RESULTS_PER_PROVIDER) break;
  }

  if (entries.length > 0 && results.length === 0) return unavailable(definition);
  return {
    state: {
      id: definition.id,
      name: definition.name,
      status: results.length > 0 ? "ok" : "empty",
      count: results.length,
      note: results.length > 0 ? definition.note : `${definition.note} No matching records were returned.`,
    },
    results,
  };
}

// Server-only anonymous search with fixed destinations and no credential forwarding.
export async function fetchPublicResearchProviders(
  query: string,
  fetcher: PublicResearchFetch = fetch,
): Promise<PublicResearchSearchResult> {
  const outcomes = await Promise.all(
    PUBLIC_RESEARCH_PROVIDERS.map((definition) => fetchProvider(definition, query, fetcher)),
  );

  const results: PublicResearchResult[] = [];
  const seen = new Set<string>();
  for (const outcome of outcomes) {
    for (const result of outcome.results) {
      if (results.length >= PUBLIC_RESEARCH_MAX_TOTAL_RESULTS) break;
      const key = `${result.provider}:${result.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(result);
    }
    if (results.length >= PUBLIC_RESEARCH_MAX_TOTAL_RESULTS) break;
  }

  const providers = outcomes.map((outcome) => {
    const count = results.filter((result) => result.provider === outcome.state.name).length;
    return {
      ...outcome.state,
      count,
      status: outcome.state.status === "ok" && count === 0 ? "empty" as const : outcome.state.status,
    };
  });

  return {
    ok: true,
    query,
    type: "research",
    retrievedAt: new Date().toISOString(),
    results,
    providers,
    methodology: PUBLIC_RESEARCH_METHODOLOGY,
  };
}
