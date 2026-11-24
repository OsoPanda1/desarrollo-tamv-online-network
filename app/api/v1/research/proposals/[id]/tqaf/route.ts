import { auth } from "@/lib/auth"
import { requireModeratorRequest } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { proposalEvents, researchProposals, tqafAssessments } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { makeProposalEventHash } from "@/lib/research/provenance"
import { tqafAssessmentSchema } from "@/lib/validation"
import { and, desc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para actualizar la evaluación TQAF.", 401)
  const moderator = await requireModeratorRequest(request.headers)

  let body: unknown
  try {
    body = await readJsonBody(request, 4_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = tqafAssessmentSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa el criterio, estado y evidencia.", 400)
  const input = parsed.data
  const rationale = input.rationale ?? ""
  if (input.status !== "pending" && rationale.length < 10) return apiError("Añade un fundamento de al menos 10 caracteres.", 400)
  if (input.status === "verified" && (!input.evidenceUrl || rationale.length < 20)) {
    return apiError("Un estado verificado requiere fundamento y enlace de evidencia.", 400)
  }
  if (input.status === "external" && rationale.length < 20) {
    return apiError("Describe el proceso externo pendiente.", 400)
  }

  const { id: proposalId } = await context.params
  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({ id: researchProposals.id, userId: researchProposals.userId, status: researchProposals.status })
      .from(researchProposals)
      .where(eq(researchProposals.id, proposalId))
      .for("update")
      .limit(1)
    if (!proposal) return { error: "not_found" as const }

    const isAuthor = proposal.userId === session.user.id
    const isReviewer = Boolean(moderator)
    if (!isAuthor && !isReviewer) return { error: "forbidden" as const }
    if (isReviewer && moderator?.user.id === proposal.userId) return { error: "self_review" as const }
    if (isAuthor && !["pending", "declared", "partial"].includes(input.status)) return { error: "author_status" as const }

    const [existing] = await transaction
      .select({ reviewerId: tqafAssessments.reviewerId })
      .from(tqafAssessments)
      .where(and(eq(tqafAssessments.proposalId, proposalId), eq(tqafAssessments.criterionCode, input.criterionCode)))
      .for("update")
      .limit(1)
    if (isAuthor && existing?.reviewerId) return { error: "reviewer_record" as const }

    const actorId = isReviewer ? moderator!.user.id : session.user.id
    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash, createdAt: proposalEvents.createdAt })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, proposalId))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)
    const now = new Date(Math.max(Date.now(), (lastEvent?.createdAt.getTime() ?? 0) + 1))
    const eventAction = isReviewer ? "tqaf_review_updated" : "tqaf_declaration_updated"
    const payload = {
      proposalId,
      actorId,
      action: eventAction,
      criterionCode: input.criterionCode,
      assessmentStatus: input.status,
      occurredAt: now.toISOString(),
    }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)

    const assessmentValues = {
      status: input.status,
      rationale: rationale || null,
      evidenceUrl: input.evidenceUrl ?? null,
      reviewerId: isReviewer ? actorId : null,
      updatedAt: now,
    }
    if (existing) {
      // The proposal row is locked above, so this read-then-write stays
      // serialized without requiring a unique index that the schema does not
      // declare on (proposal_id, criterion_code).
      await transaction.update(tqafAssessments)
        .set(assessmentValues)
        .where(and(
          eq(tqafAssessments.proposalId, proposalId),
          eq(tqafAssessments.criterionCode, input.criterionCode),
        ))
    } else {
      await transaction.insert(tqafAssessments).values({
        id: crypto.randomUUID(),
        userId: proposal.userId,
        proposalId,
        criterionCode: input.criterionCode,
        ...assessmentValues,
      })
    }
    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(),
      userId: actorId,
      proposalId,
      action: eventAction,
      fromStatus: proposal.status,
      toStatus: proposal.status,
      detail: `${input.criterionCode}: ${input.status}`,
      createdAt: now,
      previousHash: lastEvent?.eventHash ?? null,
      eventHash: event.eventHash,
      canonicalPayload: event.canonicalPayload,
    })
    return { status: input.status, updatedAt: now }
  })

  if ("error" in result) {
    if (result.error === "not_found") return apiError("No se encontró la propuesta.", 404)
    if (result.error === "self_review") return apiError("La persona autora no puede revisar su propia propuesta.", 403)
    if (result.error === "reviewer_record") return apiError("Este criterio ya tiene una evaluación revisora; solicita una revisión editorial.", 409)
    if (result.error === "author_status") return apiError("La autoría puede declarar, señalar avances parciales o dejar pendiente; no puede verificar el criterio.", 403)
    if (result.error === "forbidden") return apiError("No tienes permiso para modificar esta evaluación.", 403)
    return apiError("No fue posible guardar la evaluación.", 500)
  }
  return apiJson({ criterionCode: input.criterionCode, status: result.status, updatedAt: result.updatedAt.toISOString() })
}
