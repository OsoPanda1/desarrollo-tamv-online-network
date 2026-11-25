import {
  decideRateLimit,
  hashRateLimitKey,
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
        // The original store failure is the useful signal; a failed rollback must not hide it.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

const sharedStore: RateLimitStore = new PostgresRateLimitStore();

export function isSharedRateLimitEnabled(): boolean {
  if (process.env.TAMV_RATE_LIMIT_ENABLED === "false") return false;
  return process.env.TAMV_RATE_LIMIT_ENABLED === "true" || process.env.VERCEL_ENV === "production";
}

function requestIdentity(request?: Request): string {
  if (!request) return "anonymous";
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return `ip:${forwarded}`;
  return "anonymous";
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

/**
 * Returns a ready-to-send response when the request must be blocked, or null when
 * it may continue. The shared counter is fail-closed: if the store is unavailable,
 * the public endpoint does not silently become unlimited.
 */
export async function enforcePublicRateLimit(
  request: Request | undefined,
  policy: PublicRateLimitPolicy,
): Promise<Response | null> {
  if (!isSharedRateLimitEnabled()) return null;

  const key = hashRateLimitKey(
    policy.scope,
    requestIdentity(request),
    process.env.TAMV_RATE_LIMIT_SALT,
  );

  let decision: RateLimitDecision;
  try {
    decision = await decideRateLimit(sharedStore, key, {
      limit: policy.limit,
      windowMs: policy.windowMs,
    });
  } catch {
    return Response.json(
      { error: "rate_limit_unavailable", retryAfterSeconds: 30 },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Retry-After": "30" } },
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
}
