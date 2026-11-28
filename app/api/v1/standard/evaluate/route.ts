import { validateAndEvaluate } from "../../../../../lib/standard/index.ts"
import { STANDARD_SEMANTICS_EN, STANDARD_SEMANTICS_ES } from "../../../../../lib/standard/taxonomy.ts"
import { enforcePublicRateLimit } from "../../../../../lib/rate-limit/server.ts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 64 * 1024

type ReadBodyResult =
  | { kind: "ok"; text: string }
  | { kind: "too_large" }
  | { kind: "invalid_utf8" }
  | { kind: "read_error" }

async function readLimitedBody(request: Request): Promise<ReadBodyResult> {
  const declaredLength = request.headers.get("content-length")
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return { kind: "too_large" }
  }

  if (!request.body) return { kind: "ok", text: "" }

  let reader: ReadableStreamDefaultReader<Uint8Array>
  try {
    reader = request.body.getReader()
  } catch {
    return { kind: "read_error" }
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_BODY_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // Preserve the size-limit result even if the stream refuses cancellation.
        }
        return { kind: "too_large" }
      }
      chunks.push(value)
    }
  } catch {
    return { kind: "read_error" }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return { kind: "ok", text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) }
  } catch {
    return { kind: "invalid_utf8" }
  }
}

/**
 * Stateless structural evaluation of a public declaration.
 *
 * The endpoint does not fetch URLs, resolve identifiers, read registries,
 * contact certifiers or persist the declaration. It returns a deterministic
 * report whose `verification` is always "unverified". Expiry checks use the
 * server time, which is recorded as `report.referenceDate`.
 */
export async function POST(request: Request): Promise<Response> {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  }

  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "standard-evaluate",
    limit: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (rateLimited) return rateLimited

  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
  if (contentType !== "application/json") {
    return Response.json(
      { valid: false, error: "unsupported_media_type", expected: "application/json" },
      { status: 415, headers },
    )
  }

  const body = await readLimitedBody(request)
  if (body.kind === "too_large") {
    return Response.json(
      { valid: false, error: "payload_too_large", maxBytes: MAX_BODY_BYTES },
      { status: 413, headers },
    )
  }
  if (body.kind === "invalid_utf8") {
    return Response.json({ valid: false, error: "invalid_utf8" }, { status: 400, headers })
  }
  if (body.kind === "read_error") {
    return Response.json({ valid: false, error: "request_body_unreadable" }, { status: 400, headers })
  }

  let input: unknown
  try {
    input = JSON.parse(body.text)
  } catch {
    return Response.json({ valid: false, error: "invalid_json" }, { status: 400, headers })
  }

  const result = await validateAndEvaluate(input, { referenceDate: new Date().toISOString() })

  if (!result.ok) {
    return Response.json(
      {
        valid: false,
        error: "schema_validation_failed",
        issues: result.issues,
        semantics: STANDARD_SEMANTICS_EN,
        semanticsEs: STANDARD_SEMANTICS_ES,
      },
      { status: 422, headers },
    )
  }

  return Response.json(
    {
      valid: true,
      report: result.report,
      note: "Structural evaluation only. Identifiers were not resolved, URLs were not fetched, registries were not queried and no certification was issued.",
    },
    { status: 200, headers },
  )
}
