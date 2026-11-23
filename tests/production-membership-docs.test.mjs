import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("production runbook keeps live billing and legal approval gated", () => {
  const runbook = read("docs/production/membership-billing-runbook.md");
  const checkout = read("app/api/billing/checkout/route.ts");
  const terms = read("app/membresias/condiciones/page.tsx");
  const privacy = read("app/privacidad/page.tsx");
  assert.match(runbook, /TAMV_BILLING_MODE/);
  assert.match(runbook, /STRIPE_WEBHOOK_SECRET/);
  assert.match(checkout, /TAMV_BILLING_MODE/);
  assert.match(checkout, /TAMV_MEMBERSHIP_TERMS_VERSION/);
  assert.match(checkout, /TAMV_MEMBERSHIP_PRIVACY_APPROVED/);
  assert.match(checkout, /TAMV_MEMBERSHIP_LEGAL_APPROVED/);
  assert.match(checkout, /TAMV_MEMBERSHIP_TAX_APPROVED/);
  assert.match(checkout, /TAMV_MEMBERSHIP_REFUNDS_APPROVED/);
  assert.match(terms, /inversion|inversionistas/i);
  assert.match(privacy, /responsable|derechos/i);
});
