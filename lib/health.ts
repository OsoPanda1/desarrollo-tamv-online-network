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

// Bound readiness even when the underlying pool is saturated.
export async function probeWithinBudget(
  operation: Promise<unknown>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<boolean> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("timeoutMs must be a positive finite number");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation.then(
        () => true,
        () => false,
      ),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => {
          try {
            onTimeout?.();
          } catch {
            // The probe already reports failure; a cleanup error must not change that result.
          }
          resolve(false);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
