import { getPublicResearchers } from "@/lib/research/queries"
import { apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const researchers = await getPublicResearchers()
    return apiJson({ version: "1.0", records: researchers })
  } catch {
    return apiJson({ error: "El directorio no está disponible." }, 503)
  }
}
