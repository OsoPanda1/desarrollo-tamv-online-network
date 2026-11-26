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

test("rate limit keys do not persist raw IP addresses", () => {
  const key = hashRateLimitKey("federated", "ip:203.0.113.42", "test-salt");
  assert.match(key, /^[a-f0-9]{64}$/);
  assert.equal(key.includes("203.0.113.42"), false);
  assert.notEqual(key, hashRateLimitKey("federated", "ip:203.0.113.42", "other-salt"));
  assert.notEqual(key, hashRateLimitKey("other", "ip:203.0.113.42", "test-salt"));
});

test("public rate-limit migration stores atomic shared counters without raw identities", () => {
  const migration = readFileSync(resolve(process.cwd(), "migrations/0004_public_rate_limits.sql"), "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.tamv_rate_limit_counters/);
  assert.match(migration, /PRIMARY KEY \(bucket, window_start_ms\)/);
  assert.match(migration, /CHECK \(hits > 0\)/);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS tamv_rate_limit_counters_window_idx/);
});
