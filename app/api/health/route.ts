import { livenessPayload, noStoreHeaders } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Process liveness only. This endpoint deliberately does not touch PostgreSQL,
 * so an unavailable database does not cause the platform to restart a healthy
 * application process in a tight loop.
 */
export function GET() {
  return Response.json(livenessPayload(), {
    status: 200,
    headers: noStoreHeaders,
  });
}
