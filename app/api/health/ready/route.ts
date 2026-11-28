import { pool } from "@/lib/db";
import { probeDatabaseReadiness } from "@/lib/db/readiness";
import { noStoreHeaders, readinessPayload } from "@/lib/health";
import { isPublicRateLimitConfigurationReady, isSharedRateLimitEnabled } from "@/lib/rate-limit/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATABASE_PROBE_TIMEOUT_MS = 1_500;

// Configuration fails before PostgreSQL; public responses never expose driver details.
export async function GET() {
  const rateLimitEnabled = isSharedRateLimitEnabled();
  const rateLimit = rateLimitEnabled
    ? (isPublicRateLimitConfigurationReady(process.env.TAMV_RATE_LIMIT_SALT, true) ? "ok" : "invalid")
    : "disabled";
  const databaseUrl = process.env.DATABASE_URL;

  if (rateLimit === "invalid" || !databaseUrl) {
    return Response.json(readinessPayload({
      database: databaseUrl ? "not_checked" : "not_configured",
      rateLimit,
    }), {
      status: 503,
      headers: noStoreHeaders,
    });
  }

  let databaseReady = false;
  try {
    databaseReady = await probeDatabaseReadiness(pool, {
      timeoutMs: DATABASE_PROBE_TIMEOUT_MS,
      connectionString: databaseUrl,
    });
  } catch {
    databaseReady = false;
  }

  return Response.json(readinessPayload({
    database: databaseReady ? "ok" : "unavailable",
    rateLimit,
  }), {
    status: databaseReady ? 200 : 503,
    headers: noStoreHeaders,
  });
}
