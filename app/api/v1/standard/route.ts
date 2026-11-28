import { getStandardCatalog } from "../../../../lib/standard/index.ts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Public catalog of the TAMV Open Integrity Standard.
 *
 * This endpoint publishes vocabularies, limitations and endpoint locations. It
 * does not evaluate anything and does not certify the host organization.
 */
export async function GET() {
  return Response.json(getStandardCatalog(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
