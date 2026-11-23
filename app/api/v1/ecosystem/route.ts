import { getPublicEcosystemCatalog } from "@/lib/ecosystem/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public discovery endpoint. This intentionally returns a catalog, not a synthetic
 * health status. Integration states only advance after evidence-backed verification.
 */
export async function GET() {
  return Response.json(getPublicEcosystemCatalog(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
