import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hcuAtoms, researcherProfiles, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { getPublicHcuGraph } from "@/lib/research/queries"
import { hcuAtomSchema } from "@/lib/validation"
import { and, count, eq, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para crear un átomo privado.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 8_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = hcuAtomSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa los campos y los límites del átomo.", 400)
  const input = parsed.data
  const graph = await getPublicHcuGraph()
  if (!graph.domains.some((domain) => domain.id === input.domainId)) {
    return apiError("El dominio seleccionado no está disponible.", 400)
  }

  const [profile] = await db
    .select({ tri: researcherProfiles.tri, roleCode: researcherProfiles.roleCode })
    .from(researcherProfiles)
    .where(eq(researcherProfiles.userId, session.user.id))
    .limit(1)
  const id = crypto.randomUUID()
  const result = await db.transaction(async (transaction) => {
    const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    if (!account) return { error: "account_missing" as const }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [total] = await transaction.select({ value: count() }).from(hcuAtoms).where(and(eq(hcuAtoms.userId, session.user.id), eq(hcuAtoms.visibility, "private")))
    const [daily] = await transaction.select({ value: count() }).from(hcuAtoms).where(and(eq(hcuAtoms.userId, session.user.id), eq(hcuAtoms.visibility, "private"), gte(hcuAtoms.createdAt, since)))
    if ((total?.value ?? 0) >= 40) return { error: "limit" as const }
    if ((daily?.value ?? 0) >= 20) return { error: "rate_limit" as const }

    await transaction.insert(hcuAtoms).values({
      id,
      userId: session.user.id,
      domainId: input.domainId,
      nameEs: input.nameEs,
      nameEn: input.nameEn ?? input.nameEs,
      descriptionEs: input.descriptionEs,
      descriptionEn: input.descriptionEn ?? input.descriptionEs,
      influenceX: input.influenceX,
      riskY: input.riskY,
      evidenceZ: input.evidenceZ,
      tri: profile?.tri ?? null,
      roleCode: profile?.roleCode ?? null,
      isProvisional: true,
      isQuarantined: false,
      visibility: "private",
    })
    return { id }
  })

  if ("error" in result) {
    if (result.error === "rate_limit") return apiError("Alcanzaste el límite de 20 átomos nuevos por día.", 429)
    if (result.error === "limit") return apiError("El espacio privado admite hasta 40 átomos por cuenta.", 409)
    return apiError("No fue posible validar la cuenta.", 401)
  }
  return apiJson({ id: result.id, visibility: "private", status: "provisional" }, 201)
}
