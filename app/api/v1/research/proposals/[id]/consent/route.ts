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

  const result = await db.transaction(async (transaction) => {
    const [proposal] = await transaction
      .select({
        id: researchProposals.id,
        status: researchProposals.status,
        shareConsent: researchProposals.shareConsent,
      })
      .from(researchProposals)
      .where(and(eq(researchProposals.id, id), eq(researchProposals.userId, session.user.id)))
      .for("update")
      .limit(1)

    if (!proposal) return { error: "not_found" as const }
    if (proposal.status === "withdrawn") return { error: "closed" as const }

    // Consent withdrawal after publication removes the record from public
    // catalog queries. It cannot recall copies already exported or mirrored.
    const withdrawPublication = proposal.status === "published" && !parsed.data.shareConsent
    if (proposal.shareConsent === parsed.data.shareConsent && !withdrawPublication) {
      return { consent: proposal.shareConsent, changed: false, withdrawn: false }
    }
    const nextStatus = withdrawPublication ? "withdrawn" : proposal.status

    const [lastEvent] = await transaction
      .select({ eventHash: proposalEvents.eventHash, createdAt: proposalEvents.createdAt })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, id))
      .orderBy(desc(proposalEvents.createdAt))
      .limit(1)

    const now = new Date(Math.max(Date.now(), (lastEvent?.createdAt.getTime() ?? 0) + 1))
    const action = withdrawPublication
      ? "publication_withdrawn_by_author"
      : "publication_consent_updated"
    const payload = {
      proposalId: id,
      actorId: session.user.id,
      action,
      fromStatus: proposal.status,
      toStatus: nextStatus,
      shareConsent: parsed.data.shareConsent,
      occurredAt: now.toISOString(),
    }
    const event = makeProposalEventHash(payload, lastEvent?.eventHash ?? null)

    await transaction
      .update(researchProposals)
      .set({
        shareConsent: parsed.data.shareConsent,
        status: nextStatus,
        visibility: withdrawPublication ? "private" : undefined,
        publishedAt: withdrawPublication ? null : undefined,
        updatedAt: now,
      })
      .where(eq(researchProposals.id, id))

    await transaction.insert(proposalEvents).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      proposalId: id,
      action,
      fromStatus: proposal.status,
      toStatus: nextStatus,
      detail: withdrawPublication
        ? "La persona autora retiró el consentimiento tras la publicación. El registro se retiró del catálogo público; las copias externas previas pueden persistir."
        : parsed.data.shareConsent
          ? "La persona autora autorizó la difusión pública del resumen si se publica."
          : "La persona autora retiró su autorización de difusión pública.",
      createdAt: now,
      previousHash: lastEvent?.eventHash ?? null,
      eventHash: event.eventHash,
      canonicalPayload: event.canonicalPayload,
    })

    return {
      consent: parsed.data.shareConsent,
      changed: true,
      withdrawn: withdrawPublication,
    }
  })

  if ("error" in result) {
    return apiError(
      result.error === "not_found"
        ? "No se encontró la propuesta."
        : "La propuesta ya fue retirada y no admite cambios de consentimiento.",
      result.error === "not_found" ? 404 : 409,
    )
  }

  return apiJson({
    shareConsent: result.consent,
    withdrawn: result.withdrawn,
    message: result.withdrawn
      ? "Se retiró la publicación del catálogo público. Las copias exportadas o conservadas por terceros no pueden retirarse desde TAMV."
      : result.changed
        ? "Consentimiento actualizado y registrado."
        : "El consentimiento ya tenía ese valor.",
  })
}
