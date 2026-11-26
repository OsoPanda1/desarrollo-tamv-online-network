import { readPublicHfSnapshot } from "../../../../lib/huggingface/public-snapshot.ts";
import { enforcePublicRateLimit } from "../../../../lib/rate-limit/server.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Read-only view of a committed public Hugging Face metadata snapshot.
 * It performs no network request at runtime and exposes no credentials, model
 * weights, inference output or verification claim.
 */
export async function GET(request?: Request): Promise<Response> {
  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "huggingface-snapshot",
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  try {
    const snapshot = readPublicHfSnapshot();
    return Response.json(
      {
        ok: true,
        ...snapshot,
        semantics:
          "Public repository metadata snapshot only. No inference, weights, credentials, peer review or external verification is implied.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { ok: false, error: "snapshot_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
