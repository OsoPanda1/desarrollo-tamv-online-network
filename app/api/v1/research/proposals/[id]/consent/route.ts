import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { proposalEvents, researchProposals } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { makeProposalEventHash } from "@/lib/research/provenance"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const dynamic = "force-dynamic"
const consentSchema = z.object({ shareConsent: z.boolean() })

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para actualizar el consentimiento.", 401)
  const { id } = await context.params

  let body: unknown
  try {
    body = await readJsonBody(request, 2_048)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = consentSchema.safeParse(body)
  if (!parsed.success) return apiError("Consentimiento no válido.", 400)

  const now = new Date()
  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({ id: researchProposals.id, status: researchProposals.status, shareConsent: researchProposals.shareConsent })
      .from(researchProposals)
      .where(and(eq(researchProposals.id, id), eq(researchProposals.userId, session.user.id)))
      .for("update")
      .limit(1)
    if (!proposal) return { error: "not_found" as const }
    if (["published", "withdrawn"].includes(proposal.status)) return { error: "closed" as const }
    if (proposal.shareConsent === parsed.data.shareConsent) return { consent: proposal.shareConsent, changed: false }

    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, id))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)
    const payload = { proposalId: id, actorId: session.user.id, action: "publication_consent_updated", shareConsent: parsed.data.shareConsent, occurredAt: now.toISOString() }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)
    await transaction.update(researchProposals).set({ shareConsent: parsed.data.shareConsent, updatedAt: now }).where(eq(researchProposals.id, id))
    await transaction.insert(proposalEvents).values({ id: crypto.randomUUID(), userId: session.user.id, proposalId: id, action: "publication_consent_updated", fromStatus: proposal.status, toStatus: proposal.status, detail: parsed.data.shareConsent ? "La persona autora autorizó la difusión pública del resumen si se publica." : "La persona autora retiró su autorización de difusión pública.", createdAt: now, previousHash: lastEvent?.eventHash ?? null, eventHash: event.eventHash, canonicalPayload: event.canonicalPayload })
    return { consent: parsed.data.shareConsent, changed: true }
  })

  if ("error" in result) return apiError(result.error === "not_found" ? "No se encontró la propuesta." : "El consentimiento ya no se puede cambiar después del cierre editorial.", result.error === "not_found" ? 404 : 409)
  return apiJson({ shareConsent: result.consent, message: result.changed ? "Consentimiento actualizado y registrado." : "El consentimiento ya tenía ese valor." })
}
