export type BillingOrderDomain = "checkout" | "subscription"

export type BillingStatus =
  | "pending"
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "checkout_failed"
  | "checkout_expired"

const statusPriority: Record<BillingStatus, number> = {
  pending: 0,
  trialing: 10,
  active: 20,
  incomplete: 30,
  past_due: 40,
  paused: 50,
  unpaid: 60,
  incomplete_expired: 70,
  canceled: 80,
  checkout_failed: 90,
  checkout_expired: 100,
}

const checkoutPriority: Partial<Record<BillingStatus, number>> = {
  incomplete: 0,
  checkout_failed: 10,
  checkout_expired: 20,
}

export function shouldApplyBillingEvent({
  domain,
  currentWatermark,
  eventCreated,
  currentStatus,
  incomingStatus,
}: {
  domain: BillingOrderDomain
  currentWatermark: number
  eventCreated: number
  currentStatus: string
  incomingStatus?: string
}) {
  if (domain === "checkout" && currentStatus === "checkout_expired" && incomingStatus === "checkout_failed") return false
  if (eventCreated < currentWatermark) return false
  if (eventCreated > currentWatermark) return true
  if (domain === "checkout") {
    if (!incomingStatus || !checkoutPriority[incomingStatus as BillingStatus]) return true
    const currentPriority = checkoutPriority[currentStatus as BillingStatus] ?? -1
    return (checkoutPriority[incomingStatus as BillingStatus] ?? -1) >= currentPriority
  }
  if (!incomingStatus) return true
  if (currentStatus === "canceled" && incomingStatus !== "canceled") return false
  if (incomingStatus === "canceled") return currentStatus !== "canceled"
  return (statusPriority[incomingStatus as BillingStatus] ?? 0) >= (statusPriority[currentStatus as BillingStatus] ?? 0)
}

export function invoiceBillingStatus(currentStatus: string, eventType: string) {
  if (eventType === "invoice.payment_failed") {
    if (currentStatus === "unpaid") return "unpaid"
    return ["active", "trialing", "past_due", "incomplete"].includes(currentStatus) ? "past_due" : currentStatus
  }
  return ["past_due", "unpaid", "incomplete"].includes(currentStatus) ? "active" : currentStatus
}

export function isEstablishedSubscriptionStatus(status: string) {
  return ["active", "trialing", "past_due", "unpaid", "canceled", "incomplete_expired", "paused"].includes(status)
}
