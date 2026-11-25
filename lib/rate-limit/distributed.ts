import { createHash } from "node:crypto";

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

const DEFAULT_SALT = "tamv-shared-rate-limit-v1";

export function hashRateLimitKey(scope: string, identity: string, salt = DEFAULT_SALT): string {
  return createHash("sha256")
    .update(`${scope}\u0000${salt}\u0000${identity}`)
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
