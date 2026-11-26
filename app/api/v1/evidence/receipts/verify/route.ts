import {
  MAX_RECEIPT_BYTES,
  RECEIPT_SEMANTICS,
  verifyReceipt,
} from "../../../../../../lib/evidence/receipt.ts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ReadBodyResult =
  | { kind: "ok"; text: string }
  | { kind: "too_large" }
  | { kind: "invalid_utf8" }
  | { kind: "read_error" }

async function readLimitedBody(request: Request): Promise<ReadBodyResult> {
  const declaredLength = request.headers.get("content-length")
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_RECEIPT_BYTES) {
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
      if (totalBytes > MAX_RECEIPT_BYTES) {
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
 * Stateless verification of a TAMV Evidence Receipt (CEV).
 *
 * This endpoint never stores the receipt, never fetches declared URLs, and
 * never receives evidence bytes. It validates shape and payload integrity
 * only; file binding, registered origin, and human review remain separate.
 */
export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  }

  if (contentType !== "application/json") {
    return Response.json(
      { valid: false, error: "unsupported_media_type", expected: "application/json" },
      { status: 415, headers },
    )
  }

  const body = await readLimitedBody(request)
  if (body.kind === "too_large") {
    return Response.json(
      { valid: false, error: "payload_too_large", maxBytes: MAX_RECEIPT_BYTES },
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

  const result = await verifyReceipt(input)

  if (!result.levels.shape) {
    return Response.json(
      {
        valid: false,
        error: "schema_validation_failed",
        levels: result.levels,
        issues: result.issues,
        semantics: RECEIPT_SEMANTICS,
      },
      { status: 422, headers },
    )
  }

  if (!result.levels.integrity) {
    return Response.json(
      {
        valid: false,
        error: "integrity_mismatch",
        levels: result.levels,
        expected: result.expected,
        actual: result.actual,
        semantics: RECEIPT_SEMANTICS,
      },
      { status: 422, headers },
    )
  }

  return Response.json(
    {
      valid: true,
      levels: result.levels,
      digest: result.expected,
      semantics: RECEIPT_SEMANTICS,
      note: "Shape and payload integrity verified. File binding, registered origin, and human review were not checked.",
    },
    { status: 200, headers },
  )
}
