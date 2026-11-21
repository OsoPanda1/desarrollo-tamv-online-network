import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { proposalEvents, researchProposals, researchTopics, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { makeProposalEventHash } from "@/lib/research/provenance"
import { proposalSchema } from "@/lib/validation"
import { and, count, desc, eq, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para consultar tus propuestas.", 401)
  const records = await db
    .select({ id: researchProposals.id, title: researchProposals.title, proposalType: researchProposals.proposalType, status: researchProposals.status, visibility: researchProposals.visibility, createdAt: researchProposals.createdAt, updatedAt: researchProposals.updatedAt })
    .from(researchProposals)
    .where(eq(researchProposals.userId, session.user.id))
    .orderBy(desc(researchProposals.createdAt))
  return apiJson({ records })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para enviar una propuesta.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 16_384)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }

  const parsed = proposalSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa los campos obligatorios y sus límites de longitud.", 400)
  const input = parsed.data
  if (input.topicId) {
    const [topic] = await db
      .select({ id: researchTopics.id })
      .from(researchTopics)
      .where(and(eq(researchTopics.id, input.topicId), eq(researchTopics.userId, "system")))
      .limit(1)
    if (!topic) return apiError("El tema seleccionado ya no está disponible.", 400)
  }

  const id = crypto.randomUUID()
  const now = new Date()
  const eventPayload = { proposalId: id, actorId: session.user.id, action: "submitted", fromStatus: null, toStatus: "received", occurredAt: now.toISOString() }
  const event = makeProposalEventHash(eventPayload, null)

  const result = await db.transaction(async (transaction) => {
    const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    if (!account) return { error: "account_missing" as const }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [dailyCount] = await transaction
      .select({ value: count() })
      .from(researchProposals)
      .where(and(eq(researchProposals.userId, session.user.id), gte(researchProposals.createdAt, since)))
    if ((dailyCount?.value ?? 0) >= 5) return { error: "rate_limit" as const }

    await transaction.insert(researchProposals).values({
      id,
      userId: session.user.id,
      topicId: input.topicId ?? null,
      title: input.title,
      abstract: input.abstract,
      proposalType: input.proposalType,
      status: "received",
      visibility: "private",
      shareConsent: input.shareConsent,
      license: input.license || null,
      sourceUrl: input.sourceUrl || null,
      createdAt: now,
      updatedAt: now,
    })
    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      proposalId: id,
      action: "submitted",
      fromStatus: null,
      toStatus: "received",
      detail: "Propuesta recibida; pendiente de triage editorial.",
      createdAt: now,
      previousHash: null,
      eventHash: event.eventHash,
      canonicalPayload: event.canonicalPayload,
    })
    return { id }
  })

  if ("error" in result) {
    if (result.error === "rate_limit") return apiError("Alcanzaste el límite diario de propuestas. Inténtalo mañana.", 429)
    return apiError("No fue posible validar la cuenta de investigación.", 401)
  }
  return apiJson({ id: result.id, status: "received", message: "Propuesta recibida. Puedes seguir el proceso desde tu portal." }, 201)
}
