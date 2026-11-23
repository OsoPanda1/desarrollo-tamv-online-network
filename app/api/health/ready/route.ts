import { pool } from "@/lib/db";
import { noStoreHeaders, probeWithinBudget, readinessPayload } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATABASE_PROBE_TIMEOUT_MS = 1_500;

/**
 * Readiness checks the one critical dependency required by database-backed
 * routes. Both the HTTP response and PostgreSQL query are bounded. The response
 * never includes exception text, host, database name, connection string, or
 * driver diagnostics to anonymous callers.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json(readinessPayload(false), {
      status: 503,
      headers: noStoreHeaders,
    });
  }

  const probeQuery = {
    text: "SELECT 1",
    query_timeout: DATABASE_PROBE_TIMEOUT_MS,
  };
  const ready = await probeWithinBudget(pool.query(probeQuery), DATABASE_PROBE_TIMEOUT_MS);

  return Response.json(readinessPayload(ready), {
    status: ready ? 200 : 503,
    headers: noStoreHeaders,
  });
}
