import test from "node:test";
import assert from "node:assert/strict";
import {
  decideRateLimit,
  hashRateLimitKey,
  requestIdentityFromHeaders,
  windowBounds,
} from "../lib/rate-limit/distributed.ts";
import { createPublicRateLimitEnforcer } from "../lib/rate-limit/server.ts";

test("request identity ignores client-controlled X-Forwarded-For", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.9",
    "x-real-ip": "198.51.100.7",
  });
  assert.equal(requestIdentityFromHeaders(headers), "ip:198.51.100.7");
});

test("missing canonical IP collapses into the shared anonymous bucket", () => {
  assert.equal(
    requestIdentityFromHeaders(new Headers({ "x-forwarded-for": "203.0.113.9" })),
    "anonymous",
  );
  assert.equal(requestIdentityFromHeaders(undefined), "anonymous");
});

test("HMAC key is deterministic, scoped, and refuses weak/missing salts", () => {
  const salt = "s".repeat(32);
  const a = hashRateLimitKey("public-api", "ip:198.51.100.7", salt);
  assert.match(a, /^[a-f0-9]{64}$/);
  assert.equal(a, hashRateLimitKey("public-api", "ip:198.51.100.7", salt));
  assert.notEqual(a, hashRateLimitKey("other-api", "ip:198.51.100.7", salt));
  assert.notEqual(a, hashRateLimitKey("public-api", "ip:198.51.100.7", "t".repeat(32)));
  assert.throws(() => hashRateLimitKey("public-api", "ip:1.2.3.4"), /at least 32 characters/);
  assert.throws(() => hashRateLimitKey("public-api", "ip:1.2.3.4", "short"), /at least 32 characters/);
});

test("fixed-window bounds are deterministic at exact boundaries", () => {
  assert.deepEqual(windowBounds(10_000, 10_000), { windowStart: 10_000, resetAt: 20_000 });
  assert.deepEqual(windowBounds(19_999, 10_000), { windowStart: 10_000, resetAt: 20_000 });
  assert.deepEqual(windowBounds(20_000, 10_000), { windowStart: 20_000, resetAt: 30_000 });
});

test("rate-limit decisions allow up to the limit and deny the next hit", async () => {
  const consumed = [];
  const store = {
    async consume(input) {
      consumed.push(input);
      return { hits: consumed.length, resetAt: 30_000 };
    },
  };
  const policy = { limit: 2, windowMs: 10_000, now: 20_000 };
  const first = await decideRateLimit(store, "key", policy);
  const second = await decideRateLimit(store, "key", policy);
  const third = await decideRateLimit(store, "key", policy);

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
  assert.equal(third.retryAfterSeconds, 10);
  assert.equal(consumed[0].windowMs, 10_000);
});

test("invalid policies and malformed store results fail closed by throwing", async () => {
  const store = { async consume() { return { hits: 0, resetAt: 10_000 }; } };
  await assert.rejects(() => decideRateLimit(store, "key", { limit: 0, windowMs: 10_000 }), /positive integer/);
  await assert.rejects(() => decideRateLimit(store, "key", { limit: 1, windowMs: 999 }), /at least 1000ms/);
  await assert.rejects(() => decideRateLimit(store, "key", { limit: 1, windowMs: 10_000, now: 1_000 }), /invalid counter/);
});


test("public enforcer fails closed with 503 for missing salt and unavailable storage", async () => {
  const policy = { scope: "public-api", limit: 2, windowMs: 10_000 };
  const missingSalt = createPublicRateLimitEnforcer({
    store: { async consume() { throw new Error("must not reach store"); } },
    getSalt: () => undefined,
    isEnabled: () => true,
  });
  const configResponse = await missingSalt(new Request("https://example.test/api"), policy);
  assert.equal(configResponse.status, 503);
  assert.equal((await configResponse.json()).error, "rate_limit_configuration_invalid");
  assert.equal(configResponse.headers.get("cache-control"), "no-store");

  const unavailableStore = createPublicRateLimitEnforcer({
    store: { async consume() { throw new Error("database offline"); } },
    getSalt: () => "s".repeat(32),
    isEnabled: () => true,
  });
  const storeResponse = await unavailableStore(new Request("https://example.test/api"), policy);
  assert.equal(storeResponse.status, 503);
  assert.equal((await storeResponse.json()).error, "rate_limit_unavailable");
  assert.equal(storeResponse.headers.get("retry-after"), "30");
});

test("public enforcer returns 429 after the configured limit is exceeded", async () => {
  let hits = 0;
  const enforce = createPublicRateLimitEnforcer({
    store: {
      async consume({ windowMs, now }) {
        hits += 1;
        return { hits, resetAt: Math.floor(now / windowMs) * windowMs + windowMs };
      },
    },
    getSalt: () => "s".repeat(32),
    isEnabled: () => true,
  });
  const request = new Request("https://example.test/api", {
    headers: { "x-real-ip": "198.51.100.7", "x-forwarded-for": "203.0.113.9" },
  });
  const policy = { scope: "public-api", limit: 1, windowMs: 10_000 };
  assert.equal(await enforce(request, policy), null);
  const response = await enforce(request, policy);
  assert.equal(response.status, 429);
  assert.equal((await response.json()).error, "rate_limit_exceeded");
  assert.equal(response.headers.get("x-ratelimit-remaining"), "0");
  assert.ok(Number(response.headers.get("retry-after")) >= 1);
});

test("disabled public enforcer does not access the store", async () => {
  const enforce = createPublicRateLimitEnforcer({
    store: { async consume() { throw new Error("store must not be called"); } },
    getSalt: () => undefined,
    isEnabled: () => false,
  });
  assert.equal(await enforce(new Request("https://example.test/api"), {
    scope: "public-api", limit: 1, windowMs: 10_000,
  }), null);
});
