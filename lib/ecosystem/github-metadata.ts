import { z } from "zod";
import { ecosystemSystems, type EcosystemSystem } from "./registry.ts";

const MAX_UPSTREAM_BODY_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 4_500;

const parseableDateTime = z.string().refine(
  (value) => Number.isFinite(Date.parse(value)) && value.includes("T"),
  "Expected a parseable date-time",
);

const githubRepositoryPayloadSchema = z.object({
  id: z.number().int().positive(),
  full_name: z.string().min(3).max(300),
  html_url: z.string().url(),
  private: z.boolean(),
  archived: z.boolean(),
  default_branch: z.string().min(1).max(255),
  updated_at: parseableDateTime,
  pushed_at: parseableDateTime.nullable(),
  language: z.string().max(200).nullable(),
  license: z.object({
    spdx_id: z.string().max(200).nullable(),
  }).passthrough().nullable().optional(),
}).passthrough();

export type SourceMetadataStatus =
  | "metadata_available"
  | "not_found"
  | "rate_limited"
  | "timeout"
  | "upstream_error"
  | "invalid_response";

export type PublicRepositoryMetadata = {
  repositoryId: number;
  fullName: string;
  url: string;
  defaultBranch: string;
  archived: boolean;
  updatedAt: string;
  pushedAt: string | null;
  primaryLanguage: string | null;
  licenseSpdxId: string | null;
};

export type EcosystemRepositoryMetadataEntry = {
  systemId: string;
  name: string;
  repository: string;
  sourceMetadataStatus: SourceMetadataStatus;
  checkedAt: string;
  metadata: PublicRepositoryMetadata | null;
};

export type EcosystemRepositoryMetadataResponse = {
  schemaVersion: "1.0.0";
  checkedAt: string;
  scope: string;
  systems: EcosystemRepositoryMetadataEntry[];
};

export type GitHubFetch = (
  input: URL | RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

function getRepositoryCoordinates(repository: string): { owner: string; name: string } | null {
  try {
    const parsed = new URL(repository);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "github.com" ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length !== 2 || segments.some((segment) => segment === "." || segment === "..")) return null;
    return { owner: segments[0], name: segments[1] };
  } catch {
    return null;
  }
}

function result(
  system: EcosystemSystem,
  sourceMetadataStatus: SourceMetadataStatus,
  metadata: PublicRepositoryMetadata | null = null,
): EcosystemRepositoryMetadataEntry {
  return {
    systemId: system.id,
    name: system.name,
    repository: system.repository,
    sourceMetadataStatus,
    checkedAt: new Date().toISOString(),
    metadata,
  };
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

async function readLimitedJson(response: Response): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_UPSTREAM_BODY_BYTES) {
    return { ok: false };
  }
  if (!response.body) return { ok: false };

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_UPSTREAM_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // Keep the invalid-response classification if the upstream refuses cancellation.
        }
        return { ok: false };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false };
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
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/**
 * Fetch public repository metadata from a fixed GitHub API origin.
 *
 * The URL is derived only from the reviewed, static ecosystem registry; callers
 * cannot supply a destination URL. This adapter never fetches repository code,
 * performs writes, uses credentials, or establishes deployed-app health or trust.
 */
export async function fetchPublicRepositoryMetadata(
  system: EcosystemSystem,
  fetcher: GitHubFetch = fetch,
): Promise<EcosystemRepositoryMetadataEntry> {
  const coordinates = getRepositoryCoordinates(system.repository);
  if (!coordinates) return result(system, "invalid_response");

  const expectedFullName = `${coordinates.owner}/${coordinates.name}`;
  const apiUrl = new URL(
    `/repos/${encodeURIComponent(coordinates.owner)}/${encodeURIComponent(coordinates.name)}`,
    "https://api.github.com",
  );

  let response: Response;
  try {
    response = await fetcher(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "TAMV-Online-Network-Ecosystem/1.0",
      },
      redirect: "error",
      cache: "force-cache",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return result(system, isTimeoutError(error) ? "timeout" : "upstream_error");
  }

  if (response.status === 404) return result(system, "not_found");
  if (
    response.status === 429 ||
    (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")
  ) return result(system, "rate_limited");
  if (!response.ok) return result(system, "upstream_error");

  const body = await readLimitedJson(response);
  if (!body.ok) return result(system, "invalid_response");

  const parsed = githubRepositoryPayloadSchema.safeParse(body.value);
  if (!parsed.success) return result(system, "invalid_response");

  const payload = parsed.data;
  if (payload.private) return result(system, "not_found");

  const returnedUrl = (() => {
    try {
      return new URL(payload.html_url);
    } catch {
      return null;
    }
  })();
  if (
    payload.full_name.toLowerCase() !== expectedFullName.toLowerCase() ||
    !returnedUrl ||
    returnedUrl.protocol !== "https:" ||
    returnedUrl.hostname !== "github.com" ||
    returnedUrl.pathname.replace(/\/$/, "").toLowerCase() !== `/${expectedFullName}`.toLowerCase() ||
    returnedUrl.search ||
    returnedUrl.hash
  ) return result(system, "invalid_response");

  return result(system, "metadata_available", {
    repositoryId: payload.id,
    fullName: payload.full_name,
    url: system.repository,
    defaultBranch: payload.default_branch,
    archived: payload.archived,
    updatedAt: payload.updated_at,
    pushedAt: payload.pushed_at,
    primaryLanguage: payload.language,
    licenseSpdxId: payload.license?.spdx_id ?? null,
  });
}

export async function getPublicEcosystemRepositoryMetadata(
  fetcher: GitHubFetch = fetch,
): Promise<EcosystemRepositoryMetadataResponse> {
  const systems = await Promise.all(
    ecosystemSystems.map((system) => fetchPublicRepositoryMetadata(system, fetcher)),
  );
  return {
    schemaVersion: "1.0.0",
    checkedAt: new Date().toISOString(),
    scope: "Public GitHub repository metadata only. This does not assert deployed application health, authentication, authorization, data synchronization, source correctness, signature validity, peer review, or accreditation.",
    systems,
  };
}
