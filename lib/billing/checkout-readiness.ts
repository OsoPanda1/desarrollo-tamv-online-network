import "server-only"

import { getStripeSecret, getAppBaseUrl } from "./stripe"
import { MEMBERSHIP_TERMS_VERSION } from "./plans"

/**
 * Single server-side source of truth for whether the UI may expose the live
 * checkout control. The checkout API independently repeats the critical
 * authorization/configuration checks; this helper is a UX gate, not the
 * security boundary for Stripe operations.
 */
export function isLiveMembershipCheckoutReady(): boolean {
  const billingMode = process.env.TAMV_BILLING_MODE?.trim() || "disabled"
  const secret = getStripeSecret()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || ""
  const appBaseUrl = getAppBaseUrl()

  const approvalsPresent = [
    process.env.TAMV_MEMBERSHIP_TERMS_VERSION === MEMBERSHIP_TERMS_VERSION,
    process.env.TAMV_MEMBERSHIP_PRIVACY_APPROVED === "true",
    process.env.TAMV_MEMBERSHIP_LEGAL_APPROVED === "true",
    process.env.TAMV_MEMBERSHIP_TAX_APPROVED === "true",
    process.env.TAMV_MEMBERSHIP_REFUNDS_APPROVED === "true",
  ].every(Boolean)

  const taxConfigurationValid = process.env.STRIPE_AUTOMATIC_TAX_ENABLED !== "true"
    || process.env.STRIPE_TAX_BEHAVIOR === "inclusive"
    || process.env.STRIPE_TAX_BEHAVIOR === "exclusive"

  return billingMode === "live"
    && process.env.VERCEL_ENV === "production"
    && Boolean(secret?.startsWith("sk_live_"))
    && Boolean(webhookSecret)
    && Boolean(appBaseUrl?.startsWith("https://"))
    && approvalsPresent
    && taxConfigurationValid
}
