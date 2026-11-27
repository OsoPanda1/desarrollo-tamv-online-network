import { getTamvPassJwks, getTamvPassMetadata, isTamvPassEnabled } from "@/lib/tamv-pass/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!isTamvPassEnabled()) {
    return Response.json(
      { error: "tamv_pass_disabled" },
      { status: 404, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }

  try {
    // Do not advertise a usable issuer unless its current public key can be published.
    await getTamvPassJwks();
    return Response.json(getTamvPassMetadata(), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "tamv_pass_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
