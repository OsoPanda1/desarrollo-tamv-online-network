import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MEMBERSHIP_PLANS, COURSE_MODULE_IDS, MEMBERSHIP_TERMS_VERSION } from "../lib/billing/plans.ts";
import { verifyStripeSignature } from "../lib/billing/signature.ts";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("TAMV membership plan amounts and monthly recurrence are authoritative", () => {
  assert.equal(MEMBERSHIP_PLANS.individual.amountMxn, 229);
  assert.equal(MEMBERSHIP_PLANS.business.amountMxn, 699);
  assert.equal(MEMBERSHIP_PLANS.individual.currency, "mxn");
  assert.equal(MEMBERSHIP_PLANS.business.currency, "mxn");
  assert.equal(MEMBERSHIP_PLANS.individual.interval, "month");
  assert.equal(MEMBERSHIP_PLANS.business.interval, "month");
  assert.equal(COURSE_MODULE_IDS.length, 5);
});

test("Stripe signature verifier accepts valid signatures and rejects tampering/replay", () => {
  const secret = "local-signature-fixture-not-a-credential";
  const now = 1_800_000_000_000;
  const timestamp = Math.floor(now / 1000);
  const body = '{"id":"evt_contract","type":"checkout.session.completed"}';
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
  const header = `t=${timestamp},v1=${digest}`;

  assert.equal(verifyStripeSignature(body, header, secret, now), true);
  assert.equal(verifyStripeSignature(body + " ", header, secret, now), false);
  assert.equal(verifyStripeSignature(body, header, secret, now + 600_000), false);
  assert.equal(verifyStripeSignature(body, null, secret, now), false);
});

test("billing routes use authenticated sessions and production webhook verification", () => {
  const checkout = read("app/api/billing/checkout/route.ts");
  const webhook = read("app/api/webhooks/stripe/route.ts");
  const portal = read("app/api/billing/portal/route.ts");
  assert.match(checkout, /auth\.api\.getSession/);
  assert.match(checkout, /isSameOriginRequest/);
  assert.match(checkout, /membershipSubscriptions/);
  assert.match(webhook, /verifyStripeSignature/);
  assert.match(webhook, /billingWebhookEvents/);
  assert.match(webhook, /onConflictDoNothing/);
  assert.match(portal, /auth\.api\.getSession/);
  assert.match(portal, /stripeCustomerId/);
});

test("membership materials disclose the third-party AI Lounge boundary", () => {
  const page = read("app/membresias/page.tsx");
  const course = read("app/formacion/page.tsx");
  assert.match(page, /229/);
  assert.match(page, /699/);
  assert.match(page, /ai\.lounge\.ai/);
  assert.match(page, /tercer|third.party|suscripción externa/i);
  assert.match(course, /membershipSubscriptions/);
  assert.match(course, /active/);
});

test("checkout requires an explicit current terms version and never accepts client-selected prices", () => {
  const checkout = read("app/api/billing/checkout/route.ts");
  const schema = read("lib/db/schema.ts");
  const migration = read("migrations/0003_memberships_billing.sql");
  assert.match(checkout, /acceptedTerms: z\.literal\(true\)/);
  assert.match(checkout, /termsVersion: z\.literal\(MEMBERSHIP_TERMS_VERSION\)/);
  assert.match(checkout, /termsAcceptedAt: now/);
  assert.match(checkout, /plan\.amountMxn \* 100/);
  assert.doesNotMatch(checkout, /body\.amount|input\.amount|clientPrice/i);
  assert.match(schema, /termsVersion: text\("terms_version"\)\.notNull\(\)/);
  assert.match(migration, /terms_version text NOT NULL/);
  assert.match(migration, /terms_accepted_at timestamptz NOT NULL/);
  assert.equal(MEMBERSHIP_TERMS_VERSION, "TAMV-MEMBERSHIP-TERMS-2026-11-23-v1");
});

test("billing is disabled by default and live checkout requires all production approvals", () => {
  const checkout = read("app/api/billing/checkout/route.ts");
  const env = read(".env.example");
  assert.match(checkout, /\|\| "disabled"/);
  assert.match(checkout, /isProductionDeployment\(\)/);
  assert.match(checkout, /process\.env\.VERCEL_ENV !== "production"/);
  assert.match(checkout, /sk_test_/);
  assert.match(checkout, /sk_live_/);
  assert.match(checkout, /TAMV_MEMBERSHIP_LEGAL_APPROVED/);
  assert.match(checkout, /TAMV_MEMBERSHIP_TAX_APPROVED/);
  assert.match(checkout, /TAMV_MEMBERSHIP_REFUNDS_APPROVED/);
  assert.match(env, /TAMV_BILLING_MODE=disabled/);
  assert.match(env, /STRIPE_WEBHOOK_SECRET=/);
});

test("checkout recovery avoids replacing a possibly paid session and uses an expiring Stripe session", () => {
  const checkout = read("app/api/billing/checkout/route.ts");
  const migration = read("migrations/0003_memberships_billing.sql");
  assert.match(checkout, /form\.set\("expires_at"/);
  assert.match(checkout, /stripeCheckoutUrl: checkoutUrl\.toString\(\)/);
  assert.match(checkout, /resumeUrl\.hostname === "checkout\.stripe\.com"/);
  assert.match(checkout, /no se abrirá una segunda sesión para evitar un cobro duplicado/);
  assert.doesNotMatch(checkout, /staleBefore/);
  assert.match(migration, /stripe_checkout_url text/);
});

test("course progression is server-gated to active or trialing membership and owner data", () => {
  const progressApi = read("app/api/memberships/course-progress/route.ts");
  const coursePage = read("app/formacion/page.tsx");
  assert.match(progressApi, /auth\.api\.getSession/);
  assert.match(progressApi, /inArray\(membershipSubscriptions\.status, \["active", "trialing"\]\)/);
  assert.match(progressApi, /eq\(memberCourseProgress\.userId, session\.user\.id\)/);
  assert.match(coursePage, /courseSlug: COURSE_SLUG/);
  assert.match(coursePage, /activeMembership/);
});

test("assistant inference enforces same-origin and auth redirects remain internal across sign-up", () => {
  const assistant = read("app/api/assistant/route.ts");
  const signin = read("app/sign-in/page.tsx");
  const signup = read("app/sign-up/page.tsx");
  const safeRedirect = read("lib/safe-redirect.ts");
  const authForm = read("components/auth-form.tsx");
  assert.match(assistant, /if \(!isSameOriginRequest\(request\)\)/);
  assert.match(signin, /resolveInternalRedirect/);
  assert.match(signup, /resolveInternalRedirect/);
  assert.match(signup, /redirectTo=\{redirectTo\}/);
  assert.match(safeRedirect, /url\.origin !== "https:\/\/tamv\.invalid"/);
  assert.match(safeRedirect, /String\.fromCharCode\(92\)/);
  assert.match(authForm, /encodeURIComponent\(redirectTo\)/);
});;

test("subscription webhook, not the checkout browser redirect, controls paid access", () => {
  const webhook = read("app/api/webhooks/stripe/route.ts");
  const page = read("app/membresias/page.tsx");
  const route = read("app/api/billing/checkout/route.ts");
  assert.match(webhook, /customer\.subscription\./);
  assert.doesNotMatch(webhook, /status: checkout\.payment_status === "paid"/);
  assert.match(page, /Stripe confirma la suscripción mediante el webhook firmado/);
  assert.match(route, /form\.set\("expires_at"/);
  assert.match(route, /stripeCheckoutUrl: checkoutUrl\.toString\(\)/);
});

test("billing status is scoped to the authenticated user and never exposes the stored raw checkout field", () => {
  const status = read("app/api/billing/me/route.ts");
  assert.match(status, /auth\.api\.getSession/);
  assert.match(status, /eq\(membershipSubscriptions\.userId, session\.user\.id\)/);
  assert.match(status, /const \{ stripeCheckoutUrl, \.\.\.safeRecord \} = record/);
  assert.match(status, /candidate\.hostname === "checkout\.stripe\.com"/);
  assert.match(status, /return \{ \.\.\.safeRecord, checkoutUrl \}/);
});

test("company membership is explicitly per organization and current seat limitations are documented", () => {
  const terms = read("app/membresias/condiciones/page.tsx");
  const plans = read("app/membresias/page.tsx");
  const runbook = read("docs/production/membership-billing-runbook.md");
  assert.match(plans, /\$699/);
  assert.match(terms, /No se han implementado invitaciones de empleados/);
  assert.match(runbook, /employee invitations/);
  assert.match(runbook, /not implemented/);
});
