import test from "node:test";
import assert from "node:assert/strict";
import { createSingleFlightTtlCache, livenessPayload, noStoreHeaders, readinessPayload } from "../lib/health.ts";

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

test("readiness payload reports bounded configuration and dependency states", () => {
  assert.deepEqual(readinessPayload({ database: "ok", rateLimit: "ok" }, "2026-11-21T12:00:00.000Z"), {
    status: "ready",
    service: "tamv-online-network",
    checks: { database: "ok", rateLimit: "ok" },
    timestamp: "2026-11-21T12:00:00.000Z",
  });

  for (const checks of [
    { database: "unavailable", rateLimit: "ok" },
    { database: "not_checked", rateLimit: "invalid" },
    { database: "not_configured", rateLimit: "disabled" },
  ]) {
    const unavailable = readinessPayload(checks, "2026-11-21T12:00:00.000Z");
    assert.equal(unavailable.status, "not_ready");
    assert.deepEqual(unavailable.checks, checks);
    assert.equal(JSON.stringify(unavailable).includes("password"), false);
    assert.equal(JSON.stringify(unavailable).includes("connectionString"), false);
  }
});

test("health responses explicitly disable caching and MIME sniffing", () => {
  assert.equal(noStoreHeaders["Cache-Control"], "no-store, max-age=0");
  assert.equal(noStoreHeaders["X-Content-Type-Options"], "nosniff");
});


test("single-flight TTL cache shares an in-flight load even after its TTL elapses", async () => {
  let now = 0;
  let loads = 0;
  let resolveLoad;
  const load = () => {
    loads += 1;
    return new Promise((resolve) => { resolveLoad = resolve; });
  };
  const getSnapshot = createSingleFlightTtlCache(load, 30_000, () => now);

  const first = getSnapshot();
  now = 90_000;
  const concurrent = getSnapshot();
  assert.equal(first, concurrent);
  assert.equal(loads, 1);

  resolveLoad({ ok: false });
  assert.deepEqual(await first, { ok: false });
  assert.equal(loads, 1);
});

test("single-flight TTL cache retains false and null values for exactly 30 seconds", async () => {
  for (const value of [{ ok: false }, null]) {
    let now = 1_000;
    let loads = 0;
    const getSnapshot = createSingleFlightTtlCache(async () => {
      loads += 1;
      return value;
    }, 30_000, () => now);

    assert.equal(await getSnapshot(), value);
    now = 30_999;
    assert.equal(await getSnapshot(), value);
    assert.equal(loads, 1);
    now = 31_000;
    assert.equal(await getSnapshot(), value);
    assert.equal(loads, 2);
  }
});

test("single-flight TTL cache clears rejected loads so a later caller can retry", async () => {
  let loads = 0;
  const getSnapshot = createSingleFlightTtlCache(async () => {
    loads += 1;
    if (loads === 1) throw new Error("temporary failure");
    return "recovered";
  }, 30_000);

  await assert.rejects(getSnapshot(), /temporary failure/);
  assert.equal(await getSnapshot(), "recovered");
  assert.equal(await getSnapshot(), "recovered");
  assert.equal(loads, 2);
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
