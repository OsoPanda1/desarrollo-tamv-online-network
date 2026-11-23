import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { membershipSubscriptions } from "@/lib/db/schema"
import { apiError, apiJson } from "@/lib/http"
import { desc, eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para consultar tus membresías.", 401)

  try {
    const records = await db
      .select({
        id: membershipSubscriptions.id,
        planId: membershipSubscriptions.planId,
        status: membershipSubscriptions.status,
        amountMxn: membershipSubscriptions.amountMxn,
        currency: membershipSubscriptions.currency,
        businessName: membershipSubscriptions.businessName,
        currentPeriodStart: membershipSubscriptions.currentPeriodStart,
        currentPeriodEnd: membershipSubscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: membershipSubscriptions.cancelAtPeriodEnd,
        createdAt: membershipSubscriptions.createdAt,
      })
      .from(membershipSubscriptions)
      .where(eq(membershipSubscriptions.userId, session.user.id))
      .orderBy(desc(membershipSubscriptions.createdAt))
    return apiJson({ memberships: records })
  } catch {
    return apiError("El estado de facturación no está disponible. Comprueba que las migraciones estén aplicadas.", 503)
  }
}
