import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { memberCourseProgress, membershipSubscriptions } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { COURSE_MODULE_IDS, COURSE_SLUG, isCourseModuleId } from "@/lib/billing/plans"
import { membershipEntitlementCondition } from "@/lib/billing/entitlement-query"
import { and, eq, inArray } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function paidMember(userId: string) {
  const [membership] = await db.select({ id: membershipSubscriptions.id })
    .from(membershipSubscriptions)
    .where(membershipEntitlementCondition(userId))
    .limit(1)
  return Boolean(membership)
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para consultar el progreso.", 401)

  try {
    if (!(await paidMember(session.user.id))) return apiError("El curso requiere una membresía activa.", 403)
    const records = await db.select({ moduleId: memberCourseProgress.moduleId, completedAt: memberCourseProgress.completedAt })
      .from(memberCourseProgress)
      .where(and(
        eq(memberCourseProgress.userId, session.user.id),
        eq(memberCourseProgress.courseSlug, COURSE_SLUG),
        inArray(memberCourseProgress.moduleId, [...COURSE_MODULE_IDS]),
      ))
    return apiJson({ completed: records.map((item) => item.moduleId), records })
  } catch {
    return apiError("El progreso del curso no está disponible. Comprueba las migraciones.", 503)
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para registrar el progreso.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 2_048)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  if (!body || typeof body !== "object") return apiError("Solicitud no válida.", 400)
  const input = body as { moduleId?: unknown; completed?: unknown }
  if (!isCourseModuleId(input.moduleId) || typeof input.completed !== "boolean") {
    return apiError("Módulo o estado de progreso no válido.", 400)
  }
  const moduleId = input.moduleId
  const completed = input.completed

  try {
    const updated = await db.transaction(async (transaction) => {
      const [membership] = await transaction.select({ id: membershipSubscriptions.id })
        .from(membershipSubscriptions)
        .where(membershipEntitlementCondition(session.user.id))
        .for("update")
        .limit(1)
      if (!membership) return false

      if (completed) {
        await transaction.insert(memberCourseProgress).values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          courseSlug: COURSE_SLUG,
          moduleId,
          completedAt: new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing()
      } else {
        await transaction.delete(memberCourseProgress).where(and(
          eq(memberCourseProgress.userId, session.user.id),
          eq(memberCourseProgress.courseSlug, COURSE_SLUG),
          eq(memberCourseProgress.moduleId, moduleId),
        ))
      }
      return true
    })
    if (!updated) return apiError("El curso requiere una membresía activa.", 403)

    return apiJson({ updated: true, moduleId, completed })
  } catch {
    return apiError("No fue posible guardar el progreso. Comprueba las migraciones.", 503)
  }
}
