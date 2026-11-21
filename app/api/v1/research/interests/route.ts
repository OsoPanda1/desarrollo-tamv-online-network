import { collaborationInterests, researchTopics, user } from "@/lib/db/schema"
import { db } from "@/lib/db"
import { getRequestSession } from "@/lib/auth-helpers"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { interestSchema } from "@/lib/validation"
import { and, count, eq, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await getRequestSession(request.headers)
  if (!session?.user) return apiError("Inicia sesión para guardar tu interés.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 8_192)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }

  const parsed = interestSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa el tema, el tipo de colaboración y el mensaje.", 400)
  const input = parsed.data
  const [topic] = await db
    .select({ id: researchTopics.id })
    .from(researchTopics)
    .where(and(eq(researchTopics.id, input.topicId), eq(researchTopics.userId, "system"), eq(researchTopics.status, "open")))
    .limit(1)
  if (!topic) return apiError("Este tema no está disponible para recibir intereses.", 404)

  const result = await db.transaction(async (transaction) => {
    const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    if (!account) return { error: "account_missing" as const }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [dailyCount] = await transaction
      .select({ value: count() })
      .from(collaborationInterests)
      .where(and(eq(collaborationInterests.userId, session.user.id), gte(collaborationInterests.createdAt, since)))
    if ((dailyCount?.value ?? 0) >= 8) return { error: "rate_limit" as const }

    const [interest] = await transaction
      .insert(collaborationInterests)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        topicId: input.topicId,
        interestType: input.interestType,
        message: input.message,
        consentToShare: input.consentToShare,
        status: "received",
      })
      .returning({ id: collaborationInterests.id, createdAt: collaborationInterests.createdAt })
    return { interest }
  })

  if ("error" in result) {
    if (result.error === "rate_limit") return apiError("Alcanzaste el límite diario de solicitudes. Inténtalo mañana.", 429)
    return apiError("No fue posible validar la cuenta de investigación.", 401)
  }
  return apiJson({ interest: result.interest, message: "Tu interés quedó guardado en el portal. No se comparte fuera de TAMV sin tu consentimiento." }, 201)
}
