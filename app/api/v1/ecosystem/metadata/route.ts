import { getPublicEcosystemRepositoryMetadata } from "../../../../../lib/ecosystem/github-metadata.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Read-only GitHub metadata adapter for the reviewed ecosystem registry.
 * Per-source failures are represented in the payload so one unavailable repository
 * does not make the other repository metadata inaccessible.
 */
export async function GET(): Promise<Response> {
  const body = await getPublicEcosystemRepositoryMetadata();
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
