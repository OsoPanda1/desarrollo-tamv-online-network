const DEFAULT_POOL_MAX = 3;
const MAX_POOL_MAX = 20;

/**
 * Resolve a conservative per-process PostgreSQL pool size.
 *
 * Serverless deployments may create many application instances, so the pool
 * size must be explicit and bounded instead of multiplying an unbounded
 * per-instance default across concurrent instances.
 */
export function getPoolMax(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return DEFAULT_POOL_MAX;

  if (!/^\d+$/.test(value.trim())) {
    throw new Error("PG_POOL_MAX must be an integer between 1 and 20.");
  }

  const parsed = Number(value.trim());
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_POOL_MAX) {
    throw new Error("PG_POOL_MAX must be an integer between 1 and 20.");
  }

  return parsed;
}
