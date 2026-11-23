import { db } from "@/lib/db"
import { billingWebhookEvents, membershipSubscriptions } from "@/lib/db/schema"
import { apiError, apiJson } from "@/lib/http"
import { verifyStripeSignature } from "@/lib/billing/signature"
import { and, eq, or } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type StripeEvent = {
  id: string
  type: string
  created?: number
  data: { object: unknown }
}
type StripeCustomer = string | { id: string } | null | undefined
type StripeCheckoutSession = {
  id: string
  status?: string
  payment_status?: string
  metadata?: Record<string, string | undefined>
  customer?: StripeCustomer
  subscription?: StripeCustomer
}
type StripeSubscription = {
  id: string
  status: string
  metadata?: Record<string, string | undefined>
  customer?: StripeCustomer
  current_period_start?: number
  current_period_end?: number
  cancel_at_period_end?: boolean
}
type StripeInvoice = {
  id: string
  subscription?: StripeCustomer
}

function stripeId(value: StripeCustomer): string | null {
  return typeof value === "string" ? value : value?.id ?? null
}

function safePeriod(value?: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? new Date(value * 1000)
    : null
}

async function readRawBody(request: Request, maxBytes = 1_048_576) {
  if (!request.body) return ""
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        throw new Error("payload_too_large")
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
}

async function findMembership(transaction: Parameters<Parameters<typeof db.transaction>[0]>[0], membershipId?: string, subscriptionId?: string) {
  if (membershipId) {
    const [byId] = await transaction.select({ id: membershipSubscriptions.id })
      .from(membershipSubscriptions)
      .where(eq(membershipSubscriptions.id, membershipId))
      .limit(1)
    if (byId) return byId.id
  }
  if (subscriptionId) {
    const [bySubscription] = await transaction.select({ id: membershipSubscriptions.id })
      .from(membershipSubscriptions)
      .where(eq(membershipSubscriptions.stripeSubscriptionId, subscriptionId))
      .limit(1)
    if (bySubscription) return bySubscription.id
  }
  return null
}

async function syncMembership(
  transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
  membershipId: string | null,
  eventCreated: number,
  values: Partial<typeof membershipSubscriptions.$inferInsert>,
) {
  if (!membershipId) return
  const [current] = await transaction.select({
    id: membershipSubscriptions.id,
    stripeEventCreated: membershipSubscriptions.stripeEventCreated,
  }).from(membershipSubscriptions)
    .where(eq(membershipSubscriptions.id, membershipId))
    .for("update")
    .limit(1)
  if (!current || eventCreated < current.stripeEventCreated) return

  await transaction.update(membershipSubscriptions).set({
    ...values,
    stripeEventCreated: eventCreated,
    updatedAt: new Date(),
  }).where(eq(membershipSubscriptions.id, membershipId))
}

function subscriptionStatus(value: string) {
  const supported = new Set(["active", "trialing", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused"])
  return supported.has(value) ? value : "incomplete"
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) return apiError("Webhook billing no configurado.", 503)

  let rawBody: string
  try {
    rawBody = await readRawBody(request)
  } catch (error) {
    return apiError(error instanceof Error && error.message === "payload_too_large"
      ? "Evento demasiado grande."
      : "No fue posible leer el evento.", error instanceof Error && error.message === "payload_too_large" ? 413 : 400)
  }

  const signature = request.headers.get("stripe-signature")
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return apiError("Firma de webhook no válida.", 400)
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return apiError("JSON de webhook no válido.", 400)
  }
  if (!event || typeof event.id !== "string" || typeof event.type !== "string" || !event.data || typeof event.data.object !== "object") {
    return apiError("Estructura de evento no válida.", 400)
  }
  const eventCreated = typeof event.created === "number" && Number.isSafeInteger(event.created) ? event.created : Math.floor(Date.now() / 1000)

  try {
    const result = await db.transaction(async (transaction) => {
      const inserted = await transaction.insert(billingWebhookEvents).values({
        eventId: event.id,
        eventType: event.type,
      }).onConflictDoNothing().returning({ eventId: billingWebhookEvents.eventId })
      if (inserted.length === 0) return "duplicate" as const

      const object = event.data.object as Record<string, unknown>
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const checkout = object as unknown as StripeCheckoutSession
        const membershipId = checkout.metadata?.membershipId
        const subscriptionId = stripeId(checkout.subscription)
        const customerId = stripeId(checkout.customer)
        const [existing] = membershipId
          ? await transaction.select({ id: membershipSubscriptions.id }).from(membershipSubscriptions)
              .where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          : []
        if (existing) {
          await syncMembership(transaction, existing.id, eventCreated, {
            stripeCheckoutSessionId: checkout.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: checkout.payment_status === "paid" || checkout.payment_status === "no_payment_required"
              ? "active"
              : "pending",
          })
        }
      } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
        const checkout = object as unknown as StripeCheckoutSession
        const membershipId = checkout.metadata?.membershipId
        const [existing] = membershipId
          ? await transaction.select({ id: membershipSubscriptions.id }).from(membershipSubscriptions)
              .where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          : []
        if (existing) await syncMembership(transaction, existing.id, eventCreated, {
          status: event.type === "checkout.session.expired" ? "checkout_expired" : "checkout_failed",
        })
      } else if (event.type.startsWith("customer.subscription.")) {
        const subscription = object as unknown as StripeSubscription
        const membershipId = await findMembership(transaction, subscription.metadata?.membershipId, subscription.id)
        await syncMembership(transaction, membershipId, eventCreated, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: stripeId(subscription.customer),
          status: subscriptionStatus(subscription.status),
          currentPeriodStart: safePeriod(subscription.current_period_start),
          currentPeriodEnd: safePeriod(subscription.current_period_end),
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        })
      } else if (event.type === "invoice.payment_failed" || event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
        const invoice = object as unknown as StripeInvoice
        const subscriptionId = stripeId(invoice.subscription)
        const membershipId = await findMembership(transaction, undefined, subscriptionId ?? undefined)
        if (membershipId) {
          const [current] = await transaction.select({ status: membershipSubscriptions.status })
            .from(membershipSubscriptions).where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          const status = event.type === "invoice.payment_failed"
            ? "past_due"
            : current?.status === "past_due" || current?.status === "unpaid" ? "active" : current?.status
          if (status) await syncMembership(transaction, membershipId, eventCreated, { status })
        }
      }
      return "processed" as const
    })

    return apiJson({ received: true, duplicate: result === "duplicate" })
  } catch (error) {
    console.error("TAMV Stripe webhook transaction failed", {
      eventType: event.type,
      errorType: error instanceof Error ? error.name : "unknown",
    })
    return apiError("No fue posible procesar el evento; Stripe puede reintentarlo.", 500)
  }
}
