import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { proposalEvidence, researchProposals } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { evidenceSchema } from "@/lib/validation"
import { and, desc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para adjuntar una referencia.", 401)
  const { id: proposalId } = await context.params

  let body: unknown
  try {
    body = await readJsonBody(request, 8_192)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = evidenceSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa la etiqueta, el tipo y la URL de la referencia.", 400)

  const [proposal] = await db
    .select({ id: researchProposals.id, status: researchProposals.status })
    .from(researchProposals)
    .where(and(eq(researchProposals.id, proposalId), eq(researchProposals.userId, session.user.id)))
    .limit(1)
  if (!proposal) return apiError("No se encontró la propuesta.", 404)
  if (["published", "withdrawn"].includes(proposal.status)) return apiError("Esta propuesta ya no admite nuevas referencias.", 409)

  const [lastEvidence] = await db
    .select({ version: proposalEvidence.version })
    .from(proposalEvidence)
    .where(and(eq(proposalEvidence.proposalId, proposalId), eq(proposalEvidence.userId, session.user.id)))
    .orderBy(desc(proposalEvidence.createdAt))
    .limit(1)

  const [evidence] = await db
    .insert(proposalEvidence)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      proposalId,
      label: parsed.data.label,
      kind: parsed.data.kind,
      url: parsed.data.url,
      description: parsed.data.description || null,
      license: parsed.data.license || null,
      version: (lastEvidence?.version ?? 0) + 1,
      visibility: "private",
      verificationStatus: "unverified",
    })
    .returning({ id: proposalEvidence.id, label: proposalEvidence.label, url: proposalEvidence.url, version: proposalEvidence.version, verificationStatus: proposalEvidence.verificationStatus })

  return apiJson({ evidence, note: "La referencia se guarda en privado. No se descarga ni se verifica automáticamente." }, 201)
}
