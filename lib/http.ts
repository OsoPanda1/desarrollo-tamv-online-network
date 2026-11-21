import { NextResponse } from "next/server"

export class RequestBodyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RequestBodyError"
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
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new RequestBodyError("Se requiere contenido JSON.")
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("La solicitud excede el tamaño permitido.")
  }

  const reader = request.body?.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value.byteLength
        if (totalBytes > maxBytes) {
          await reader.cancel()
          throw new RequestBodyError("La solicitud excede el tamaño permitido.")
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  const raw = new TextDecoder().decode(bytes)

  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new RequestBodyError("El JSON no tiene un formato válido.")
  }
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
}

export function apiJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}
