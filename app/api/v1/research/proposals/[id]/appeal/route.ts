import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { proposalAppeals, proposalEvents, researchProposals } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { makeProposalEventHash } from "@/lib/research/provenance"
import { appealSchema } from "@/lib/validation"
import { and, desc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para presentar una apelación.", 401)
  const { id: proposalId } = await context.params

  let body: unknown
  try {
    body = await readJsonBody(request, 8_192)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = appealSchema.safeParse(body)
  if (!parsed.success) return apiError("Explica el motivo de la apelación (30–2,000 caracteres).", 400)

  const appealId = crypto.randomUUID()
  const now = new Date()
  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({ id: researchProposals.id, status: researchProposals.status })
      .from(researchProposals)
      .where(and(eq(researchProposals.id, proposalId), eq(researchProposals.userId, session.user.id)))
      .for("update")
      .limit(1)
    if (!proposal) return { error: "not_found" as const }
    if (proposal.status !== "rejected") return { error: "not_appealable" as const }

    const [existing] = await transaction
      .select({ id: proposalAppeals.id })
      .from(proposalAppeals)
      .where(and(eq(proposalAppeals.proposalId, proposalId), eq(proposalAppeals.userId, session.user.id), eq(proposalAppeals.status, "received")))
      .limit(1)
    if (existing) return { error: "already_open" as const }

    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, proposalId))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)

    const payload = { proposalId, actorId: session.user.id, action: "appeal_submitted", fromStatus: "rejected", toStatus: "appealed", occurredAt: now.toISOString() }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)
    await transaction.insert(proposalAppeals).values({ id: appealId, userId: session.user.id, proposalId, reason: parsed.data.reason, status: "received", createdAt: now })
    await transaction.update(researchProposals).set({ status: "appealed", updatedAt: now }).where(eq(researchProposals.id, proposalId))
    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(), userId: session.user.id, proposalId, action: "appeal_submitted", fromStatus: "rejected", toStatus: "appealed",
      detail: "Se recibió una apelación; pendiente de una revisión distinta a la decisión original.", createdAt: now,
      previousHash: lastEvent?.eventHash ?? null, eventHash: event.eventHash, canonicalPayload: event.canonicalPayload,
    })
    return { appealId }
  })

  if ("error" in result) {
    if (result.error === "not_found") return apiError("No se encontró la propuesta.", 404)
    if (result.error === "already_open") return apiError("Ya existe una apelación en curso.", 409)
    return apiError("Solo pueden apelarse decisiones no aceptadas.", 409)
  }
  return apiJson({ id: result.appealId, status: "received" }, 201)
}
