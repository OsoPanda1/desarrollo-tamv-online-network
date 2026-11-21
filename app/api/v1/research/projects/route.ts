import { getPublicProjects } from "@/lib/research/queries"
import { apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const projects = await getPublicProjects()
    return apiJson({
      version: "1.0",
      records: projects.map(({ id, slug, category, titleEs, titleEn, subtitleEs, subtitleEn, descriptionEs, descriptionEn, maturity, limitsEs, limitsEn, sourceUrl, sourceCommit, license, verificationStatus, updatedAt }) => ({
        id,
        slug,
        category,
        title: { es: titleEs, en: titleEn },
        subtitle: { es: subtitleEs, en: subtitleEn },
        description: { es: descriptionEs, en: descriptionEn },
        maturity,
        limits: { es: limitsEs, en: limitsEn },
        provenance: { sourceUrl, sourceCommit, license, verificationStatus, updatedAt },
      })),
      note: "La madurez y verificación corresponden al registro documentado; no certifican despliegue, seguridad o impacto.",
    })
  } catch {
    return apiJson({ error: "El catálogo de proyectos no está disponible." }, 503)
  }
}
