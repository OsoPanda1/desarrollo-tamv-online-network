import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { decideRateLimit, hashRateLimitKey, isValidRateLimitSalt, MAX_RATE_LIMIT_WINDOW_MS, rateLimitCleanupCutoff, requestIdentityFromHeaders, windowBounds } from "../lib/rate-limit/distributed.ts";
import { createPublicRateLimitEnforcer, isPublicRateLimitConfigurationReady, isSharedRateLimitEnabled } from "../lib/rate-limit/server.ts";

class FakeSharedStore {
  constructor() {
    this.hits = new Map();
  }

  async consume({ key, windowMs, now }) {
    const { windowStart, resetAt } = windowBounds(now, windowMs);
    const bucket = `${key}:${windowStart}`;
    const hits = (this.hits.get(bucket) ?? 0) + 1;
    this.hits.set(bucket, hits);
    return { hits, resetAt };
  }
}

test("shared rate limiter allows the configured number of requests and then returns 429 semantics", async () => {
  const store = new FakeSharedStore();
  const policy = { limit: 3, windowMs: 60_000, now: 0 };

  const decisions = [];
  for (let index = 0; index < 4; index += 1) {
    decisions.push(await decideRateLimit(store, "federated:hash", policy));
  }

  assert.deepEqual(decisions.map((decision) => decision.allowed), [true, true, true, false]);
  assert.deepEqual(decisions.map((decision) => decision.remaining), [2, 1, 0, 0]);
  assert.equal(decisions.at(-1).retryAfterSeconds, 60);
  assert.equal(decisions.at(-1).resetAt, 60_000);
});

test("shared rate limiter opens a fresh counter in the next fixed window", async () => {
  const store = new FakeSharedStore();
  const first = await decideRateLimit(store, "key", { limit: 1, windowMs: 60_000, now: 0 });
  const blocked = await decideRateLimit(store, "key", { limit: 1, windowMs: 60_000, now: 1 });
  const next = await decideRateLimit(store, "key", { limit: 1, windowMs: 60_000, now: 60_000 });

  assert.equal(first.allowed, true);
  assert.equal(blocked.allowed, false);
  assert.equal(next.allowed, true);
  assert.equal(next.resetAt, 120_000);
});

test("rate-limit cleanup cannot remove any counter from a permitted active window", async () => {
  const now = 5 * MAX_RATE_LIMIT_WINDOW_MS;
  const cutoff = rateLimitCleanupCutoff(now);
  const activeWindowStart = windowBounds(now, MAX_RATE_LIMIT_WINDOW_MS).windowStart;

  assert.equal(cutoff, now - MAX_RATE_LIMIT_WINDOW_MS);
  assert.ok(activeWindowStart >= cutoff);
  await assert.rejects(
    decideRateLimit(new FakeSharedStore(), "key", { limit: 1, windowMs: MAX_RATE_LIMIT_WINDOW_MS + 1, now }),
    /between 1000ms and/,
  );

  const server = readFileSync(resolve(process.cwd(), "lib/rate-limit/server.ts"), "utf8");
  assert.match(server, /RATE_LIMIT_CLEANUP_INTERVAL_MS = 10 \* 60 \* 1000/);
  assert.match(server, /rateLimitCleanupCutoff\(now\)/);
  assert.doesNotMatch(server, /windowStart - windowMs/);
});

test("shared rate limiter keeps separate buckets for different hashed keys", async () => {
  const store = new FakeSharedStore();
  const policy = { limit: 1, windowMs: 60_000, now: 0 };

  assert.equal((await decideRateLimit(store, "scope-a", policy)).allowed, true);
  assert.equal((await decideRateLimit(store, "scope-b", policy)).allowed, true);
  assert.equal((await decideRateLimit(store, "scope-a", policy)).allowed, false);
});

test("shared rate limiter fails closed when its store throws", async () => {
  const store = { consume: async () => { throw new Error("shared store unavailable"); } };
  await assert.rejects(decideRateLimit(store, "key", { limit: 5, windowMs: 60_000 }), /shared store unavailable/);
});

test("rate-limit identity trusts the canonical ingress address and ignores X-Forwarded-For", () => {
  const forwardedOnly = new Headers({ "x-forwarded-for": "203.0.113.42, 198.51.100.7" });
  assert.equal(requestIdentityFromHeaders(forwardedOnly), "anonymous");

  const canonical = new Headers({
    "x-real-ip": "198.51.100.8",
    "x-forwarded-for": "203.0.113.42",
  });
  assert.equal(requestIdentityFromHeaders(canonical), "ip:198.51.100.8");
});

test("rate-limit identity keys use a secret salt and never persist raw IP addresses", () => {
  const salt = "test-rate-limit-salt-with-32-randomish-characters-01";
  const otherSalt = "other-rate-limit-salt-with-32-randomish-characters";
  const key = hashRateLimitKey("federated", "ip:203.0.113.42", salt);

  assert.match(key, /^[a-f0-9]{64}$/);
  assert.equal(key.includes("203.0.113.42"), false);
  assert.notEqual(key, hashRateLimitKey("federated", "ip:203.0.113.42", otherSalt));
  assert.notEqual(key, hashRateLimitKey("other", "ip:203.0.113.42", salt));
  assert.throws(() => hashRateLimitKey("federated", "ip:203.0.113.42"), /at least 32 characters/);
  assert.throws(() => hashRateLimitKey("federated", "ip:203.0.113.42", "short"), /at least 32 characters/);
});

test("rate-limit salt validation distinguishes missing, whitespace, short, and valid values", () => {
  assert.equal(isValidRateLimitSalt(undefined), false);
  assert.equal(isValidRateLimitSalt(""), false);
  assert.equal(isValidRateLimitSalt(" \t\n "), false);
  assert.equal(isValidRateLimitSalt("s".repeat(31)), false);
  assert.equal(isValidRateLimitSalt("s".repeat(32)), true);
  assert.equal(isValidRateLimitSalt(`  ${"s".repeat(32)}  `), true);

  assert.throws(() => hashRateLimitKey("scope", "anonymous", "   "), /at least 32 characters/);
  assert.match(hashRateLimitKey("scope", "anonymous", `  ${"s".repeat(32)}  `), /^[a-f0-9]{64}$/);
});

test("public rate-limit configuration is required only when enabled", () => {
  assert.equal(isPublicRateLimitConfigurationReady(undefined, true), false);
  assert.equal(isPublicRateLimitConfigurationReady("   ", true), false);
  assert.equal(isPublicRateLimitConfigurationReady("s".repeat(31), true), false);
  assert.equal(isPublicRateLimitConfigurationReady("s".repeat(32), true), true);
  assert.equal(isPublicRateLimitConfigurationReady(undefined, false), true);
  assert.equal(isPublicRateLimitConfigurationReady("short", false), true);
});

test("production cannot disable shared public rate limiting", () => {
  const keys = ["NODE_ENV", "VERCEL_ENV", "TAMV_RATE_LIMIT_ENABLED"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = "development";
    process.env.VERCEL_ENV = "preview";
    process.env.TAMV_RATE_LIMIT_ENABLED = "false";
    assert.equal(isSharedRateLimitEnabled(), false);

    process.env.TAMV_RATE_LIMIT_ENABLED = "true";
    assert.equal(isSharedRateLimitEnabled(), true);

    process.env.NODE_ENV = "production";
    process.env.TAMV_RATE_LIMIT_ENABLED = "false";
    assert.equal(isSharedRateLimitEnabled(), true);

    process.env.NODE_ENV = "development";
    process.env.VERCEL_ENV = "production";
    assert.equal(isSharedRateLimitEnabled(), true);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test("readiness checks enabled rate-limit configuration before probing PostgreSQL", () => {
  const route = readFileSync(resolve(process.cwd(), "app/api/health/ready/route.ts"), "utf8");
  const configurationCheck = route.lastIndexOf("isPublicRateLimitConfigurationReady(");
  const databaseProbe = route.indexOf("await probeDatabaseReadiness(");

  assert.ok(configurationCheck >= 0);
  assert.ok(databaseProbe > configurationCheck);
  assert.match(route, /isPublicRateLimitConfigurationReady\(process\.env\.TAMV_RATE_LIMIT_SALT, true\)/);
  assert.match(route, /database: databaseUrl \? "not_checked" : "not_configured"/);
  assert.match(route, /rateLimit === "invalid" \|\| !databaseUrl/);
  assert.match(route, /readinessPayload\(\{/);
  assert.match(route, /headers: noStoreHeaders/);
  assert.doesNotMatch(route, /enforcePublicRateLimit|\.consume\(/);
});

test("missing or weak rate-limit salt is rejected before the shared store is reached", async () => {
  let storeCalls = 0;
  const fakeStore = {
    consume: async () => {
      storeCalls += 1;
      throw new Error("store must not be reached for invalid configuration");
    },
  };
  const policy = { scope: "test", limit: 5, windowMs: 60_000 };
  const request = new Request("https://tamv.example/api/test");

  for (const salt of [undefined, "too-short"]) {
    const enforce = createPublicRateLimitEnforcer({
      store: fakeStore,
      getSalt: () => salt,
      isEnabled: () => true,
    });
    const response = await enforce(request, policy);

    assert.equal(response?.status, 503);
    assert.deepEqual(await response?.json(), {
      error: "rate_limit_configuration_invalid",
      retryAfterSeconds: 30,
    });
    assert.equal(storeCalls, 0, "configuration validation must happen before DB/store access");
  }
});

test("a valid rate-limit salt with an unavailable store reports a different failure", async () => {
  let storeCalls = 0;
  const enforce = createPublicRateLimitEnforcer({
    store: {
      consume: async () => {
        storeCalls += 1;
        throw new Error("store unavailable for test");
      },
    },
    getSalt: () => "test-rate-limit-salt-with-32-randomish-characters-01",
    isEnabled: () => true,
  });

  const response = await enforce(new Request("https://tamv.example/api/test"), {
    scope: "test",
    limit: 5,
    windowMs: 60_000,
  });

  assert.equal(response?.status, 503);
  assert.deepEqual(await response?.json(), {
    error: "rate_limit_unavailable",
    retryAfterSeconds: 30,
  });
  assert.equal(storeCalls, 1);
});

test("public rate-limit migration stores atomic shared counters without raw identities", () => {
  const migration = readFileSync(resolve(process.cwd(), "migrations/0004_public_rate_limits.sql"), "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.tamv_rate_limit_counters/);
  assert.match(migration, /PRIMARY KEY \(bucket, window_start_ms\)/);
  assert.match(migration, /CHECK \(hits > 0\)/);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS tamv_rate_limit_counters_window_idx/);
});
