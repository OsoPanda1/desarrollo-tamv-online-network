import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { membershipSubscriptions } from "@/lib/db/schema"
import { isMembershipEntitled } from "@/lib/billing/entitlement"
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
        stripeCheckoutUrl: membershipSubscriptions.stripeCheckoutUrl,
        currentPeriodStart: membershipSubscriptions.currentPeriodStart,
        currentPeriodEnd: membershipSubscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: membershipSubscriptions.cancelAtPeriodEnd,
        createdAt: membershipSubscriptions.createdAt,
      })
      .from(membershipSubscriptions)
      .where(eq(membershipSubscriptions.userId, session.user.id))
      .orderBy(desc(membershipSubscriptions.createdAt))
    const now = Date.now()
    const memberships = records.map((record) => {
      const { stripeCheckoutUrl, ...safeRecord } = record
      let checkoutUrl: string | null = null
      const ageMs = now - record.createdAt.getTime()
      if (record.status === "pending" && stripeCheckoutUrl && ageMs >= 0 && ageMs < 32 * 60 * 1000) {
        try {
          const candidate = new URL(stripeCheckoutUrl)
          if (candidate.protocol === "https:" && candidate.hostname === "checkout.stripe.com") checkoutUrl = candidate.toString()
        } catch {
          checkoutUrl = null
        }
      }
      return { ...safeRecord, checkoutUrl, entitled: isMembershipEntitled(record.status, record.currentPeriodEnd, now) }
    })
    return apiJson({ memberships })
  } catch {
    return apiError("El estado de facturación no está disponible. Comprueba que las migraciones estén aplicadas.", 503)
  }
}
