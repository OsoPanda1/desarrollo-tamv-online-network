import { createHmac } from "node:crypto";

/**
 * Storage contract for a counter that is shared by every serverless instance.
 * The store owns the atomic increment and returns the exact window it counted.
 * A process-local Map is deliberately not accepted here.
 */
export interface RateLimitStore {
  consume(input: { key: string; windowMs: number; now: number }): Promise<{ hits: number; resetAt: number }>;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  hits: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
  now?: number;
}

/**
 * Read only the canonical client address supplied by a trusted ingress.
 * Do not trust the first X-Forwarded-For value: callers can prepend entries
 * unless the proxy is explicitly configured to strip/overwrite that header.
 * When no canonical address is present, use one shared anonymous bucket rather
 * than allowing a client-controlled header to select a fresh bucket per call.
 */
export function requestIdentityFromHeaders(headers?: Headers): string {
  const realIp = headers?.get("x-real-ip")?.trim();
  return realIp ? `ip:${realIp}` : "anonymous";
}

export function hashRateLimitKey(scope: string, identity: string, salt?: string): string {
  const secretSalt = salt?.trim();
  if (!secretSalt || secretSalt.length < 32) {
    throw new Error("TAMV_RATE_LIMIT_SALT must contain at least 32 characters");
  }

  return createHmac("sha256", secretSalt)
    .update(`${scope}\u0000${identity}`)
    .digest("hex");
}

export async function decideRateLimit(
  store: RateLimitStore,
  key: string,
  policy: RateLimitPolicy,
): Promise<RateLimitDecision> {
  if (!Number.isInteger(policy.limit) || policy.limit < 1) throw new Error("rate limit must be a positive integer");
  if (!Number.isInteger(policy.windowMs) || policy.windowMs < 1000) throw new Error("rate limit window must be at least 1000ms");

  const now = policy.now ?? Date.now();
  const result = await store.consume({ key, windowMs: policy.windowMs, now });
  if (!Number.isSafeInteger(result.hits) || result.hits < 1 || !Number.isFinite(result.resetAt)) {
    throw new Error("rate limit store returned an invalid counter");
  }

  const allowed = result.hits <= policy.limit;
  return {
    allowed,
    limit: policy.limit,
    hits: result.hits,
    remaining: Math.max(0, policy.limit - result.hits),
    resetAt: result.resetAt,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((result.resetAt - now) / 1000)),
  };
}

export function windowBounds(now: number, windowMs: number): { windowStart: number; resetAt: number } {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  return { windowStart, resetAt: windowStart + windowMs };
}
