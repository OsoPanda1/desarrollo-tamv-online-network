import {
  decideRateLimit,
  hashRateLimitKey,
  isValidRateLimitSalt,
  requestIdentityFromHeaders,
  windowBounds,
  type RateLimitDecision,
  type RateLimitStore,
} from "./distributed.ts";

export interface PublicRateLimitPolicy {
  scope: string;
  limit: number;
  windowMs: number;
}

type PgPool = { connect: () => Promise<{
  query: (text: string, values?: unknown[]) => Promise<{ rows: Array<{ hits?: string | number }> }>;
  release: () => void;
}> };

class PostgresRateLimitStore implements RateLimitStore {
  private lastCleanupAt = 0;
  private poolPromise?: Promise<PgPool>;

  private async getPool(): Promise<PgPool> {
    this.poolPromise ??= import("../db/index.ts").then((module) => module.pool as unknown as PgPool);
    return this.poolPromise;
  }

  async consume({ key, windowMs, now }: { key: string; windowMs: number; now: number }) {
    const { windowStart, resetAt } = windowBounds(now, windowMs);
    const pool = await this.getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (now - this.lastCleanupAt > windowMs * 10) {
        this.lastCleanupAt = now;
        await client.query(
          "DELETE FROM public.tamv_rate_limit_counters WHERE window_start_ms < $1",
          [windowStart - windowMs],
        );
      }
      const result = await client.query(
        `INSERT INTO public.tamv_rate_limit_counters (bucket, window_start_ms, hits)
         VALUES ($1, $2, 1)
         ON CONFLICT (bucket, window_start_ms)
         DO UPDATE SET hits = public.tamv_rate_limit_counters.hits + 1, updated_at = now()
         RETURNING hits`,
        [key, windowStart],
      );
      await client.query("COMMIT");
      return { hits: Number(result.rows[0]?.hits), resetAt };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original store failure if rollback also fails.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

const sharedStore: RateLimitStore = new PostgresRateLimitStore();

export function isSharedRateLimitEnabled(): boolean {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") return true;
  if (process.env.TAMV_RATE_LIMIT_ENABLED === "false") return false;
  return process.env.TAMV_RATE_LIMIT_ENABLED === "true";
}

export function isPublicRateLimitConfigurationReady(salt?: string, enabled?: boolean): boolean {
  return !enabled || isValidRateLimitSalt(salt);
}

function sharedHeaders(decision: RateLimitDecision, limit: number) {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Retry-After": String(decision.retryAfterSeconds),
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(Math.ceil(decision.resetAt / 1000)),
  };
}

// Injectable runtime dependencies keep configuration failures testable without PostgreSQL.
export interface PublicRateLimitRuntime {
  store: RateLimitStore;
  getSalt: () => string | undefined;
  isEnabled: () => boolean;
}

// Fail closed and distinguish invalid configuration from an unavailable counter store.
export function createPublicRateLimitEnforcer(runtime: PublicRateLimitRuntime) {
  return async function enforceWithRuntime(
    request: Request | undefined,
    policy: PublicRateLimitPolicy,
  ): Promise<Response | null> {
    if (!runtime.isEnabled()) return null;

    const salt = runtime.getSalt();
    if (!isPublicRateLimitConfigurationReady(salt, true)) {
      return Response.json(
        {
          error: "rate_limit_configuration_invalid",
          retryAfterSeconds: 30,
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "Retry-After": "30",
          },
        },
      );
    }

    let decision: RateLimitDecision;
    try {
      const key = hashRateLimitKey(
        policy.scope,
        requestIdentityFromHeaders(request?.headers),
        salt,
      );
      decision = await decideRateLimit(runtime.store, key, {
        limit: policy.limit,
        windowMs: policy.windowMs,
      });
    } catch (error) {
      const invalidConfiguration =
        error instanceof Error &&
        error.message === "TAMV_RATE_LIMIT_SALT must contain at least 32 characters";
      return Response.json(
        {
          error: invalidConfiguration ? "rate_limit_configuration_invalid" : "rate_limit_unavailable",
          retryAfterSeconds: 30,
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "Retry-After": "30",
          },
        },
      );
    }

    if (decision.allowed) return null;
    return Response.json(
      {
        error: "rate_limit_exceeded",
        scope: policy.scope,
        retryAfterSeconds: decision.retryAfterSeconds,
      },
      { status: 429, headers: sharedHeaders(decision, policy.limit) },
    );
  };
}

export const enforcePublicRateLimit = createPublicRateLimitEnforcer({
  store: sharedStore,
  getSalt: () => process.env.TAMV_RATE_LIMIT_SALT,
  isEnabled: isSharedRateLimitEnabled,
});
