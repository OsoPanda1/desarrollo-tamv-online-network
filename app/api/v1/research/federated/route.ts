import { z } from "zod";
import { fetchInstitutionalResearch, type InstitutionalResearchResult } from "../../../../../lib/ecosystem/institutional-research.ts";
import { fetchPublicResearchProviders } from "../../../../../lib/ecosystem/public-research-providers.ts";
import { isSameOriginRequest } from "../../../../../lib/http.ts";
import { enforcePublicRateLimit } from "../../../../../lib/rate-limit/server.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MAX_REQUEST_BYTES = 2 * 1024;
const requestSchema = z.object({
  query: z.string().trim().min(3).max(180),
  type: z.enum(["research", "organizations"]).optional().default("research"),
}).strict();

type ReadBodyResult =
  | { kind: "ok"; text: string }
  | { kind: "too_large" }
  | { kind: "invalid_utf8" }
  | { kind: "read_error" };

async function readLimitedBody(request: Request): Promise<ReadBodyResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > MAX_REQUEST_BYTES) {
    return { kind: "too_large" };
  }
  if (!request.body) return { kind: "ok", text: "" };

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = request.body.getReader();
  } catch {
    return { kind: "read_error" };
  }
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // Preserve the request-size classification if cancellation fails.
        }
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "read_error" };
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
    return { kind: "ok", text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { kind: "invalid_utf8" };
  }
}

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request): Promise<Response> {
  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "research-federated",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const requiresOriginCheck = request.headers.has("origin") || request.headers.get("sec-fetch-site") === "cross-site"
  if (requiresOriginCheck && !isSameOriginRequest(request)) {
    return Response.json({ ok: false, error: "origin_not_allowed" }, { status: 403, headers: responseHeaders });
  }
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return Response.json(
      { ok: false, error: "unsupported_media_type", expected: "application/json" },
      { status: 415, headers: responseHeaders },
    );
  }

  const body = await readLimitedBody(request);
  if (body.kind === "too_large") {
    return Response.json({ ok: false, error: "payload_too_large", maxBytes: MAX_REQUEST_BYTES }, { status: 413, headers: responseHeaders });
  }
  if (body.kind === "invalid_utf8") {
    return Response.json({ ok: false, error: "invalid_utf8" }, { status: 400, headers: responseHeaders });
  }
  if (body.kind === "read_error") {
    return Response.json({ ok: false, error: "request_body_unreadable" }, { status: 400, headers: responseHeaders });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body.text);
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400, headers: responseHeaders });
  }

  const input = requestSchema.safeParse(parsedBody);
  if (!input.success) {
    return Response.json({ ok: false, error: "invalid_query", issues: input.error.issues.map((issue) => ({
      path: issue.path.map(String).join("."),
      code: issue.code,
      message: issue.message,
    })) }, { status: 422, headers: responseHeaders });
  }

  const normalizedQuery = input.data.query.replace(/\s+/g, " ");
  const institutionalResult = await fetchInstitutionalResearch(normalizedQuery, input.data.type);
  let data: InstitutionalResearchResult;
  let provider = "TAMV Online Network — Institutional Research Platform";

  if (institutionalResult.ok) {
    data = institutionalResult.data;
  } else if (institutionalResult.error === "provider_not_configured" && input.data.type === "research") {
    data = await fetchPublicResearchProviders(normalizedQuery);
    provider = "TAMV Online Network — Public Research Providers";
  } else {
    return Response.json({ ok: false, error: institutionalResult.error }, { status: institutionalResult.httpStatus, headers: responseHeaders });
  }

  return Response.json({
    ok: true,
    provider,
    query: data.query,
    type: data.type,
    retrievedAt: data.retrievedAt,
    results: data.results,
    providers: data.providers,
    methodology: data.methodology,
    semantics: "Imported public research metadata only. Result order is not a quality score; this result does not establish authorship, peer review, quality, accreditation, endorsement, partnership, license permissions, access rights, or independent verification.",
  }, { status: 200, headers: responseHeaders });
}
