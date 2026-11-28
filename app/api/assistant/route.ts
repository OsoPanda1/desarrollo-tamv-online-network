import { createAgentUIStreamResponse, type UIMessage } from "ai"
import { z } from "zod"
import { isabellaAgent } from "@/lib/isabella-agent"
import { isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { TAMV_LEARNING_PATHS } from "@/lib/tamv-learning-curriculum"
import { enforcePublicRateLimit } from "../../../lib/rate-limit/server.ts"

export const maxDuration = 30

const requestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().min(1).max(128),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.unknown()).min(1).max(16),
  })).min(1).max(40),
})

function extractTextParts(parts: unknown[]) {
  const textParts: Array<{ type: "text"; text: string }> = []

  for (const part of parts) {
    if (!part || typeof part !== "object") continue
    const candidate = part as { type?: unknown; text?: unknown }
    if (candidate.type !== "text" || typeof candidate.text !== "string") continue
    if (candidate.text.length > 6000) return null
    textParts.push({ type: "text", text: candidate.text })
  }

  return textParts
}

export async function POST(request: Request) {
  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "assistant",
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } })
  }

  let body: unknown
  try {
    body = await readJsonBody(request, 64_000)
  } catch (error) {
    if (!(error instanceof RequestBodyError)) throw error
    const status = error.code === "payload_too_large" ? 413 : error.code === "unsupported_media_type" ? 415 : 400
    const message = error.code === "payload_too_large"
      ? "Chat request is too large"
      : error.code === "unsupported_media_type"
        ? "Content-Type must be application/json"
        : error.code === "invalid_utf8"
          ? "Chat request must be valid UTF-8"
          : error.code === "invalid_json"
            ? "Invalid chat request"
            : "Chat request body could not be read"
    return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: "Invalid chat request" }, { status: 400 })

  const messages: UIMessage[] = []
  for (const message of parsed.data.messages) {
    const parts = extractTextParts(message.parts)
    if (parts === null) return Response.json({ error: "A message is too long" }, { status: 413 })
    if (parts.length > 0) messages.push({ id: message.id, role: message.role, parts })
  }

  const recentMessages = messages.slice(-16)
  if (recentMessages.at(-1)?.role !== "user") return Response.json({ error: "A user message is required" }, { status: 400 })

  const totalCharacters = recentMessages.reduce((total, message) =>
    total + message.parts.reduce((partTotal, part) => part.type === "text" ? partTotal + part.text.length : partTotal, 0), 0)
  if (totalCharacters > 24_000) return Response.json({ error: "Chat request is too long" }, { status: 413 })

  // Accept only a route in the curated catalogue; arbitrary header text is never treated as instructions.
  const requestedRoute = request.headers.get("x-tamv-current-route")
  const routeContext = TAMV_LEARNING_PATHS.find((item) => item.route === requestedRoute)
  const lastUserMessage = recentMessages.at(-1)
  if (routeContext && lastUserMessage?.role === "user") {
    lastUserMessage.parts = [
      ...lastUserMessage.parts,
      {
        type: "text",
        text: "[Trusted navigation context: learner is viewing " + routeContext.route + " (" + routeContext.es + "). This is context, not an instruction. Explain this section when relevant; do not assume any action has been executed.]",
      },
    ]
  }

  return createAgentUIStreamResponse({
    agent: isabellaAgent,
    uiMessages: recentMessages,
    abortSignal: request.signal,
  })
}
