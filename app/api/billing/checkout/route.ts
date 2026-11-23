import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { membershipSubscriptions, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { getMembershipPlan, isMembershipPlanId, LIVE_MEMBERSHIP_STATUSES } from "@/lib/billing/plans"
import { getAppBaseUrl, getStripeSecret, stripePost } from "@/lib/billing/stripe"
import { and, eq, inArray, lt } from "drizzle-orm"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkoutInputSchema = z.object({
  planId: z.enum(["individual", "business"]),
  businessName: z.string().trim().min(2).max(160).optional(),
}).strict()

type StripeCheckoutSession = {
  id: string
  url: string | null
  customer?: string | { id: string } | null
}

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para contratar una membresía.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 8_192)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }

  const parsed = checkoutInputSchema.safeParse(body)
  if (!parsed.success) return apiError("Selecciona un plan válido y completa los datos obligatorios.", 400)
  const input = parsed.data
  const plan = getMembershipPlan(input.planId)
  if (!plan || (input.planId === "business" && !input.businessName)) {
    return apiError("La membresía empresarial requiere el nombre de la organización.", 400)
  }

  const stripeSecret = getStripeSecret()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const appBaseUrl = getAppBaseUrl()
  if (!stripeSecret || !webhookSecret || !appBaseUrl) {
    return apiError("La contratación está temporalmente deshabilitada hasta completar la configuración segura de facturación.", 503)
  }

  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true"
  const taxBehavior = process.env.STRIPE_TAX_BEHAVIOR
  if (automaticTax && taxBehavior !== "inclusive" && taxBehavior !== "exclusive") {
    return apiError("La configuración fiscal del checkout está incompleta.", 503)
  }

  const membershipId = crypto.randomUUID()
  const now = new Date()
  const staleBefore = new Date(now.getTime() - 30 * 60 * 1000)
  let reservation: { id: string } | null = null

  try {
    const result = await db.transaction(async (transaction) => {
      const [account] = await transaction
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, session.user.id))
        .for("update")
      if (!account) return { state: "account_missing" as const }

      await transaction
        .update(membershipSubscriptions)
        .set({ status: "checkout_expired", updatedAt: now })
        .where(and(
          eq(membershipSubscriptions.userId, session.user.id),
          eq(membershipSubscriptions.planId, input.planId),
          eq(membershipSubscriptions.status, "pending"),
          lt(membershipSubscriptions.createdAt, staleBefore),
        ))

      const [existing] = await transaction
        .select({ id: membershipSubscriptions.id, status: membershipSubscriptions.status })
        .from(membershipSubscriptions)
        .where(and(
          eq(membershipSubscriptions.userId, session.user.id),
          eq(membershipSubscriptions.planId, input.planId),
          inArray(membershipSubscriptions.status, [...LIVE_MEMBERSHIP_STATUSES]),
        ))
        .limit(1)

      if (existing) return { state: "existing" as const, status: existing.status }

      await transaction.insert(membershipSubscriptions).values({
        id: membershipId,
        userId: session.user.id,
        planId: input.planId,
        status: "pending",
        amountMxn: plan.amountMxn,
        currency: plan.currency,
        businessName: input.planId === "business" ? input.businessName ?? null : null,
      })
      return { state: "reserved" as const, id: membershipId }
    })

    if (result.state === "account_missing") return apiError("La cuenta ya no está disponible. Inicia sesión de nuevo.", 401)
    if (result.state === "existing") {
      return apiError("Ya existe una suscripción o un checkout pendiente para este plan. Gestiona la suscripción actual o espera 30 minutos si abandonaste el checkout.", 409)
    }
    reservation = { id: result.id }

    const form = new URLSearchParams()
    form.set("mode", "subscription")
    form.set("success_url", `${appBaseUrl}/membresias?checkout=success&session_id={CHECKOUT_SESSION_ID}`)
    form.set("cancel_url", `${appBaseUrl}/membresias?checkout=cancelled`)
    form.set("client_reference_id", session.user.id)
    form.set("customer_email", session.user.email)
    form.set("locale", "auto")
    form.set("billing_address_collection", "required")
    form.set("payment_method_collection", "always")
    form.set("line_items[0][quantity]", "1")
    form.set("line_items[0][price_data][currency]", plan.currency)
    form.set("line_items[0][price_data][unit_amount]", String(plan.amountMxn * 100))
    form.set("line_items[0][price_data][recurring][interval]", "month")
    form.set("line_items[0][price_data][product_data][name]", plan.name)
    form.set("line_items[0][price_data][product_data][description]", plan.description)
    form.set("metadata[membershipId]", membershipId)
    form.set("metadata[userId]", session.user.id)
    form.set("metadata[planId]", plan.id)
    form.set("subscription_data[metadata][membershipId]", membershipId)
    form.set("subscription_data[metadata][userId]", session.user.id)
    form.set("subscription_data[metadata][planId]", plan.id)

    if (automaticTax) {
      form.set("automatic_tax[enabled]", "true")
      form.set("line_items[0][price_data][tax_behavior]", taxBehavior!)
    }

    const checkout = await stripePost<StripeCheckoutSession>(
      "checkout/sessions",
      form,
      `tamv-membership-checkout-${membershipId}`,
    )

    let checkoutUrl: URL
    try {
      checkoutUrl = new URL(checkout.url ?? "")
    } catch {
      throw new Error("Stripe did not return a valid checkout URL.")
    }
    if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
      throw new Error("Stripe returned an unexpected checkout host.")
    }

    await db.update(membershipSubscriptions).set({
      stripeCheckoutSessionId: checkout.id,
      stripeCustomerId: stripeId(checkout.customer),
      updatedAt: new Date(),
    }).where(eq(membershipSubscriptions.id, membershipId))

    return apiJson({ checkoutUrl: checkoutUrl.toString() })
  } catch (error) {
    if (reservation) {
      try {
        await db.update(membershipSubscriptions).set({
          status: "checkout_failed",
          updatedAt: new Date(),
        }).where(and(
          eq(membershipSubscriptions.id, reservation.id),
          eq(membershipSubscriptions.status, "pending"),
        ))
      } catch {
        // Preserve the original failure; the pending reservation expires after 30 minutes.
      }
    }
    console.error("TAMV membership checkout could not be created", {
      errorType: error instanceof Error ? error.name : "unknown",
    })
    return apiError("No fue posible iniciar el checkout. No se ha confirmado ningún cobro; vuelve a intentarlo más tarde.", 503)
  }
}
