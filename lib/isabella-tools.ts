import { tool } from "ai"
import { z } from "zod"
import { rankPublicRecords } from "@/lib/isabella-search"
import {
  getPublicHcuGraph,
  getPublicProjects,
  getPublicResearchTopics,
  getPublishedProposals,
} from "@/lib/research/queries"

function safeSourceUrl(value: string | null | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function excerpt(value: string | null | undefined, maxLength = 280) {
  const compact = (value ?? "").replace(/\s+/g, " ").trim()
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
}

export const isabellaTools = {
  searchPublicTAMVMaterials: tool({
    description: "Read-only lexical search over TAMV public project records, open research topics, and voluntarily published research proposals. Use for questions about specific current records. Returns source links and project-declared maturity; it does not browse the web or access private records.",
    inputSchema: z.object({
      query: z.string().trim().min(2).max(120).describe("Short topic, project name, research question, or keywords to look for."),
      collection: z.enum(["all", "projects", "research", "publications"]).optional().describe("Optional public record group to search."),
    }),
    execute: async ({ query, collection = "all" }) => {
      const [projects, topics, proposals] = await Promise.all([
        collection === "all" || collection === "projects" ? getPublicProjects() : Promise.resolve([]),
        collection === "all" || collection === "research" ? getPublicResearchTopics() : Promise.resolve([]),
        collection === "all" || collection === "publications" ? getPublishedProposals() : Promise.resolve([]),
      ])

      const records = [
        ...projects.map((project) => ({
          kind: "project" as const,
          title: project.titleEs,
          titleEn: project.titleEn,
          searchText: [project.titleEn, project.subtitleEs, project.subtitleEn, project.descriptionEs, project.descriptionEn, project.category].join(" "),
          summary: excerpt(project.descriptionEs, 280),
          summaryEn: excerpt(project.descriptionEn, 280),
          status: project.maturity,
          evidenceStatus: project.verificationStatus,
          href: safeSourceUrl(project.sourceUrl) ?? "/proyectos",
          sourceTitle: project.sourceUrl ? "Project reference" : "TAMV public project catalog",
        })),
        ...topics.map((topic) => ({
          kind: "research topic" as const,
          title: topic.titleEs,
          titleEn: topic.titleEn,
          searchText: [topic.titleEn, topic.questionEs, topic.questionEn, topic.area, topic.contributorsEs, topic.contributorsEn].join(" "),
          summary: excerpt(topic.questionEs, 280),
          summaryEn: excerpt(topic.questionEn, 280),
          status: topic.status,
          evidenceStatus: "Open research topic; not an accepted proposal",
          href: "/investigacion",
          sourceTitle: "TAMV open research topics",
        })),
        ...proposals.map((proposal) => ({
          kind: "published proposal" as const,
          title: proposal.title,
          titleEn: proposal.title,
          searchText: [proposal.title, proposal.abstract, proposal.proposalType].join(" "),
          summary: excerpt(proposal.abstract, 280),
          summaryEn: excerpt(proposal.abstract, 280),
          status: proposal.proposalType,
          evidenceStatus: "Published with sharing consent; publication is not peer review or accreditation",
          href: safeSourceUrl(proposal.sourceUrl) ?? "/investigacion",
          sourceTitle: proposal.sourceUrl ? "Proposal source" : "TAMV research portal",
        })),
      ]

      const matches = rankPublicRecords(query, records, 5).map(({ searchText: _searchText, ...record }) => record)
      return {
        scope: "public TAMV records only",
        searchMethod: "Diacritic-insensitive lexical matching; this is not an external web search or an independent review.",
        query,
        resultCount: matches.length,
        matches,
        note: matches.length ? "Records describe project-provided information. Maturity and verification labels are not independent certification." : "No public record matched these terms. Do not infer that a capability exists from an empty result.",
      }
    },
  }),

  inspectPublicHCUMap: tool({
    description: "Read-only inspection of the current public HCU graph. Use to locate declared nodes, relationships, evidence labels, and cited sources. This is a conceptual research graph, not a geographic map, causal proof, or forecast.",
    inputSchema: z.object({
      query: z.string().trim().max(120).optional().describe("Optional topic, domain, or node terms; leave blank for a short graph inventory."),
      limit: z.number().int().min(1).max(8).optional().describe("Maximum matching nodes to return; defaults to 6."),
    }),
    execute: async ({ query = "", limit = 6 }) => {
      const graph = await getPublicHcuGraph()
      const domains = new Map(graph.domains.map((domain) => [domain.id, domain]))
      const candidates = graph.atoms.map((atom) => {
        const domain = domains.get(atom.domainId)
        const title = atom.nameEs
        const searchText = [
          atom.nameEn,
          atom.descriptionEs,
          atom.descriptionEn,
          domain?.nameEs,
          domain?.nameEn,
          domain?.descriptionEs,
          domain?.descriptionEn,
        ].join(" ")
        return { atom, domain, title, searchText }
      })
      const ranked = query.trim()
        ? rankPublicRecords(query, candidates, limit)
        : candidates.slice(0, limit)
      const atomIds = new Set(ranked.map(({ atom }) => atom.id))
      const relatedEdges = graph.edges
        .filter((edge) => edge.sourceAtomIds.some((id) => atomIds.has(id)) || edge.targetAtomIds.some((id) => atomIds.has(id)))
        .slice(0, 8)

      return {
        scope: "public HCU graph only",
        counts: { domains: graph.domains.length, atoms: graph.atoms.length, relationships: graph.edges.length },
        query: query || null,
        nodes: ranked.map(({ atom, domain }) => ({
          name: atom.nameEs,
          nameEn: atom.nameEn,
          domain: domain?.nameEs ?? "HCU",
          domainEn: domain?.nameEn ?? "HCU",
          description: excerpt(atom.descriptionEs),
          descriptionEn: excerpt(atom.descriptionEn),
          influenceX: atom.influenceX,
          riskY: atom.riskY,
          evidenceZ: atom.evidenceZ,
          provisional: atom.isProvisional,
          quarantined: atom.isQuarantined,
          interpretation: "Project-declared input; not an independently measured outcome.",
        })),
        relationships: relatedEdges.map((edge) => ({
          sources: edge.sourceAtomIds.map((id) => graph.atoms.find((atom) => atom.id === id)?.nameEs ?? id),
          targets: edge.targetAtomIds.map((id) => graph.atoms.find((atom) => atom.id === id)?.nameEs ?? id),
          sign: edge.sign,
          weight: edge.weight,
          delayYears: edge.delayYears,
          evidenceStatus: edge.evidenceStatus,
          sourceTitle: edge.sourceTitle,
          sourceUrl: safeSourceUrl(edge.sourceUrl),
        })),
        graphReference: "/api/v1/hcu/graph",
        caveat: "HCU positions are for navigation only. Declared relationships and evidence scores are hypotheses and project-provided metadata, not geography, causal proof, independent measurement, or forecasts.",
      }
    },
  }),
}
