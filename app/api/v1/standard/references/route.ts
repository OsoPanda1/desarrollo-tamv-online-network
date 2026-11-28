import { getReferenceCatalog } from "../../../../../lib/standard/references.ts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Public reference catalog: what each external system does, and what it does
 * not do. Inclusion is not endorsement, membership or certification.
 */
export async function GET() {
  return Response.json(getReferenceCatalog(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
