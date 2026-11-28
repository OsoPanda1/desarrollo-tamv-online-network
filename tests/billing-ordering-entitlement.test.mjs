import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { invoiceBillingStatus, shouldApplyBillingEvent } from "../lib/billing/event-order.ts"
import { isMembershipEntitled } from "../lib/billing/entitlement.ts"

const read = (path) => readFileSync(path, "utf8")
const apply = (currentStatus, incomingStatus, eventCreated = 100, currentWatermark = 100) =>
  shouldApplyBillingEvent({ domain: "subscription", currentStatus, incomingStatus, eventCreated, currentWatermark })

test("subscription ordering rejects older events and makes equal timestamps deny-first", () => {
  assert.equal(apply("active", "canceled", 99), false)
  assert.equal(apply("active", "canceled"), true)
  assert.equal(apply("canceled", "active"), false)
  assert.equal(apply("past_due", "active"), false)
  assert.equal(apply("active", "past_due"), true)
  assert.equal(apply("canceled", "active", 101), true)
  assert.equal(apply("checkout_failed", "incomplete"), false)
})

test("checkout ordering is independent and expiry dominates failure on ties", () => {
  const checkout = (currentStatus, incomingStatus, eventCreated = 100) =>
    shouldApplyBillingEvent({ domain: "checkout", currentStatus, incomingStatus, eventCreated, currentWatermark: 100 })
  assert.equal(checkout("checkout_failed", "checkout_expired"), true)
  assert.equal(checkout("checkout_expired", "checkout_failed"), false)
  assert.equal(checkout("checkout_expired", "checkout_failed", 101), false)
  assert.equal(checkout("active", undefined, 99), false)
  assert.equal(checkout("active", undefined, 101), true)
})

test("invoice events recover payment failures without reactivating terminal or paused subscriptions", () => {
  for (const eventType of ["invoice.paid", "invoice.payment_succeeded"]) {
    assert.equal(invoiceBillingStatus("past_due", eventType), "active")
    assert.equal(invoiceBillingStatus("unpaid", eventType), "active")
    assert.equal(invoiceBillingStatus("incomplete", eventType), "active")
    for (const status of ["active", "trialing", "canceled", "incomplete_expired", "paused", "checkout_failed", "checkout_expired"]) {
      assert.equal(invoiceBillingStatus(status, eventType), status)
    }
  }
  assert.equal(invoiceBillingStatus("active", "invoice.payment_failed"), "past_due")
  assert.equal(invoiceBillingStatus("unpaid", "invoice.payment_failed"), "unpaid")
  assert.equal(invoiceBillingStatus("canceled", "invoice.payment_failed"), "canceled")
  assert.equal(invoiceBillingStatus("paused", "invoice.payment_failed"), "paused")
})

test("membership entitlement requires a live status and a future period end", () => {
  const now = Date.parse("2026-11-27T12:00:00.000Z")
  const future = new Date(now + 1)
  assert.equal(isMembershipEntitled("active", future, now), true)
  assert.equal(isMembershipEntitled("trialing", future, now), true)
  assert.equal(isMembershipEntitled("active", new Date(now), now), false)
  assert.equal(isMembershipEntitled("active", new Date(now - 1), now), false)
  assert.equal(isMembershipEntitled("active", null, now), false)
  assert.equal(isMembershipEntitled("past_due", future, now), false)
  assert.equal(isMembershipEntitled("canceled", future, now), false)
})

test("webhook uses separate ordering watermarks and derives invoice state under the row lock", () => {
  const webhook = read("app/api/webhooks/stripe/route.ts")
  assert.match(webhook, /stripeCheckoutEventCreated: membershipSubscriptions\.stripeCheckoutEventCreated/)
  assert.match(webhook, /domain === "checkout" \? current\.stripeCheckoutEventCreated : current\.stripeEventCreated/)
  assert.match(webhook, /eventCreated, "checkout"/)
  assert.match(webhook, /eventCreated, "subscription", \(current\)/)
  assert.match(webhook, /status: invoiceBillingStatus\(current\.status, event\.type\)/)
  assert.match(webhook, /!update\.currentPeriodEnd \|\| update\.currentPeriodEnd < current\.currentPeriodEnd/)
  assert.match(webhook, /Number\.isSafeInteger\(event\.created\)/)
  assert.doesNotMatch(webhook, /event\.created[^\n]*Math\.floor\(Date\.now\(\)/)
})

test("course authorization and progress mutation share the entitlement predicate and transaction", () => {
  const progress = read("app/api/memberships/course-progress/route.ts")
  const page = read("app/formacion/page.tsx")
  const facts = read("lib/achievements/facts.ts")
  for (const source of [progress, page, facts]) assert.match(source, /membershipEntitlementCondition/)
  assert.match(progress, /db\.transaction/)
  assert.match(progress, /\.for\("update"\)/)
  assert.match(progress, /transaction\.insert\(memberCourseProgress\)/)
})

test("forward migrations add checkout ordering and HCU reservations without rewriting history", () => {
  const billing = read("migrations/0006_stripe_checkout_ordering.sql")
  const hcu = read("migrations/0007_hcu_run_reservations.sql")
  assert.match(billing, /ADD COLUMN IF NOT EXISTS stripe_checkout_event_created/)
  assert.match(billing, /DROP INDEX IF EXISTS public\.membership_one_live_plan_per_user_idx/)
  assert.match(hcu, /CREATE TABLE IF NOT EXISTS public\.hcu_run_reservations/)
  assert.match(hcu, /CHECK \(expires_at > created_at\)/)
})
