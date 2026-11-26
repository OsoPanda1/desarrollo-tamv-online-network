import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/membresias/page.tsx", import.meta.url), "utf8");
const formation = await readFile(new URL("../app/formacion/page.tsx", import.meta.url), "utf8");
const readiness = await readFile(new URL("../lib/billing/checkout-readiness.ts", import.meta.url), "utf8");
const checkout = await readFile(new URL("../components/membership-checkout.tsx", import.meta.url), "utf8");

test("live membership checkout remains fail-closed across all entry points", () => {
  for (const marker of [
    'billingMode === "live"',
    'process.env.VERCEL_ENV === "production"',
    'Boolean(secret?.startsWith("sk_live_"))',
    'Boolean(webhookSecret)',
    'Boolean(appBaseUrl?.startsWith("https://"))',
    "approvalsPresent",
    "taxConfigurationValid",
  ]) assert.ok(readiness.includes(marker), "missing launch-gate marker: " + marker);
  assert.match(page, /isLiveMembershipCheckoutReady\(\)/);
  assert.match(formation, /isLiveMembershipCheckoutReady\(\)/);
  assert.match(page, /enabled=\{liveCheckoutReady\}/);
  assert.match(formation, /enabled=\{liveCheckoutReady\}/);
  assert.match(page, /Los botones de contratación permanecen cerrados/);
  assert.match(formation, /El checkout live está cerrado en este despliegue/);
  assert.match(checkout, /enabled = false/);
  assert.match(checkout, /disabled=\{!enabled \|\| busy/);
  assert.match(checkout, /Cobro live no habilitado/);
});

test("business membership does not promise unimplemented team seats", () => {
  assert.match(page, /Employee seats, invitations, corporate roles, shared workspaces/);
  assert.match(page, /asientos para empleados, invitaciones, roles corporativos/);
});
