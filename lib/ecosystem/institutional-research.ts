import { isIP } from "node:net";
import { isIP } from "node:net";
import { z } from "zod";

const MAX_RESPONSE_BYTES = 256 * 1024;
const UPSTREAM_TIMEOUT_MS = 9_000;

export type InstitutionalResearchType = "research" | "organizations";

const validDateTime = z.string().refine(
  (value) => value.length <= 64 && Number.isFinite(Date.parse(value)),
  "Expected a parseable date-time",
);

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.port
      && isIP(hostname) === 0
      && hostname.includes(".")
      && hostname !== "localhost"
      && !hostname.endsWith(".localhost")
      && !hostname.endsWith(".local")
      && !hostname.endsWith(".internal")
      && !hostname.endsWith(".test")
      && !hostname.endsWith(".invalid");
  } catch {
    return false;
  }
}

const researchItemSchema = z.object({
  id: z.string().min(1).max(1200),
  provider: z.string().min(1).max(120),
  title: z.string().min(1).max(600),
  url: z.string().max(2048).refine((value) => value === "" || isHttpsUrl(value), "Expected an HTTPS URL or an empty URL"),
  doi: z.string().max(500).nullable(),
  year: z.number().int().nullable(),
  authors: z.array(z.string().max(120)).max(12),
  venue: z.string().max(240).nullable(),
  resourceType: z.string().max(100).nullable(),
  citedByCount: z.number().finite().nullable(),
  license: z.string().max(240).nullable(),
  openAccess: z.boolean().nullable(),
  evidenceClass: z.string().min(1).max(1200),
  retrievedAt: validDateTime,
}).strict();

const providerStateSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(180),
  status: z.enum(["ok", "empty", "unavailable", "not_configured", "link_only"]),
  count: z.number().int().min(0).max(100_000),
  note: z.string().max(1200).optional(),
}).strict();

const institutionalSearchResponseSchema = z.object({
  ok: z.literal(true),
  query: z.string().min(3).max(180),
  type: z.enum(["research", "organizations"]),
  retrievedAt: validDateTime,
  results: z.array(researchItemSchema).max(24),
  providers: z.array(providerStateSchema).max(12),
  methodology: z.string().min(1).max(3000),
}).passthrough();

export type InstitutionalResearchResult = z.infer<typeof institutionalSearchResponseSchema>;

export type InstitutionalSearchFetch = (
  input: URL | RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

export type InstitutionalResearchError =
  | "provider_not_configured"
  | "provider_configuration_invalid"
  | "provider_timeout"
  | "provider_rate_limited"
  | "provider_unavailable"
  | "provider_response_too_large"
  | "provider_invalid_response";

export type InstitutionalResearchFetchResult =
  | { ok: true; data: InstitutionalResearchResult }
  | { ok: false; error: InstitutionalResearchError; httpStatus: 502 | 503 | 504 };

function isPublicLookingHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || isIP(host) !== 0 || !host.includes(".")) return false;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".test") ||
    host.endsWith(".invalid")
  ) return false;
  return true;
}

/**
 * The endpoint is configured by the deployment operator, never by the request caller.
 * Only an HTTPS origin with the exact public search path is accepted.
 */
export function getInstitutionalResearchSearchEndpoint(
  configuredValue: string | undefined = process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL,
): URL | null {
  if (!configuredValue?.trim()) return null;
  try {
    const url = new URL(configuredValue);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash ||
      url.pathname !== "/api/research/search" ||
      !isPublicLookingHost(url.hostname)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

type LimitedJsonResult =
  | { kind: "ok"; value: unknown }
  | { kind: "too_large" }
  | { kind: "invalid" }
  | { kind: "timeout" };

async function readLimitedJson(response: Response, signal: AbortSignal): Promise<LimitedJsonResult> {
  if (signal.aborted) return { kind: "timeout" };
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_RESPONSE_BYTES) {
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
      if (totalBytes > MAX_RESPONSE_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // Keep the bounded-size classification if the upstream refuses cancellation.
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

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

/**
 * Read-only, credential-free bridge to TAMV's institutional public research API.
 * The target comes only from deployment configuration; request data can never select
 * the network destination. Responses are validated and projected through a strict schema.
 */
export async function fetchInstitutionalResearch(
  query: string,
  type: InstitutionalResearchType,
  fetcher: InstitutionalSearchFetch = fetch,
): Promise<InstitutionalResearchFetchResult> {
  const endpoint = getInstitutionalResearchSearchEndpoint();
  if (!process.env.TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL?.trim()) {
    return { ok: false, error: "provider_not_configured", httpStatus: 503 };
  }
  if (!endpoint) {
    return { ok: false, error: "provider_configuration_invalid", httpStatus: 503 };
  }

  const timeoutSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, type }),
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: timeoutSignal,
    });
  } catch (error) {
    return (timeoutSignal.aborted || isTimeoutError(error))
      ? { ok: false, error: "provider_timeout", httpStatus: 504 }
      : { ok: false, error: "provider_unavailable", httpStatus: 502 };
  }

  if (response.status === 429) {
    return { ok: false, error: "provider_rate_limited", httpStatus: 503 };
  }
  if (response.status === 408 || response.status === 504) {
    return { ok: false, error: "provider_timeout", httpStatus: 504 };
  }
  if (!response.ok) {
    return { ok: false, error: "provider_unavailable", httpStatus: 502 };
  }

  const body = await readLimitedJson(response, timeoutSignal);
  if (body.kind === "timeout") {
    return { ok: false, error: "provider_timeout", httpStatus: 504 };
  }
  if (body.kind === "too_large") {
    return { ok: false, error: "provider_response_too_large", httpStatus: 502 };
  }
  if (body.kind !== "ok") {
    return { ok: false, error: "provider_invalid_response", httpStatus: 502 };
  }

  const parsed = institutionalSearchResponseSchema.safeParse(body.value);
  if (
    !parsed.success ||
    parsed.data.query !== query ||
    parsed.data.type !== type
  ) {
    return { ok: false, error: "provider_invalid_response", httpStatus: 502 };
  }

  return { ok: true, data: parsed.data };
}
