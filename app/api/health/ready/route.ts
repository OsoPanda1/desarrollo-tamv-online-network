import { pool } from "@/lib/db";
import { probeDatabaseReadiness } from "@/lib/db/readiness";
import { noStoreHeaders, readinessPayload } from "@/lib/health";

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

  try {
    const ready = await probeDatabaseReadiness(pool, {
      timeoutMs: DATABASE_PROBE_TIMEOUT_MS,
      connectionString: process.env.DATABASE_URL,
    });
    if (!ready) {
      return Response.json(readinessPayload(false), {
        status: 503,
        headers: noStoreHeaders,
      });
    }
  } catch {
    return Response.json(readinessPayload(false), {
      status: 503,
      headers: noStoreHeaders,
    });
  }

  return Response.json(readinessPayload(true), {
    status: 200,
    headers: noStoreHeaders,
  });
}
