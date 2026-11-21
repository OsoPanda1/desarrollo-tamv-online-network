export type HealthStatus = "ok" | "ready" | "not_ready";

export function livenessPayload(timestamp = new Date().toISOString()) {
  return {
    status: "ok" as const,
    service: "tamv-online-network",
    timestamp,
  };
}

export function readinessPayload(databaseReady: boolean, timestamp = new Date().toISOString()) {
  return {
    status: databaseReady ? ("ready" as const) : ("not_ready" as const),
    service: "tamv-online-network",
    checks: {
      database: databaseReady ? ("ok" as const) : ("unavailable" as const),
    },
    timestamp,
  };
}

export const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};


/**
 * Bound the public readiness response even when a pool is saturated or a
 * dependency is slow. The underlying query also has its own driver timeout.
 */
export async function probeWithinBudget(
  operation: Promise<unknown>,
  timeoutMs: number,
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
        timer = setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
