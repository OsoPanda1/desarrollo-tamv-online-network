import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/membresias/page.tsx", import.meta.url), "utf8");
const checkout = await readFile(new URL("../components/membership-checkout.tsx", import.meta.url), "utf8");

test("live membership checkout remains gated by production and explicit approvals", () => {
  for (const marker of [
    'billingMode === "live"',
    'process.env.VERCEL_ENV === "production"',
    '/^sk_live_[A-Za-z0-9]+$/',
    'Boolean(webhookSecret)',
    "secureReturnOrigin",
    "approvalFlags.every(Boolean)",
    "taxConfigurationValid",
  ]) assert.ok(page.includes(marker), "missing launch-gate marker: " + marker);
  assert.match(page, /enabled=\{liveCheckoutReady\}/);
  assert.match(page, /Los botones de contratación permanecen cerrados/);
  assert.match(checkout, /disabled=\{!enabled \|\| busy/);
  assert.match(checkout, /Cobro live no habilitado/);
});

test("business membership does not promise unimplemented team seats", () => {
  assert.match(page, /asientos para empleados, invitaciones, roles corporativos/);
  assert.match(page, /employee seats, invitations, corporate roles, shared workspaces/);
});
