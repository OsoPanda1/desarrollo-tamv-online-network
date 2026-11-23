import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MEMBERSHIP_PLANS, COURSE_MODULE_IDS } from "../lib/billing/plans.ts";
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
  const secret = "whsec_test_contract_secret";
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
