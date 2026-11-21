import { requireModeratorRequest } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { proposalAppeals, proposalEvents, proposalReviews, researchProposals } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { makeProposalEventHash } from "@/lib/research/provenance"
import { canTransitionProposal } from "@/lib/research/workflow"
import { moderationSchema } from "@/lib/validation"
import { and, desc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

const targetStatus: Record<string, string | null> = {
  triage: "triage",
  review: "in_review",
  changes_requested: "changes_requested",
  accepted: "accepted",
  rejected: "rejected",
  published: "published",
  recusal: null,
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const moderator = await requireModeratorRequest(request.headers)
  if (!moderator) return apiError("No tienes permiso para revisar propuestas.", 403)
  const { id: proposalId } = await context.params

  let body: unknown
  try {
    body = await readJsonBody(request, 10_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = moderationSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa el resultado y la retroalimentación de revisión.", 400)
  const input = parsed.data
  if (input.conflictOfInterest !== (input.outcome === "recusal")) {
    return apiError("Declara el conflicto y recúsate, o confirma que no existe conflicto.", 400)
  }
  if (input.outcome === "published" && !["admin", "editor"].includes(moderator.role)) {
    return apiError("Solo una persona editora o administradora puede publicar.", 403)
  }

  const now = new Date()
  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({ id: researchProposals.id, userId: researchProposals.userId, status: researchProposals.status, shareConsent: researchProposals.shareConsent })
      .from(researchProposals)
      .where(eq(researchProposals.id, proposalId))
      .for("update")
      .limit(1)
    if (!proposal) return { error: "not_found" as const }
    if (proposal.userId === moderator.user.id) return { error: "self_review" as const }

    const nextStatus = targetStatus[input.outcome]
    if (proposal.status === "appealed" && nextStatus && ["in_review", "rejected"].includes(nextStatus)) {
      const [originalDecision] = await transaction
        .select({ userId: proposalReviews.userId })
        .from(proposalReviews)
        .where(and(eq(proposalReviews.proposalId, proposalId), eq(proposalReviews.outcome, "rejected"), eq(proposalReviews.conflictOfInterest, false)))
        .orderBy(desc(proposalReviews.createdAt))
        .limit(1)
      if (originalDecision?.userId === moderator.user.id) return { error: "appeal_same_reviewer" as const }
    }
    if (nextStatus && !canTransitionProposal(proposal.status, nextStatus)) return { error: "invalid_transition" as const }
    if (nextStatus === "published" && !proposal.shareConsent) return { error: "consent_required" as const }

    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, proposalId))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)

    // Keep the appeal record synchronized with the proposal state. Without
    // this, a completed appeal remains "received" and can block future appeals.
    if (proposal.status === "appealed" && nextStatus === "in_review") {
      await transaction
        .update(proposalAppeals)
        .set({ status: "under_review" })
        .where(and(eq(proposalAppeals.proposalId, proposalId), eq(proposalAppeals.status, "received")))
    } else if (proposal.status === "appealed" && nextStatus === "rejected") {
      await transaction
        .update(proposalAppeals)
        .set({ status: "resolved", resolutionNote: input.feedback, resolvedAt: now })
        .where(and(eq(proposalAppeals.proposalId, proposalId), eq(proposalAppeals.status, "received")))
    } else if (proposal.status === "in_review" && nextStatus) {
      await transaction
        .update(proposalAppeals)
        .set({ status: "resolved", resolutionNote: input.feedback, resolvedAt: now })
        .where(and(eq(proposalAppeals.proposalId, proposalId), eq(proposalAppeals.status, "under_review")))
    }

    const toStatus = nextStatus ?? proposal.status
    const action = input.outcome === "recusal" ? "reviewer_recusal" : `review_${input.outcome}`
    const payload = { proposalId, actorId: moderator.user.id, action, fromStatus: proposal.status, toStatus, feedback: input.feedback, occurredAt: now.toISOString() }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)

    await transaction.insert(proposalReviews).values({
      id: crypto.randomUUID(),
      userId: moderator.user.id,
      proposalId,
      outcome: input.outcome,
      feedback: input.feedback,
      conflictOfInterest: input.conflictOfInterest,
      createdAt: now,
    })
    if (nextStatus) {
      await transaction.update(researchProposals).set({
        status: nextStatus,
        visibility: nextStatus === "published" ? "public" : undefined,
        publishedAt: nextStatus === "published" ? now : undefined,
        updatedAt: now,
      }).where(eq(researchProposals.id, proposalId))
    }
    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(),
      userId: moderator.user.id,
      proposalId,
      action,
      fromStatus: proposal.status,
      toStatus,
      detail: input.feedback,
      createdAt: now,
      previousHash: lastEvent?.eventHash ?? null,
      eventHash: event.eventHash,
      canonicalPayload: event.canonicalPayload,
    })
    return { status: toStatus }
  })

  if ("error" in result) {
    if (result.error === "not_found") return apiError("No se encontró la propuesta.", 404)
    if (result.error === "consent_required") return apiError("La persona autora no autorizó la publicación pública.", 409)
    if (result.error === "self_review") return apiError("No puedes revisar tu propia propuesta.", 403)
    if (result.error === "appeal_same_reviewer") return apiError("La apelación requiere una persona revisora distinta de quien rechazó la propuesta.", 409)
    return apiError("La transición no está permitida desde el estado actual.", 409)
  }
  return apiJson({ status: result.status })
}
