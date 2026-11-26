import test from "node:test";
import assert from "node:assert/strict";
import { livenessPayload, noStoreHeaders, readinessPayload } from "../lib/health.ts";

test("liveness payload is independent of database state and contains no infrastructure details", () => {
  const payload = livenessPayload("2026-11-21T12:00:00.000Z");

  assert.deepEqual(payload, {
    status: "ok",
    service: "tamv-online-network",
    timestamp: "2026-11-21T12:00:00.000Z",
  });
  assert.equal("database" in payload, false);
  assert.equal(JSON.stringify(payload).includes("DATABASE_URL"), false);
});

test("readiness payload reports only a bounded public dependency state", () => {
  assert.deepEqual(readinessPayload(true, "2026-11-21T12:00:00.000Z"), {
    status: "ready",
    service: "tamv-online-network",
    checks: { database: "ok" },
    timestamp: "2026-11-21T12:00:00.000Z",
  });

  const unavailable = readinessPayload(false, "2026-11-21T12:00:00.000Z");
  assert.equal(unavailable.status, "not_ready");
  assert.equal(unavailable.checks.database, "unavailable");
  assert.equal(JSON.stringify(unavailable).includes("password"), false);
  assert.equal(JSON.stringify(unavailable).includes("connectionString"), false);
});

test("health responses explicitly disable caching and MIME sniffing", () => {
  assert.equal(noStoreHeaders["Cache-Control"], "no-store, max-age=0");
  assert.equal(noStoreHeaders["X-Content-Type-Options"], "nosniff");
});


test("readiness probe reports success when the dependency resolves within budget", async () => {
  const { probeWithinBudget } = await import("../lib/health.ts");
  assert.equal(await probeWithinBudget(Promise.resolve({ rows: [{ "?column?": 1 }] }), 50), true);
});

test("readiness probe fails closed when the dependency rejects", async () => {
  const { probeWithinBudget } = await import("../lib/health.ts");
  assert.equal(await probeWithinBudget(Promise.reject(new Error("private database detail")), 50), false);
});

test("readiness probe returns unavailable when the operation exceeds its budget", async () => {
  const { probeWithinBudget } = await import("../lib/health.ts");
  const operation = new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(await probeWithinBudget(operation, 5), false);
});

test("readiness probe invokes the cancellation hook exactly when the budget expires", async () => {
  const { probeWithinBudget } = await import("../lib/health.ts");
  let cancellations = 0;
  const slow = new Promise((resolve) => setTimeout(resolve, 100));

  assert.equal(await probeWithinBudget(slow, 5, () => { cancellations += 1; }), false);
  assert.equal(cancellations, 1);

  cancellations = 0;
  assert.equal(await probeWithinBudget(Promise.resolve(), 50, () => { cancellations += 1; }), true);
  assert.equal(cancellations, 0);
});

test("readiness probe rejects invalid timeout budgets", async () => {
  const { probeWithinBudget } = await import("../lib/health.ts");
  await assert.rejects(() => probeWithinBudget(Promise.resolve(), 0), RangeError);
});
