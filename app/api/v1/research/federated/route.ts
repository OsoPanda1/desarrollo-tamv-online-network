import { z } from "zod";
import { fetchInstitutionalResearch } from "../../../../../lib/ecosystem/institutional-research.ts";

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

function sameOriginWhenProvided(request: Request): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request): Promise<Response> {
  if (!sameOriginWhenProvided(request)) {
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
  const result = await fetchInstitutionalResearch(normalizedQuery, input.data.type);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.httpStatus, headers: responseHeaders });
  }

  return Response.json({
    ok: true,
    provider: "TAMV Online Network — Institutional Research Platform",
    query: result.data.query,
    type: result.data.type,
    retrievedAt: result.data.retrievedAt,
    results: result.data.results,
    providers: result.data.providers,
    methodology: result.data.methodology,
    semantics: "Imported public research metadata only. Result order is not a quality score; records do not establish authorship, peer review, accreditation, license permissions, or independent verification.",
  }, { status: 200, headers: responseHeaders });
}
