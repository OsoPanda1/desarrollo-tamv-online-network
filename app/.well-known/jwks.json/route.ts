import { getTamvPassJwks, isTamvPassEnabled } from "@/lib/tamv-pass/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  if (!isTamvPassEnabled()) {
    return Response.json({ error: "tamv_pass_disabled" }, { status: 404, headers: NO_STORE_HEADERS });
  }

  try {
    const jwks = await getTamvPassJwks();
    return Response.json(jwks, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "tamv_pass_keys_unavailable" }, { status: 503, headers: NO_STORE_HEADERS });
  }
}
