import { getPublicProjects, getPublicResearchTopics, getPublishedProposals, PublicCollectionLimitError, PUBLIC_RESEARCH_RECORD_LIMIT } from "@/lib/research/queries"
import { csvCell } from "@/lib/research/csv"
import { getSiteOrigin } from "@/lib/seo"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const [projects, topics, proposals] = await Promise.all([
      getPublicProjects(),
      getPublicResearchTopics(),
      getPublishedProposals(),
    ])
    const origin = getSiteOrigin()
    const records = [
      ...projects.map((project) => ({
        "@type": "ResearchProject",
        "@id": `${origin}/proyectos/${project.slug}`,
        name: { es: project.titleEs, en: project.titleEn },
        description: { es: project.descriptionEs, en: project.descriptionEn },
        category: project.category,
        maturity: project.maturity,
        dateModified: project.updatedAt.toISOString(),
        license: project.license,
        citation: project.sourceUrl,
        sourceCommit: project.sourceCommit,
        verificationStatus: project.verificationStatus,
        limitations: { es: project.limitsEs, en: project.limitsEn },
      })),
      ...topics.map((topic) => ({
        "@type": "ResearchTopic",
        "@id": `${origin}/investigacion/${topic.slug}`,
        name: { es: topic.titleEs, en: topic.titleEn },
        question: { es: topic.questionEs, en: topic.questionEn },
        area: topic.area,
        contributionModes: topic.modes,
        dateModified: topic.updatedAt.toISOString(),
      })),
      ...proposals.map((proposal) => ({
        "@type": "ScholarlyArticle",
        "@id": `${origin}/investigacion/publicaciones#${proposal.id}`,
        name: proposal.title,
        abstract: proposal.abstract,
        datePublished: proposal.publishedAt?.toISOString() ?? null,
        license: proposal.license,
        url: proposal.sourceUrl,
      })),
    ]

    if (new URL(request.url).searchParams.get("format") === "csv") {
      const header = ["type", "id", "name_es", "name_en", "description_es", "description_en", "maturity", "license", "source_url", "source_commit", "verification_status"]
      const rows = [
        ...projects.map((project) => ["project", project.id, project.titleEs, project.titleEn, project.descriptionEs, project.descriptionEn, project.maturity, project.license, project.sourceUrl, project.sourceCommit, project.verificationStatus]),
        ...topics.map((topic) => ["topic", topic.id, topic.titleEs, topic.titleEn, topic.questionEs, topic.questionEn, topic.status, "", `${origin}/investigacion/${topic.slug}`, "", "editorial-topic"]),
        ...proposals.map((proposal) => ["publication", proposal.id, proposal.title, proposal.title, proposal.abstract, proposal.abstract, "published", proposal.license, proposal.sourceUrl, "", "published-with-consent"]),
      ]
      const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="tamv-research-export.csv"',
          "Cache-Control": "no-store",
        },
      })
    }

    return NextResponse.json(
      {
        "@context": ["https://schema.org", { tamv: `${origin}/vocab/` }],
        "@type": "DataCatalog",
        name: "TAMV Online Network — catálogo de investigación",
        url: `${origin}/investigacion`,
        dateModified: new Date().toISOString(),
        recordLimitPerCollection: PUBLIC_RESEARCH_RECORD_LIMIT,
        recordCounts: { projects: projects.length, topics: topics.length, publications: proposals.length },
        distribution: [
          { "@type": "DataDownload", encodingFormat: "application/ld+json", contentUrl: `${origin}/api/v1/exports/research` },
          { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${origin}/api/v1/exports/research?format=csv` },
        ],
        dataset: records,
        conditionsOfAccess: "Los metadatos públicos pueden reutilizarse respetando la licencia declarada por cada registro. Una licencia ausente no concede permisos adicionales.",
        note: `Este exporte describe metadatos; no deposita, certifica ni valida los materiales citados. Admite hasta ${PUBLIC_RESEARCH_RECORD_LIMIT} registros por colección y responde 503 en lugar de truncarlos.`,
      },
      { headers: { "Content-Type": "application/ld+json; charset=utf-8", "Cache-Control": "no-store" } },
    )
  } catch (error) {
    const payload = error instanceof PublicCollectionLimitError
      ? { error: "El exporte supera el límite operativo; no se devuelven registros truncados.", code: "public_collection_limit_exceeded" }
      : { error: "El exporte no está disponible." }
    return NextResponse.json(payload, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
