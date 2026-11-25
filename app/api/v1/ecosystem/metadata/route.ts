import { getPublicEcosystemRepositoryMetadata } from "../../../../../lib/ecosystem/github-metadata.ts";
import { enforcePublicRateLimit } from "../../../../../lib/rate-limit/server.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Read-only GitHub metadata adapter for the reviewed ecosystem registry.
 * Per-source failures are represented in the payload so one unavailable repository
 * does not make the other repository metadata inaccessible.
 */
export async function GET(request?: Request): Promise<Response> {
  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "ecosystem-metadata",
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await getPublicEcosystemRepositoryMetadata();
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
