import { getPublicResearchTopics } from "@/lib/research/queries"
import { apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const topics = await getPublicResearchTopics()
    return apiJson({
      version: "1.0",
      records: topics.map(({ id, slug, area, titleEs, titleEn, questionEs, questionEn, contributorsEs, contributorsEn, formatEs, formatEn, modes, status, updatedAt }) => ({
        id,
        slug,
        area,
        title: { es: titleEs, en: titleEn },
        question: { es: questionEs, en: questionEn },
        contributors: { es: contributorsEs, en: contributorsEn },
        formats: { es: formatEs, en: formatEn },
        modes,
        status,
        updatedAt,
      })),
      note: "Las líneas describen temas editoriales; no constituyen convocatorias ni garantizan publicación.",
    })
  } catch {
    return apiJson({ error: "El catálogo de investigación no está disponible." }, 503)
  }
}
