import { db } from "@/lib/db"
import { billingWebhookEvents, membershipSubscriptions } from "@/lib/db/schema"
import { apiError, apiJson } from "@/lib/http"
import { verifyStripeSignature } from "@/lib/billing/signature"
import { invoiceBillingStatus, isEstablishedSubscriptionStatus, shouldApplyBillingEvent, type BillingOrderDomain } from "@/lib/billing/event-order"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type BillingTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

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

async function findMembership(transaction: BillingTransaction, membershipId?: string, subscriptionId?: string) {
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

type MembershipSnapshot = {
  id: string
  status: string
  stripeEventCreated: number
  stripeCheckoutEventCreated: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeCheckoutSessionId: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

type MembershipUpdate = Partial<typeof membershipSubscriptions.$inferInsert>

async function syncMembership(
  transaction: BillingTransaction,
  membershipId: string | null,
  eventCreated: number,
  domain: BillingOrderDomain,
  values: MembershipUpdate | ((current: MembershipSnapshot) => MembershipUpdate),
) {
  if (!membershipId) return
  const [current] = await transaction.select({
    id: membershipSubscriptions.id,
    status: membershipSubscriptions.status,
    stripeEventCreated: membershipSubscriptions.stripeEventCreated,
    stripeCheckoutEventCreated: membershipSubscriptions.stripeCheckoutEventCreated,
    stripeCustomerId: membershipSubscriptions.stripeCustomerId,
    stripeSubscriptionId: membershipSubscriptions.stripeSubscriptionId,
    stripeCheckoutSessionId: membershipSubscriptions.stripeCheckoutSessionId,
    currentPeriodEnd: membershipSubscriptions.currentPeriodEnd,
    cancelAtPeriodEnd: membershipSubscriptions.cancelAtPeriodEnd,
  }).from(membershipSubscriptions)
    .where(eq(membershipSubscriptions.id, membershipId))
    .for("update")
    .limit(1)
  if (!current) return

  const update = typeof values === "function" ? values(current) : { ...values }
  const currentWatermark = domain === "checkout" ? current.stripeCheckoutEventCreated : current.stripeEventCreated
  if (!shouldApplyBillingEvent({
    domain,
    currentWatermark,
    eventCreated,
    currentStatus: current.status,
    incomingStatus: update.status,
  })) return

  if (domain === "checkout") {
    if (current.status === "checkout_expired" && update.status === "checkout_failed") return
    if (update.status && isEstablishedSubscriptionStatus(current.status)) delete update.status
    update.stripeCheckoutSessionId = current.stripeCheckoutSessionId ?? update.stripeCheckoutSessionId
    update.stripeCustomerId = current.stripeCustomerId ?? update.stripeCustomerId
    update.stripeSubscriptionId = current.stripeSubscriptionId ?? update.stripeSubscriptionId
    update.stripeCheckoutEventCreated = eventCreated
  } else {
    if (
      (current.status === "checkout_expired" || current.status === "checkout_failed") &&
      update.status === "incomplete"
    ) return
    update.stripeCustomerId = current.stripeCustomerId ?? update.stripeCustomerId
    update.stripeSubscriptionId = current.stripeSubscriptionId ?? update.stripeSubscriptionId
    if (current.currentPeriodEnd && (!update.currentPeriodEnd || update.currentPeriodEnd < current.currentPeriodEnd)) {
      update.currentPeriodEnd = current.currentPeriodEnd
    }
    if (eventCreated === currentWatermark && typeof update.cancelAtPeriodEnd === "boolean") {
      update.cancelAtPeriodEnd = current.cancelAtPeriodEnd || update.cancelAtPeriodEnd
    }
    update.stripeEventCreated = eventCreated
  }

  await transaction.update(membershipSubscriptions).set({
    ...update,
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
  if (!event || typeof event.id !== "string" || typeof event.type !== "string" || !event.data || typeof event.data.object !== "object" || event.data.object === null) {
    return apiError("Estructura de evento no válida.", 400)
  }
  if (typeof event.created !== "number" || !Number.isSafeInteger(event.created) || event.created <= 0) {
    return apiError("La fecha del evento no es válida.", 400)
  }
  const eventCreated = event.created

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
          ? await transaction.select({ id: membershipSubscriptions.id, userId: membershipSubscriptions.userId, planId: membershipSubscriptions.planId }).from(membershipSubscriptions)
              .where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          : []
        if (
          existing &&
          checkout.metadata?.userId === existing.userId &&
          checkout.metadata?.planId === existing.planId
        ) {
          await syncMembership(transaction, existing.id, eventCreated, "checkout", {
            stripeCheckoutSessionId: checkout.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          })
        }
      } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
        const checkout = object as unknown as StripeCheckoutSession
        const membershipId = checkout.metadata?.membershipId
        const [existing] = membershipId
          ? await transaction.select({ id: membershipSubscriptions.id, userId: membershipSubscriptions.userId, planId: membershipSubscriptions.planId }).from(membershipSubscriptions)
              .where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          : []
        if (
          existing &&
          checkout.metadata?.userId === existing.userId &&
          checkout.metadata?.planId === existing.planId
        ) await syncMembership(transaction, existing.id, eventCreated, "checkout", {
          status: event.type === "checkout.session.expired" ? "checkout_expired" : "checkout_failed",
        })
      } else if (event.type.startsWith("customer.subscription.")) {
        const subscription = object as unknown as StripeSubscription
        const membershipId = await findMembership(transaction, subscription.metadata?.membershipId, subscription.id)
        const [matching] = membershipId
          ? await transaction.select({
              id: membershipSubscriptions.id,
              userId: membershipSubscriptions.userId,
              planId: membershipSubscriptions.planId,
            }).from(membershipSubscriptions).where(eq(membershipSubscriptions.id, membershipId)).limit(1)
          : []
        if (
          matching &&
          subscription.metadata?.membershipId === matching.id &&
          subscription.metadata?.userId === matching.userId &&
          subscription.metadata?.planId === matching.planId
        ) await syncMembership(transaction, matching.id, eventCreated, "subscription", {
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
          await syncMembership(transaction, membershipId, eventCreated, "subscription", (current) => ({
            status: invoiceBillingStatus(current.status, event.type),
          }))
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
