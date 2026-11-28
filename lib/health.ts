export type HealthStatus = "ok" | "ready" | "not_ready";

export function livenessPayload(timestamp = new Date().toISOString()) {
  return {
    status: "ok" as const,
    service: "tamv-online-network",
    timestamp,
  };
}

export type ReadinessChecks = {
  database: "ok" | "unavailable" | "not_configured" | "not_checked";
  rateLimit: "ok" | "invalid" | "disabled";
};

export function readinessPayload(checks: ReadinessChecks, timestamp = new Date().toISOString()) {
  const ready = checks.database === "ok" && checks.rateLimit !== "invalid";
  return {
    status: ready ? ("ready" as const) : ("not_ready" as const),
    service: "tamv-online-network",
    checks,
    timestamp,
  };
}

export const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

// Share in-flight and resolved values, including falsy values, until the TTL expires.
export function createSingleFlightTtlCache<T>(
  load: () => Promise<T>,
  ttlMs: number,
  now: () => number = Date.now,
): () => Promise<T> {
  let cached: { value: T; expiresAt: number } | undefined;
  let inFlight: Promise<T> | undefined;

  return () => {
    const currentTime = now();
    if (cached && currentTime < cached.expiresAt) return Promise.resolve(cached.value);
    if (inFlight) return inFlight;

    const pending = (async () => load())()
      .then((value) => {
        cached = { value, expiresAt: now() + ttlMs };
        return value;
      })
      .finally(() => {
        if (inFlight === pending) inFlight = undefined;
      });

    inFlight = pending;
    return pending;
  };
}

export class BudgetExceededError extends Error {
  constructor() {
    super("operation exceeded its time budget")
    this.name = "BudgetExceededError"
  }
}

// Bound dependency work even when the underlying pool is saturated.
export async function withinBudget<T>(
  operation: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("timeoutMs must be a positive finite number")
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          try {
            onTimeout?.()
          } catch {
            // Cleanup must not replace the timeout result.
          }
          reject(new BudgetExceededError())
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function probeWithinBudget(
  operation: Promise<unknown>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<boolean> {
  try {
    await withinBudget(operation, timeoutMs, onTimeout)
    return true
  } catch (error) {
    if (error instanceof RangeError) throw error
    return false
  }
}
