import { NextResponse } from "next/server.js"

export type RequestBodyErrorCode =
  | "payload_too_large"
  | "unsupported_media_type"
  | "invalid_utf8"
  | "invalid_json"
  | "request_body_unreadable"

export class RequestBodyError extends Error {
  readonly code: RequestBodyErrorCode;

  constructor(message: string, code: RequestBodyErrorCode) {
    super(message)
    this.name = "RequestBodyError"
    this.code = code
  }
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return false
  try {
    return origin === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site"
  } catch {
    return false
  }
}

export async function readJsonBody(request: Request, maxBytes = 32_768): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase()
  if (contentType !== "application/json") {
    throw new RequestBodyError("Se requiere contenido JSON.", "unsupported_media_type")
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    try {
      await request.body?.cancel()
    } catch {
      // A cancellation failure must not change the size classification.
    }
    throw new RequestBodyError("La solicitud excede el tamaño permitido.", "payload_too_large")
  }

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  try {
    reader = request.body?.getReader()
  } catch {
    throw new RequestBodyError("No se pudo leer el cuerpo de la solicitud.", "request_body_unreadable")
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value.byteLength
        if (totalBytes > maxBytes) {
          try {
            await reader.cancel()
          } catch {
            // Preserve payload_too_large even when the stream cannot be cancelled.
          }
          throw new RequestBodyError("La solicitud excede el tamaño permitido.", "payload_too_large")
        }
        chunks.push(value)
      }
    } catch (error) {
      if (error instanceof RequestBodyError) throw error
      throw new RequestBodyError("No se pudo leer el cuerpo de la solicitud.", "request_body_unreadable")
    } finally {
      try {
        reader.releaseLock()
      } catch {
        // Releasing a broken stream must not mask its established error classification.
      }
    }
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  let raw: string
  try {
    raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    throw new RequestBodyError("El cuerpo debe ser UTF-8 válido.", "invalid_utf8")
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new RequestBodyError("El JSON no tiene un formato válido.", "invalid_json")
  }
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
}

export function apiJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}
