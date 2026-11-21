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
