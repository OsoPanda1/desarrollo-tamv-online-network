import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { membershipSubscriptions, user } from "@/lib/db/schema"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { getMembershipPlan, LIVE_MEMBERSHIP_STATUSES, MEMBERSHIP_TERMS_VERSION } from "@/lib/billing/plans"
import { isMembershipEntitled } from "@/lib/billing/entitlement"
import { getAppBaseUrl, getStripeSecret, stripePost } from "@/lib/billing/stripe"
import { and, desc, eq, inArray } from "drizzle-orm"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkoutInputSchema = z.object({
  planId: z.enum(["individual", "business"]),
  businessName: z.string().trim().min(2).max(160).optional(),
  acceptedTerms: z.literal(true),
  termsVersion: z.literal(MEMBERSHIP_TERMS_VERSION),
}).strict()

type StripeCheckoutSession = {
  id: string
  url: string | null
  customer?: string | { id: string } | null
}

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null
}

function isProductionDeployment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production"
  return process.env.NODE_ENV === "production"
}

type BillingConfiguration =
  | { error: string }
  | {
      mode: "test" | "live"
      secret: string
      webhookSecret: string
      appBaseUrl: string
      automaticTax: boolean
      taxBehavior: string | undefined
    }

function validateBillingConfiguration(): BillingConfiguration {
  const mode = process.env.TAMV_BILLING_MODE?.trim() || "disabled"
  const secret = getStripeSecret()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const appBaseUrl = getAppBaseUrl()

  if (mode === "disabled") return { error: "La contratación de membresías está deshabilitada hasta completar la configuración y aprobación de producción." } as const
  if (mode !== "test" && mode !== "live") return { error: "La configuración de facturación no es válida." } as const
  if (!secret || !webhookSecret || !appBaseUrl) return { error: "La facturación está incompleta. Verifica las variables de entorno requeridas." } as const

  if (mode === "test") {
    if (!secret.startsWith("sk_test_") || isProductionDeployment()) {
      return { error: "El checkout de prueba solo puede usarse con credenciales Stripe de prueba fuera de producción." } as const
    }
  }

  if (mode === "live") {
    // Vercel sets VERCEL_ENV for real deployments. Do not treat a local
    // NODE_ENV=production build as permission to charge real payment methods.
    if (process.env.VERCEL_ENV !== "production") {
      return { error: "El checkout con cobros live solo se permite en un deployment Vercel de producción." } as const
    }
    if (!secret.startsWith("sk_live_")) {
      return { error: "El modo live requiere credenciales live verificadas de Stripe." } as const
    }
    const launchApprovals = [
      process.env.TAMV_MEMBERSHIP_TERMS_VERSION === MEMBERSHIP_TERMS_VERSION,
      process.env.TAMV_MEMBERSHIP_PRIVACY_APPROVED === "true",
      process.env.TAMV_MEMBERSHIP_LEGAL_APPROVED === "true",
      process.env.TAMV_MEMBERSHIP_TAX_APPROVED === "true",
      process.env.TAMV_MEMBERSHIP_REFUNDS_APPROVED === "true",
    ]
    if (launchApprovals.some((approved) => !approved)) {
      return { error: "El checkout live está bloqueado hasta aprobar las condiciones, privacidad, operación legal, tratamiento fiscal y política de reembolsos." } as const
    }
  }

  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true"
  const taxBehavior = process.env.STRIPE_TAX_BEHAVIOR
  if (automaticTax && taxBehavior !== "inclusive" && taxBehavior !== "exclusive") {
    return { error: "La configuración fiscal del checkout está incompleta." } as const
  }
  return { mode, secret, webhookSecret, appBaseUrl, automaticTax, taxBehavior } as const
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
  if (!parsed.success) return apiError("Acepta las condiciones vigentes y selecciona un plan válido.", 400)
  const input = parsed.data
  const plan = getMembershipPlan(input.planId)
  if (!plan || (input.planId === "business" && !input.businessName)) {
    return apiError("La membresía empresarial requiere el nombre de la organización.", 400)
  }

  const config = validateBillingConfiguration()
  if ("error" in config) return apiError(config.error, 503)

  const membershipId = crypto.randomUUID()
  const now = new Date()
  let reservation: { id: string } | null = null

  try {
    const result = await db.transaction(async (transaction) => {
      const [account] = await transaction
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, session.user.id))
        .for("update")
      if (!account) return { state: "account_missing" as const }

      const [existing] = await transaction
        .select({
          id: membershipSubscriptions.id,
          status: membershipSubscriptions.status,
          currentPeriodEnd: membershipSubscriptions.currentPeriodEnd,
          stripeCheckoutUrl: membershipSubscriptions.stripeCheckoutUrl,
          createdAt: membershipSubscriptions.createdAt,
        })
        .from(membershipSubscriptions)
        .where(and(
          eq(membershipSubscriptions.userId, session.user.id),
          eq(membershipSubscriptions.planId, input.planId),
          inArray(membershipSubscriptions.status, [...LIVE_MEMBERSHIP_STATUSES]),
        ))
        .orderBy(desc(membershipSubscriptions.createdAt))
        .limit(1)

      const expiredActive = existing &&
        (existing.status === "active" || existing.status === "trialing") &&
        !isMembershipEntitled(existing.status, existing.currentPeriodEnd, now.getTime())
      if (existing && !expiredActive) {
        const ageMs = now.getTime() - existing.createdAt.getTime()
        if (
          existing.status === "pending" &&
          existing.stripeCheckoutUrl &&
          ageMs >= 0 &&
          ageMs < 32 * 60 * 1000
        ) {
          return { state: "resume" as const, url: existing.stripeCheckoutUrl }
        }
        return { state: "existing" as const, status: existing.status }
      }

      await transaction.insert(membershipSubscriptions).values({
        id: membershipId,
        userId: session.user.id,
        planId: input.planId,
        status: "pending",
        amountMxn: plan.amountMxn,
        currency: plan.currency,
        businessName: input.planId === "business" ? input.businessName ?? null : null,
        termsVersion: input.termsVersion,
        termsAcceptedAt: now,
      })
      return { state: "reserved" as const, id: membershipId }
    })

    if (result.state === "account_missing") return apiError("La cuenta ya no está disponible. Inicia sesión de nuevo.", 401)
    if (result.state === "resume") {
      try {
        const resumeUrl = new URL(result.url)
        if (resumeUrl.protocol === "https:" && resumeUrl.hostname === "checkout.stripe.com") {
          return apiJson({ checkoutUrl: resumeUrl.toString(), resumed: true })
        }
      } catch {
        // Do not redirect to an unexpected value read from persisted state.
      }
      return apiError("El checkout pendiente ya no tiene una URL segura. Espera a que Stripe confirme su vencimiento antes de volver a contratar.", 409)
    }
    if (result.state === "existing") {
      const message = result.status === "pending"
        ? "Ya existe un checkout pendiente. Reanúdalo en tu otra pestaña o espera a que Stripe confirme su vencimiento; no se abrirá una segunda sesión para evitar un cobro duplicado."
        : "Ya existe una suscripción para este plan. Gestiona la suscripción actual desde el portal de facturación."
      return apiError(message, 409)
    }
    reservation = { id: result.id }

    const form = new URLSearchParams()
    form.set("mode", "subscription")
    form.set("success_url", `${config.appBaseUrl}/membresias?checkout=success&session_id={CHECKOUT_SESSION_ID}`)
    form.set("cancel_url", `${config.appBaseUrl}/membresias?checkout=cancelled`)
    form.set("expires_at", String(Math.floor(Date.now() / 1000) + 35 * 60))
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
    if (input.planId === "business" && input.businessName) {
      form.set("metadata[businessName]", input.businessName)
      form.set("subscription_data[metadata][businessName]", input.businessName)
    }

    if (config.automaticTax) {
      form.set("automatic_tax[enabled]", "true")
      form.set("line_items[0][price_data][tax_behavior]", config.taxBehavior!)
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
      stripeCheckoutUrl: checkoutUrl.toString(),
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
        // Preserve the original failure; the pending reservation is recoverable after 30 minutes.
      }
    }
    console.error("TAMV membership checkout could not be created", {
      mode: config.mode,
      errorType: error instanceof Error ? error.name : "unknown",
    })
    return apiError("No fue posible iniciar el checkout. No se ha confirmado ningún cobro; vuelve a intentarlo más tarde.", 503)
  }
}
