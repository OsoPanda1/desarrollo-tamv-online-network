import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hcuHyperedges, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { getUserHcuGraph } from "@/lib/research/queries"
import { hcuHyperedgeSchema } from "@/lib/validation"
import { and, count, eq, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para crear una hiperarista privada.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 8_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = hcuHyperedgeSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa los orígenes, destinos, fuente y límites de la relación.", 400)
  const input = parsed.data
  const graph = await getUserHcuGraph(session.user.id)
  const availableAtoms = new Set(graph.atoms.map((atom) => atom.id))
  if ([...input.sourceAtomIds, ...input.targetAtomIds].some((atomId) => !availableAtoms.has(atomId))) {
    return apiError("La relación contiene un átomo que no está disponible en tu grafo.", 400)
  }

  const id = crypto.randomUUID()
  const result = await db.transaction(async (transaction) => {
    const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    if (!account) return { error: "account_missing" as const }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [total] = await transaction.select({ value: count() }).from(hcuHyperedges).where(and(eq(hcuHyperedges.userId, session.user.id), eq(hcuHyperedges.visibility, "private")))
    const [daily] = await transaction.select({ value: count() }).from(hcuHyperedges).where(and(eq(hcuHyperedges.userId, session.user.id), eq(hcuHyperedges.visibility, "private"), gte(hcuHyperedges.createdAt, since)))
    if ((total?.value ?? 0) >= 100) return { error: "limit" as const }
    if ((daily?.value ?? 0) >= 50) return { error: "rate_limit" as const }

    await transaction.insert(hcuHyperedges).values({
      id,
      userId: session.user.id,
      sourceAtomIds: input.sourceAtomIds,
      targetAtomIds: input.targetAtomIds,
      weight: input.weight,
      sign: input.sign,
      delayYears: input.delayYears,
      tqafLevel: input.tqafLevel ?? null,
      evidenceStatus: input.evidenceStatus,
      sourceTitle: input.sourceTitle,
      sourceUrl: input.sourceUrl ?? null,
      visibility: "private",
      isActive: true,
    })
    return { id }
  })

  if ("error" in result) {
    if (result.error === "rate_limit") return apiError("Alcanzaste el límite de 50 relaciones nuevas por día.", 429)
    if (result.error === "limit") return apiError("El espacio privado admite hasta 100 relaciones por cuenta.", 409)
    return apiError("No fue posible validar la cuenta.", 401)
  }
  return apiJson({ id: result.id, visibility: "private", evidenceStatus: input.evidenceStatus }, 201)
}
