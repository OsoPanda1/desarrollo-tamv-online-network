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
