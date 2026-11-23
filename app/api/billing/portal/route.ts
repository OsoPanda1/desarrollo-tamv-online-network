import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { membershipSubscriptions } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { getAppBaseUrl, stripePost } from "@/lib/billing/stripe"
import { and, desc, eq, inArray } from "drizzle-orm"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const portalInputSchema = z.object({
  planId: z.enum(["individual", "business"]),
}).strict()

type StripePortalSession = { url: string }

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para gestionar tu membresía.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 2_048)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = portalInputSchema.safeParse(body)
  if (!parsed.success) return apiError("Selecciona un plan válido.", 400)

  const appBaseUrl = getAppBaseUrl()
  if (!appBaseUrl || !process.env.STRIPE_SECRET_KEY) {
    return apiError("La gestión de facturación está temporalmente deshabilitada.", 503)
  }

  try {
    const [membership] = await db
      .select({
        stripeCustomerId: membershipSubscriptions.stripeCustomerId,
        status: membershipSubscriptions.status,
      })
      .from(membershipSubscriptions)
      .where(and(
        eq(membershipSubscriptions.userId, session.user.id),
        eq(membershipSubscriptions.planId, parsed.data.planId),
        inArray(membershipSubscriptions.status, ["active", "trialing", "past_due", "unpaid", "paused"]),
      ))
      .orderBy(desc(membershipSubscriptions.createdAt))
      .limit(1)

    if (!membership?.stripeCustomerId) {
      return apiError("No encontramos una suscripción administrable para ese plan.", 404)
    }

    const form = new URLSearchParams()
    form.set("customer", membership.stripeCustomerId)
    form.set("return_url", `${appBaseUrl}/membresias`)
    const portal = await stripePost<StripePortalSession>("billing_portal/sessions", form)
    const portalUrl = new URL(portal.url)
    if (portalUrl.protocol !== "https:" || portalUrl.hostname !== "billing.stripe.com") {
      return apiError("El proveedor devolvió una URL de gestión no esperada.", 502)
    }
    return apiJson({ portalUrl: portalUrl.toString() })
  } catch (error) {
    console.error("TAMV billing portal could not be created", {
      errorType: error instanceof Error ? error.name : "unknown",
    })
    return apiError("No fue posible abrir la gestión de facturación.", 503)
  }
}
