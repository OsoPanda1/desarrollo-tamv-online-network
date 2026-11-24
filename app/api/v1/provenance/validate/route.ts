import { validateProvenanceRecord } from "../../../../../lib/ecosystem/provenance.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

type ReadBodyResult =
  | { kind: "ok"; text: string }
  | { kind: "too_large" }
  | { kind: "invalid_utf8" }
  | { kind: "read_error" };

async function readLimitedBody(request: Request): Promise<ReadBodyResult> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return { kind: "too_large" };
  }

  if (!request.body) return { kind: "ok", text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
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

/**
 * Stateless validation only. This endpoint does not fetch source URLs, persist records,
 * verify authorship, or establish signature, timestamp, peer-review or accreditation claims.
 */
export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (contentType !== "application/json") {
    return Response.json({ valid: false, error: "unsupported_media_type", expected: "application/json" }, { status: 415, headers });
  }

  const body = await readLimitedBody(request);
  if (body.kind === "too_large") {
    return Response.json({ valid: false, error: "payload_too_large", maxBytes: MAX_BODY_BYTES }, { status: 413, headers });
  }
  if (body.kind === "invalid_utf8") {
    return Response.json({ valid: false, error: "invalid_utf8" }, { status: 400, headers });
  }
  if (body.kind === "read_error") {
    return Response.json({ valid: false, error: "request_body_unreadable" }, { status: 400, headers });
  }

  let input: unknown;
  try {
    input = JSON.parse(body.text);
  } catch {
    return Response.json({ valid: false, error: "invalid_json" }, { status: 400, headers });
  }

  try {
    const record = validateProvenanceRecord(input);
    return Response.json({
      valid: true,
      schemaVersion: record.schemaVersion,
      submittedValidationState: record.validationState,
      semantics: "Schema validation only; source truth, authorship, trusted time, signature, peer review and accreditation are not established.",
    }, { status: 200, headers });
  } catch (error) {
    const issues = error instanceof Error && "issues" in error && Array.isArray(error.issues)
      ? error.issues.map((issue: { path?: unknown[]; code?: string; message?: string }) => ({
          path: Array.isArray(issue.path) ? issue.path.map(String).join(".") : "",
          code: typeof issue.code === "string" ? issue.code : "invalid",
          message: typeof issue.message === "string" ? issue.message : "Invalid value",
        }))
      : [];
    return Response.json({ valid: false, error: "schema_validation_failed", issues }, { status: 422, headers });
  }
}
