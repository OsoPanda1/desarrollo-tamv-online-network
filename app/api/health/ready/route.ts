import { pool } from "@/lib/db";
import { noStoreHeaders, readinessPayload } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATABASE_PROBE_TIMEOUT_MS = 1_500;

/**
 * Readiness checks the one critical dependency required by database-backed
 * routes. It intentionally returns no exception text, host, database name,
 * connection string, or driver diagnostics to anonymous callers.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json(readinessPayload(false), {
      status: 503,
      headers: noStoreHeaders,
    });
  }

  try {
    await pool.query({
      text: "SELECT 1",
      query_timeout: DATABASE_PROBE_TIMEOUT_MS,
    });

    return Response.json(readinessPayload(true), {
      status: 200,
      headers: noStoreHeaders,
    });
  } catch {
    return Response.json(readinessPayload(false), {
      status: 503,
      headers: noStoreHeaders,
    });
  }
}
