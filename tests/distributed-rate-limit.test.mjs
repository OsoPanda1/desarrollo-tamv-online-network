import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { decideRateLimit, hashRateLimitKey, windowBounds } from "../lib/rate-limit/distributed.ts";

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

test("shared rate limiter fails closed when salt configuration is absent or weak", async () => {
  const { enforcePublicRateLimit } = await import("../lib/rate-limit/server.ts");
  const priorEnabled = process.env.TAMV_RATE_LIMIT_ENABLED;
  const priorSalt = process.env.TAMV_RATE_LIMIT_SALT;

  process.env.TAMV_RATE_LIMIT_ENABLED = "true";
  delete process.env.TAMV_RATE_LIMIT_SALT;

  try {
    const missingSalt = await enforcePublicRateLimit(new Request("https://tamv.example/api/test"), {
      scope: "test",
      limit: 5,
      windowMs: 60_000,
    });
    assert.equal(missingSalt?.status, 503);

    process.env.TAMV_RATE_LIMIT_SALT = "too-short";
    const weakSalt = await enforcePublicRateLimit(new Request("https://tamv.example/api/test"), {
      scope: "test",
      limit: 5,
      windowMs: 60_000,
    });
    assert.equal(weakSalt?.status, 503);
  } finally {
    if (priorEnabled === undefined) delete process.env.TAMV_RATE_LIMIT_ENABLED;
    else process.env.TAMV_RATE_LIMIT_ENABLED = priorEnabled;
    if (priorSalt === undefined) delete process.env.TAMV_RATE_LIMIT_SALT;
    else process.env.TAMV_RATE_LIMIT_SALT = priorSalt;
  }
});

test("public rate-limit migration stores atomic shared counters without raw identities", () => {
  const migration = readFileSync(resolve(process.cwd(), "migrations/0004_public_rate_limits.sql"), "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.tamv_rate_limit_counters/);
  assert.match(migration, /PRIMARY KEY \(bucket, window_start_ms\)/);
  assert.match(migration, /CHECK \(hits > 0\)/);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS tamv_rate_limit_counters_window_idx/);
});
