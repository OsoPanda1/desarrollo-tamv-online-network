export const HCU_HIGH_RISK_THRESHOLD = 65

export type HcuAnalyticsDomain = {
  id: string
  nameEs?: string
  nameEn?: string
  sortOrder?: number
}

export type HcuAnalyticsAtom = {
  id: string
  domainId: string
  influenceX: number
  riskY: number
  evidenceZ: number
  isProvisional: boolean
  isQuarantined: boolean
}

export type HcuAnalyticsEdge = {
  id: string
  sourceAtomIds: string[]
  targetAtomIds: string[]
  evidenceStatus: string
  sourceTitle?: string | null
  sourceUrl?: string | null
}

export type HcuAnalyticsInput = {
  domains: HcuAnalyticsDomain[]
  atoms: HcuAnalyticsAtom[]
  edges: HcuAnalyticsEdge[]
}

export type HcuDomainAnalytics = {
  id: string
  atomCount: number
  highRiskCount: number
  quarantinedCount: number
  provisionalCount: number
  meanInfluence: number | null
  meanRisk: number | null
  meanEvidence: number | null
  incidentEdgeCount: number
}

export type HcuAnalytics = {
  domainCount: number
  atomCount: number
  edgeCount: number
  highRiskCount: number
  quarantinedCount: number
  provisionalCount: number
  connectedAtomCount: number
  isolatedAtomCount: number
  crossDomainEdgeCount: number
  edgesWithSourceUrl: number
  sourceUrlCoveragePercent: number | null
  meanInfluence: number | null
  meanRisk: number | null
  meanEvidence: number | null
  invalidParameterAtomCount: number
  invalidEdgeCount: number
  edgeStatusCounts: Array<{ status: string; count: number }>
  domains: HcuDomainAnalytics[]
  topRiskAtomIds: string[]
}

function mean(values: number[]): number | null {
  const finite = values.filter(Number.isFinite)
  if (!finite.length) return null
  return Number((finite.reduce((sum, value) => sum + value, 0) / finite.length).toFixed(1))
}

function inScale(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100
}

function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Descriptive statistics over the public HCU graph. These values summarize
 * declarations stored in the graph; they do not imply independent validation,
 * predictive validity, causality, or measured real-world impact.
 */
export function deriveHcuAnalytics(graph: HcuAnalyticsInput): HcuAnalytics {
  const atomById = new Map(graph.atoms.map((atom) => [atom.id, atom]))
  const domainById = new Map(graph.domains.map((domain) => [domain.id, domain]))
  const connected = new Set<string>()
  const domainMetrics = graph.domains.map((domain) => {
    const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
    return {
      id: domain.id,
      atomCount: atoms.length,
      highRiskCount: atoms.filter((atom) => Number.isFinite(atom.riskY) && atom.riskY >= HCU_HIGH_RISK_THRESHOLD).length,
      quarantinedCount: atoms.filter((atom) => atom.isQuarantined).length,
      provisionalCount: atoms.filter((atom) => atom.isProvisional).length,
      meanInfluence: mean(atoms.map((atom) => atom.influenceX)),
      meanRisk: mean(atoms.map((atom) => atom.riskY)),
      meanEvidence: mean(atoms.map((atom) => atom.evidenceZ)),
      incidentEdgeCount: 0,
    }
  })
  const domainMetricById = new Map(domainMetrics.map((metric) => [metric.id, metric]))
  let crossDomainEdgeCount = 0
  let invalidEdgeCount = 0
  let edgesWithSourceUrl = 0
  const statusCounts = new Map<string, number>()

  for (const edge of graph.edges) {
    const sourceIds = Array.isArray(edge.sourceAtomIds) ? edge.sourceAtomIds : []
    const targetIds = Array.isArray(edge.targetAtomIds) ? edge.targetAtomIds : []
    const endpoints = [...sourceIds, ...targetIds]
    const hasInvalidEndpoint =
      sourceIds.length === 0 ||
      targetIds.length === 0 ||
      endpoints.some((id) => !atomById.has(id))

    if (hasInvalidEndpoint) invalidEdgeCount += 1
    for (const id of endpoints) {
      const atom = atomById.get(id)
      if (atom) connected.add(id)
    }

    const sourceDomains = new Set(sourceIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
    const targetDomains = new Set(targetIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
    if ([...sourceDomains].some((sourceDomain) => [...targetDomains].some((targetDomain) => sourceDomain !== targetDomain))) {
      crossDomainEdgeCount += 1
    }

    const incidentDomains = new Set(endpoints.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
    incidentDomains.forEach((domainId) => {
      const metric = domainMetricById.get(domainId)
      if (metric) metric.incidentEdgeCount += 1
    })

    const status = edge.evidenceStatus?.trim() || "unspecified"
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    if (isHttpUrl(edge.sourceUrl)) edgesWithSourceUrl += 1
  }

  const invalidParameterAtomCount = graph.atoms.filter(
    (atom) => !inScale(atom.influenceX) || !inScale(atom.riskY) || !inScale(atom.evidenceZ),
  ).length

  return {
    domainCount: graph.domains.length,
    atomCount: graph.atoms.length,
    edgeCount: graph.edges.length,
    highRiskCount: graph.atoms.filter((atom) => Number.isFinite(atom.riskY) && atom.riskY >= HCU_HIGH_RISK_THRESHOLD).length,
    quarantinedCount: graph.atoms.filter((atom) => atom.isQuarantined).length,
    provisionalCount: graph.atoms.filter((atom) => atom.isProvisional).length,
    connectedAtomCount: connected.size,
    isolatedAtomCount: Math.max(0, graph.atoms.length - connected.size),
    crossDomainEdgeCount,
    edgesWithSourceUrl,
    sourceUrlCoveragePercent: graph.edges.length
      ? Number(((edgesWithSourceUrl / graph.edges.length) * 100).toFixed(1))
      : null,
    meanInfluence: mean(graph.atoms.map((atom) => atom.influenceX)),
    meanRisk: mean(graph.atoms.map((atom) => atom.riskY)),
    meanEvidence: mean(graph.atoms.map((atom) => atom.evidenceZ)),
    invalidParameterAtomCount,
    invalidEdgeCount,
    edgeStatusCounts: [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status)),
    domains: domainMetrics.sort((a, b) => a.id.localeCompare(b.id)),
    topRiskAtomIds: [...graph.atoms]
      .filter((atom) => Number.isFinite(atom.riskY))
      .sort((a, b) => b.riskY - a.riskY || a.id.localeCompare(b.id))
      .slice(0, 5)
      .map((atom) => atom.id),
  }
}
