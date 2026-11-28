import { z } from "zod"
import { declarationSchema } from "../../../../../lib/standard/schema.ts"
import { STANDARD_ID, STANDARD_VERSION } from "../../../../../lib/standard/taxonomy.ts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Machine-readable input schema derived from the authoritative Zod schema.
 *
 * JSON Schema cannot express every refinement (URL safety, ORCID checksum,
 * cross-field dates), so the document is a starting point for editors, not a
 * replacement for the evaluator. `$comment` records the gap explicitly.
 */
export async function GET() {
  try {
    const jsonSchema = z.toJSONSchema(declarationSchema, {
      target: "draft-2020-12",
      io: "input",
      unrepresentable: "any",
    }) as Record<string, unknown>

    return Response.json(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        ...jsonSchema,
        $id: "https://tamv.online/api/v1/standard/schema",
        title: "TAMV Open Integrity Standard — declaration",
        "x-tamv-standard": STANDARD_ID,
        "x-tamv-standard-version": STANDARD_VERSION,
        $comment:
          "Derived from the Zod schema. Custom refinements (safe URLs, identifier checksums, date consistency) are enforced by POST /api/v1/standard/evaluate and are not fully representable in JSON Schema.",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/schema+json; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          "X-Content-Type-Options": "nosniff",
        },
      },
    )
  } catch {
    return Response.json(
      { error: "schema_unavailable", detail: "The JSON Schema projection could not be generated in this runtime." },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    )
  }
}
