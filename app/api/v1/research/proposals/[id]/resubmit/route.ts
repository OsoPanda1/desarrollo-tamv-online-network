import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { proposalEvents, researchProposals, researchTopics } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { canonicalJson, makeProposalEventHash, sha256 } from "@/lib/research/provenance"
import { proposalSchema } from "@/lib/validation"
import { and, desc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para reenviar una propuesta.", 401)
  const { id: proposalId } = await context.params

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

  const content = {
    topicId: input.topicId ?? null,
    title: input.title,
    abstract: input.abstract,
    proposalType: input.proposalType,
    license: input.license || null,
    sourceUrl: input.sourceUrl || null,
    shareConsent: input.shareConsent,
  }
  const contentHash = sha256(canonicalJson(content))

  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({ id: researchProposals.id, status: researchProposals.status })
      .from(researchProposals)
      .where(and(eq(researchProposals.id, proposalId), eq(researchProposals.userId, session.user.id)))
      .for("update")
      .limit(1)
    if (!proposal) return { error: "not_found" as const }
    if (proposal.status !== "changes_requested") return { error: "not_resubmittable" as const }

    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash, createdAt: proposalEvents.createdAt })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, proposalId))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)
    const now = new Date(Math.max(Date.now(), (lastEvent?.createdAt.getTime() ?? 0) + 1))
    const payload = {
      proposalId,
      actorId: session.user.id,
      action: "resubmitted",
      fromStatus: "changes_requested",
      toStatus: "received",
      contentHash,
      occurredAt: now.toISOString(),
    }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)

    await transaction.update(researchProposals).set({
      ...content,
      status: "received",
      visibility: "private",
      updatedAt: now,
    }).where(eq(researchProposals.id, proposalId))
    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      proposalId,
      action: "resubmitted",
      fromStatus: "changes_requested",
      toStatus: "received",
      detail: "La persona autora reenvió la propuesta con cambios; pendiente de triage editorial.",
      createdAt: now,
      previousHash: lastEvent?.eventHash ?? null,
      eventHash: event.eventHash,
      canonicalPayload: event.canonicalPayload,
    })
    return { status: "received" as const }
  })

  if ("error" in result) {
    if (result.error === "not_found") return apiError("No se encontró la propuesta.", 404)
    return apiError("Solo pueden reenviarse propuestas con cambios solicitados.", 409)
  }
  return apiJson({ id: proposalId, status: result.status })
}
