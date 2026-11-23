"use client"

import { useMemo } from "react"
import type { Locale } from "@/lib/i18n"
import type { HcuGraphData } from "@/components/hcu/hcu-graph"

type Props = {
  graph: HcuGraphData
  locale: Locale
  onSelectDomain: (id: string) => void
}

function localized(valueEs: string, valueEn: string, locale: Locale) {
  return locale === "en" ? valueEn : valueEs
}

function metricMean(values: number[]) {
  const finite = values.filter(Number.isFinite)
  return finite.length ? Number((finite.reduce((sum, value) => sum + value, 0) / finite.length).toFixed(1)) : null
}

function isPublicHttpUrl(value: string | null) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function HcuAnalyticsOverview({ graph, locale, onSelectDomain }: Props) {
  const english = locale === "en"
  const stats = useMemo(() => {
    const atomById = new Map(graph.atoms.map((atom) => [atom.id, atom]))
    const connected = new Set<string>()
    for (const edge of graph.edges) {
      edge.sourceAtomIds.forEach((id) => { if (atomById.has(id)) connected.add(id) })
      edge.targetAtomIds.forEach((id) => { if (atomById.has(id)) connected.add(id) })
    }
    const edgeStatuses = [...new Set(graph.edges.map((edge) => edge.evidenceStatus?.trim() || "unspecified"))]
      .map((status) => ({
        status,
        count: graph.edges.filter((edge) => (edge.evidenceStatus?.trim() || "unspecified") === status).length,
      }))
      .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status))
    const domains = graph.domains.map((domain) => {
      const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
      const atomIds = new Set(atoms.map((atom) => atom.id))
      const relationships = graph.edges.filter((edge) => [...edge.sourceAtomIds, ...edge.targetAtomIds].some((id) => atomIds.has(id)))
      return {
        domain,
        atoms: atoms.length,
        meanRisk: metricMean(atoms.map((atom) => atom.riskY)),
        highRisk: atoms.filter((atom) => Number.isFinite(atom.riskY) && atom.riskY >= 65).length,
        provisional: atoms.filter((atom) => atom.isProvisional).length,
        quarantined: atoms.filter((atom) => atom.isQuarantined).length,
        relationships: relationships.length,
      }
    })
    const crossDomainEdges = graph.edges.filter((edge) => {
      const source = new Set(edge.sourceAtomIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
      const target = new Set(edge.targetAtomIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
      return [...source].some((sourceId) => [...target].some((targetId) => sourceId !== targetId))
    }).length
    return {
      connected: connected.size,
      isolated: Math.max(0, graph.atoms.length - connected.size),
      highRisk: graph.atoms.filter((atom) => Number.isFinite(atom.riskY) && atom.riskY >= 65).length,
      provisional: graph.atoms.filter((atom) => atom.isProvisional).length,
      quarantined: graph.atoms.filter((atom) => atom.isQuarantined).length,
      meanInfluence: metricMean(graph.atoms.map((atom) => atom.influenceX)),
      meanRisk: metricMean(graph.atoms.map((atom) => atom.riskY)),
      meanEvidence: metricMean(graph.atoms.map((atom) => atom.evidenceZ)),
      edgesWithSourceUrl: graph.edges.filter((edge) => isPublicHttpUrl(edge.sourceUrl)).length,
      crossDomainEdges,
      edgeStatuses,
      domains,
    }
  }, [graph])

  const fmt = (value: number | null) => value === null ? "—" : value.toFixed(1)

  return <section className="hcu-analytics-panel" aria-labelledby="hcu-analytics-title">
    <header className="hcu-analytics-heading">
      <div>
        <p className="eyebrow">{english ? "HCU OBSERVATORY / DESCRIPTIVE LAYER" : "OBSERVATORIO HCU / CAPA DESCRIPTIVA"}</p>
        <h3 id="hcu-analytics-title">{english ? "Structure, risk and traceability" : "Estructura, riesgo y trazabilidad"}</h3>
        <p>{english
          ? "Computed from the current public graph snapshot. Metrics summarize declared records and structure; they are not independent validation, causal findings, or measured social impact."
          : "Calculado desde la instantánea actual del grafo público. Las métricas resumen registros y estructura declarados; no son validación independiente, hallazgos causales ni impacto social medido."}</p>
      </div>
      <span className="hcu-analytics-scope">{english ? "EXPLORATORY · NON-CAUSAL" : "EXPLORATORIO · NO CAUSAL"}</span>
    </header>

    <div className="hcu-analytics-kpis">
      <article><span>{english ? "Public domains" : "Dominios públicos"}</span><strong>{graph.domains.length}</strong><small>{english ? "classification groups" : "grupos de clasificación"}</small></article>
      <article><span>{english ? "Modeled atoms" : "Átomos modelados"}</span><strong>{graph.atoms.length}</strong><small>{stats.connected} {english ? "connected" : "conectados"} · {stats.isolated} {english ? "isolated" : "aislados"}</small></article>
      <article><span>{english ? "Declared hyperedges" : "Hiperaristas declaradas"}</span><strong>{graph.edges.length}</strong><small>{stats.crossDomainEdges} {english ? "cross-domain" : "entre dominios"}</small></article>
      <article className="is-risk"><span>{english ? "Declared risk ≥ 65" : "Riesgo declarado ≥ 65"}</span><strong>{stats.highRisk}</strong><small>{english ? "display threshold, not a validated standard" : "umbral visual, no estándar validado"}</small></article>
      <article><span>{english ? "Provisional records" : "Registros provisionales"}</span><strong>{stats.provisional}</strong><small>{english ? "documentary progression required" : "requieren progresión documental"}</small></article>
      <article><span>{english ? "Quarantined atoms" : "Átomos en cuarentena"}</span><strong>{stats.quarantined}</strong><small>{english ? "excluded from signal propagation" : "excluidos de propagación de señales"}</small></article>
    </div>

    <div className="hcu-analytics-metrics">
      <div><span>{english ? "Mean declared influence · X" : "Influencia declarada media · X"}</span><strong>{fmt(stats.meanInfluence)}</strong></div>
      <div><span>{english ? "Mean declared risk · Y" : "Riesgo declarado medio · Y"}</span><strong>{fmt(stats.meanRisk)}</strong></div>
      <div><span>{english ? "Mean declared evidence · Z" : "Evidencia declarada media · Z"}</span><strong>{fmt(stats.meanEvidence)}</strong></div>
      <div><span>{english ? "Relationships with public source URL" : "Relaciones con URL pública de fuente"}</span><strong>{stats.edgesWithSourceUrl} / {graph.edges.length}</strong></div>
    </div>

    <div className="hcu-analytics-detail-grid">
      <article className="hcu-analytics-card">
        <h4>{english ? "Recorded relationship states" : "Estados de relación registrados"}</h4>
        {stats.edgeStatuses.length ? stats.edgeStatuses.map(({ status, count }) => <div className="hcu-analytics-status-row" key={status}>
          <div><span>{status.toLowerCase().includes("hypoth") ? (english ? "Hypothesis" : "Hipótesis") : status}</span><strong>{count}</strong></div>
          <span className="hcu-analytics-track"><i style={{ width: (graph.edges.length ? count / graph.edges.length * 100 : 0) + "%" }} /></span>
        </div>) : <p>{english ? "No relationships have been recorded." : "No hay relaciones registradas."}</p>}
      </article>

      <article className="hcu-analytics-card">
        <h4>{english ? "Domain comparison" : "Comparativa por dominio"}</h4>
        <div className="hcu-analytics-table-scroll">
          <table className="hcu-analytics-table">
            <thead><tr><th>{english ? "Domain" : "Dominio"}</th><th>{english ? "Atoms" : "Átomos"}</th><th>{english ? "Mean risk" : "Riesgo medio"}</th><th>{english ? "Risk ≥ 65" : "Riesgo ≥ 65"}</th><th>{english ? "Relations" : "Relaciones"}</th></tr></thead>
            <tbody>{stats.domains.map((row) => <tr key={row.domain.id}>
              <th scope="row"><button type="button" className="hcu-analytics-domain-link" onClick={() => onSelectDomain(row.domain.id)}>{localized(row.domain.nameEs, row.domain.nameEn, locale)}</button></th>
              <td>{row.atoms}</td><td>{fmt(row.meanRisk)}</td><td>{row.highRisk}</td><td>{row.relationships}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </article>
    </div>

    <p className="hcu-analytics-caveat">{english
      ? "A declared source URL is a provenance pointer, not proof that a source supports the relationship. The risk threshold reflects a display convention, not a validated clinical, social or security score. Graph-derived aggregates are descriptive only."
      : "Una URL declarada es una referencia de procedencia, no prueba de que una fuente respalde la relación. El umbral de riesgo es una convención de visualización, no una puntuación clínica, social o de seguridad validada. Los agregados del grafo son únicamente descriptivos."}</p>
  </section>
}
