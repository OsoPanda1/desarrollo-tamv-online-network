import { timingSafeEqual } from "node:crypto"
import { getAppRole, getRequestSession } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { adminBootstrapState, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { and, eq, isNull, count } from "drizzle-orm"
import { z } from "zod"

export const dynamic = "force-dynamic"
const bootstrapSchema = z.object({ token: z.string().min(1).max(256) })

function matchesSecret(candidate: string, expected: string) {
  const expectedBytes = Buffer.from(expected, "utf8")
  const candidateBytes = Buffer.from(candidate, "utf8")
  const paddedCandidate = Buffer.alloc(expectedBytes.length)
  candidateBytes.copy(paddedCandidate, 0, 0, expectedBytes.length)
  const equal = timingSafeEqual(expectedBytes, paddedCandidate)
  return equal && candidateBytes.length === expectedBytes.length
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await getRequestSession(request.headers)
  if (!session?.user) return apiError("Inicia sesión para configurar la moderación.", 401)
  if (await getAppRole(session.user.id) !== "member") return apiError("Esta cuenta no puede iniciar el proceso de configuración.", 409)

  const configuredToken = process.env.TAMV_ADMIN_BOOTSTRAP_TOKEN
  if (!configuredToken || configuredToken.length < 32) return apiError("La configuración inicial no está disponible.", 503)

  let body: unknown
  try {
    body = await readJsonBody(request, 2_048)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = bootstrapSchema.safeParse(body)
  if (!parsed.success || !matchesSecret(parsed.data.token, configuredToken)) return apiError("No se pudo completar la configuración.", 403)

  const now = new Date()
  const result = await db.transaction(async (transaction) => {
    const [admins] = await transaction.select({ value: count() }).from(user).where(eq(user.role, "admin"))
    if ((admins?.value ?? 0) > 0) return false

    await transaction.insert(adminBootstrapState).values({ id: 1 }).onConflictDoNothing()
    const [claim] = await transaction
      .update(adminBootstrapState)
      .set({ claimedAt: now, claimedBy: session.user.id })
      .where(and(eq(adminBootstrapState.id, 1), isNull(adminBootstrapState.claimedAt)))
      .returning({ id: adminBootstrapState.id })
    if (!claim) return false

    await transaction.update(user).set({ role: "admin", updatedAt: now }).where(eq(user.id, session.user.id))
    return true
  })

  if (!result) return apiError("La configuración inicial ya se reclamó o ya existe una cuenta administradora.", 409)
  return apiJson({ role: "admin", message: "La cuenta quedó habilitada como administradora inicial." })
}
