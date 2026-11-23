"use client"

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Database,
  Network,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Table2,
  Workflow,
} from "lucide-react"
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react"
import type { Locale } from "@/lib/i18n"
import { deriveHcuAnalytics, HCU_HIGH_RISK_THRESHOLD } from "@/lib/hcu/analytics"

type HcuDomain = { id: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; sortOrder: number }
type HcuAtom = { id: string; domainId: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; influenceX: number; riskY: number; evidenceZ: number; isProvisional: boolean; isQuarantined: boolean }
type HcuEdge = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; weight: number; sign: number; delayYears: number; tqafLevel: string | null; evidenceStatus: string; sourceTitle: string | null; sourceUrl: string | null }
export type HcuGraphData = { domains: HcuDomain[]; atoms: HcuAtom[]; edges: HcuEdge[] }
type Point = { x: number; y: number }
type Selection = { kind: "atom" | "domain" | "edge"; id: string }
type EvidenceFilter = "all" | "hypothesis" | "other"
type RiskFilter = "all" | "critical"
type RecordFilter = "all" | "provisional" | "quarantined" | "active"
type GraphView = "network" | "matrix" | "records"

const MAP_WIDTH = 1180
const MAP_HEIGHT = 760
const CENTER = { x: 590, y: 380 }
const DOMAIN_COLORS = ["#d9a777", "#6fd0c6", "#92b9e8", "#d5bd77", "#b3a0ea", "#93cfa8", "#e6a0b0"]
const MATRIX = { width: 900, height: 520, left: 88, right: 44, top: 40, bottom: 76 }
const MATRIX_PLOT_WIDTH = MATRIX.width - MATRIX.left - MATRIX.right
const MATRIX_PLOT_HEIGHT = MATRIX.height - MATRIX.top - MATRIX.bottom

function buildMapCoordinates(graph: HcuGraphData) {
  const domainPositions = new Map<string, Point>()
  const atomPositions = new Map<string, Point>()
  const domainCount = Math.max(graph.domains.length, 1)
  const atomsByDomain = new Map<string, HcuAtom[]>()

  graph.atoms.forEach((atom) => {
    const current = atomsByDomain.get(atom.domainId) ?? []
    current.push(atom)
    atomsByDomain.set(atom.domainId, current)
  })

  graph.domains.forEach((domain, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / domainCount
    domainPositions.set(domain.id, {
      x: CENTER.x + Math.cos(angle) * 365,
      y: CENTER.y + Math.sin(angle) * 252,
    })
  })

  graph.domains.forEach((domain, domainIndex) => {
    const atoms = atomsByDomain.get(domain.id) ?? []
    const ringRadius = Math.min(79, Math.max(45, 35 + Math.sqrt(atoms.length) * 8))
    const center = domainPositions.get(domain.id) ?? CENTER
    atoms.forEach((atom, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(atoms.length, 1) + domainIndex * 0.13
      atomPositions.set(atom.id, {
        x: center.x + Math.cos(angle) * ringRadius,
        y: center.y + Math.sin(angle) * ringRadius * 0.82,
      })
    })
  })

  return { domainPositions, atomPositions, atomsByDomain }
}

function averagePoint(ids: string[], positions: Map<string, Point>) {
  const points = ids.map((id) => positions.get(id)).filter((point): point is Point => Boolean(point))
  if (points.length === 0) return null
  return points.reduce((sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }), { x: 0, y: 0 })
}

function activateOnKeyboard(event: KeyboardEvent<SVGGElement>, activate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    activate()
  }
}

function safeExternalUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function localized(valueEs: string, valueEn: string, english: boolean) {
  return english ? valueEn : valueEs
}

function localizedEvidenceStatus(status: string, english: boolean) {
  return status.toLowerCase().includes("hypoth") ? (english ? "Hypothesis" : "Hipótesis") : status
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0))
}

function formatMetric(value: number | null) {
  return value === null ? "—" : value.toFixed(1)
}

function mean(values: number[]) {
  const finite = values.filter(Number.isFinite)
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null
}

function domainColor(index: number) {
  return DOMAIN_COLORS[Math.max(index, 0) % DOMAIN_COLORS.length]
}

function crossDomain(edge: HcuEdge, atomById: Map<string, HcuAtom>) {
  const sourceDomains = new Set(edge.sourceAtomIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
  const targetDomains = new Set(edge.targetAtomIds.map((id) => atomById.get(id)?.domainId).filter((id): id is string => Boolean(id)))
  return [...sourceDomains].some((source) => [...targetDomains].some((target) => target !== source))
}

function Meter({ label, value }: { label: string; value: number }) {
  const boundedValue = clamp(value)
  return <div className="hcu-meter-row">
    <div className="hcu-meter-label"><span>{label}</span><strong>{Number.isFinite(value) ? value.toFixed(1) : "—"}</strong></div>
    <div className="hcu-meter-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={boundedValue}>
      <span style={{ width: String(boundedValue) + "%" }} />
    </div>
  </div>
}

function MatrixView({
  atoms,
  domains,
  selection,
  english,
  onSelect,
}: {
  atoms: HcuAtom[]
  domains: HcuDomain[]
  selection: Selection | null
  english: boolean
  onSelect: (id: string) => void
}) {
  const domainIndex = new Map(domains.map((domain, index) => [domain.id, index]))
  const x = (value: number) => MATRIX.left + (clamp(value) / 100) * MATRIX_PLOT_WIDTH
  const y = (value: number) => MATRIX.top + ((100 - clamp(value)) / 100) * MATRIX_PLOT_HEIGHT
  const thresholdY = y(HCU_HIGH_RISK_THRESHOLD)

  return <div className="hcu-matrix-panel">
    <div className="hcu-matrix-heading">
      <div>
        <p className="eyebrow">{english ? "BIVARIATE EXPLORATION" : "EXPLORACIÓN BIVARIADA"}</p>
        <h3>{english ? "Influence × declared risk" : "Influencia × riesgo declarado"}</h3>
      </div>
      <p>{english ? "Position encodes X/Y; circle size encodes declared evidence Z. Select a point to inspect its record." : "La posición representa X/Y; el tamaño del punto representa evidencia declarada Z. Selecciona un punto para inspeccionar su registro."}</p>
    </div>
    <div className="hcu-matrix-scroll" role="region" aria-label={english ? "Risk and influence matrix" : "Matriz de riesgo e influencia"} tabIndex={0}>
      <svg className="hcu-matrix-canvas" viewBox="0 0 900 520" role="img" aria-labelledby="hcu-matrix-title hcu-matrix-desc">
        <title id="hcu-matrix-title">{english ? "HCU influence and risk matrix" : "Matriz HCU de influencia y riesgo"}</title>
        <desc id="hcu-matrix-desc">{english ? "Each point is a public HCU atom. Horizontal position is declared influence, vertical position is declared risk, and diameter represents declared evidence. These are declared model inputs, not independent measurements." : "Cada punto representa un átomo HCU público. La posición horizontal es la influencia declarada, la vertical el riesgo declarado y el diámetro representa la evidencia declarada. Son entradas declaradas del modelo, no mediciones independientes."}</desc>
        <rect x={MATRIX.left} y={MATRIX.top} width={MATRIX_PLOT_WIDTH} height={MATRIX_PLOT_HEIGHT} className="hcu-matrix-plot" />
        <rect x={MATRIX.left} y={MATRIX.top} width={MATRIX_PLOT_WIDTH / 2} height={MATRIX_PLOT_HEIGHT} className="hcu-matrix-quadrant is-low-influence" />
        <rect x={MATRIX.left + MATRIX_PLOT_WIDTH / 2} y={MATRIX.top} width={MATRIX_PLOT_WIDTH / 2} height={MATRIX_PLOT_HEIGHT} className="hcu-matrix-quadrant is-high-influence" />
        {[0, 20, 40, 60, 80, 100].map((tick) => <g key={tick} className="hcu-matrix-gridline">
          <line x1={x(tick)} y1={MATRIX.top} x2={x(tick)} y2={MATRIX.top + MATRIX_PLOT_HEIGHT} />
          <line x1={MATRIX.left} y1={y(tick)} x2={MATRIX.left + MATRIX_PLOT_WIDTH} y2={y(tick)} />
          <text x={x(tick)} y={MATRIX.top + MATRIX_PLOT_HEIGHT + 22} textAnchor="middle">{tick}</text>
          <text x={MATRIX.left - 13} y={y(tick) + 3} textAnchor="end">{tick}</text>
        </g>)}
        <line x1={MATRIX.left} y1={thresholdY} x2={MATRIX.left + MATRIX_PLOT_WIDTH} y2={thresholdY} className="hcu-matrix-risk-threshold" />
        <text x={MATRIX.left + MATRIX_PLOT_WIDTH - 5} y={thresholdY - 8} textAnchor="end" className="hcu-matrix-threshold-label">{english ? "High-risk display threshold ≥ 65" : "Umbral visual de riesgo alto ≥ 65"}</text>
        <text x={MATRIX.left + MATRIX_PLOT_WIDTH / 2} y={MATRIX.height - 20} textAnchor="middle" className="hcu-matrix-axis-label">{english ? "Declared influence (X)" : "Influencia declarada (X)"}</text>
        <text x="22" y={MATRIX.top + MATRIX_PLOT_HEIGHT / 2} textAnchor="middle" className="hcu-matrix-axis-label" transform={"rotate(-90 22 " + (MATRIX.top + MATRIX_PLOT_HEIGHT / 2) + ")"}>{english ? "Declared risk (Y)" : "Riesgo declarado (Y)"}</text>
        {atoms.map((atom) => {
          const index = domainIndex.get(atom.domainId) ?? 0
          const isSelected = selection?.kind === "atom" && selection.id === atom.id
          const radius = 5 + (clamp(atom.evidenceZ) / 100) * 9
          const outOfScale = ![atom.influenceX, atom.riskY, atom.evidenceZ].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)
          const label = english ? atom.nameEn : atom.nameEs
          const aria = label + ". " + (english ? "Influence " : "Influencia ") + atom.influenceX + "; " + (english ? "risk " : "riesgo ") + atom.riskY + "; " + (english ? "declared evidence " : "evidencia declarada ") + atom.evidenceZ + (atom.isQuarantined ? (english ? "; quarantined" : "; en cuarentena") : "")
          return <g key={atom.id} role="button" tabIndex={0} aria-label={aria} aria-pressed={isSelected} className={"hcu-matrix-point" + (isSelected ? " is-selected" : "") + (atom.isQuarantined ? " is-quarantined" : "") + (atom.isProvisional ? " is-provisional" : "") + (atom.riskY >= HCU_HIGH_RISK_THRESHOLD ? " is-high-risk" : "") + (outOfScale ? " is-out-of-scale" : "")} onClick={() => onSelect(atom.id)} onKeyDown={(event) => activateOnKeyboard(event, () => onSelect(atom.id))}>
            <circle className="hcu-matrix-point-halo" cx={x(atom.influenceX)} cy={y(atom.riskY)} r={radius + 5} />
            <circle className="hcu-matrix-point-core" cx={x(atom.influenceX)} cy={y(atom.riskY)} r={radius} style={{ "--domain-color": domainColor(index) } as CSSProperties} />
            {isSelected && <text x={x(atom.influenceX) + radius + 8} y={y(atom.riskY) - radius - 4} className="hcu-matrix-point-label">{label}</text>}
          </g>
        })}
      </svg>
    </div>
    <div className="hcu-matrix-legend">
      <span><i className="hcu-matrix-key-dot" />{english ? "Point color: domain" : "Color del punto: dominio"}</span>
      <span><i className="hcu-matrix-key-dot is-risk" />{english ? "Outline: risk ≥ 65" : "Contorno: riesgo ≥ 65"}</span>
      <span><i className="hcu-matrix-key-dot is-quarantined" />{english ? "Dashed: quarantined" : "Trazo discontinuo: cuarentena"}</span>
      <span>{english ? "Size: declared evidence Z" : "Tamaño: evidencia declarada Z"}</span>
    </div>
  </div>
}

export function HcuGraph({ graph, locale = "es", onUseAtom }: { graph: HcuGraphData; locale?: Locale; onUseAtom: (id: string) => void }) {
  const english = locale === "en"
  const [query, setQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("all")
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all")
  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all")
  const [view, setView] = useState<GraphView>("network")
  const [showLabels, setShowLabels] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(() => graph.atoms[0] ? { kind: "atom", id: graph.atoms[0].id } : null)

  const coordinates = useMemo(() => buildMapCoordinates(graph), [graph])
  const analytics = useMemo(() => deriveHcuAnalytics(graph), [graph])
  const normalizedQuery = query.trim().toLocaleLowerCase(english ? "en" : "es")
  const domainById = useMemo(() => new Map(graph.domains.map((domain) => [domain.id, domain])), [graph.domains])
  const atomById = useMemo(() => new Map(graph.atoms.map((atom) => [atom.id, atom])), [graph.atoms])
  const atomNames = useMemo(() => new Map(graph.atoms.map((atom) => [atom.id, localized(atom.nameEs, atom.nameEn, english)])), [graph.atoms, english])
  const domainAnalyticsById = useMemo(() => new Map(analytics.domains.map((domain) => [domain.id, domain])), [analytics.domains])

  const matchingEdgeIds = useMemo(() => new Set(graph.edges.filter((edge) => {
    if (!normalizedQuery) return false
    const searchText = [
      edge.id,
      edge.evidenceStatus,
      localizedEvidenceStatus(edge.evidenceStatus, english),
      edge.sourceTitle ?? "",
      edge.sourceUrl ?? "",
      edge.tqafLevel ?? "",
      ...edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id),
      ...edge.targetAtomIds.map((id) => atomNames.get(id) ?? id),
    ].join(" ").toLocaleLowerCase(english ? "en" : "es")
    return searchText.includes(normalizedQuery)
  }).map((edge) => edge.id)), [graph.edges, atomNames, english, normalizedQuery])
  const matchingEdgeAtomIds = useMemo(() => new Set(graph.edges.filter((edge) => matchingEdgeIds.has(edge.id)).flatMap((edge) => [...edge.sourceAtomIds, ...edge.targetAtomIds]), [graph.edges, matchingEdgeIds])

  const atomMatchesQuery = (atom: HcuAtom) => {
    if (!normalizedQuery) return true
    const domain = domainById.get(atom.domainId)
    const searchableText = [
      atom.id, atom.nameEs, atom.nameEn, atom.descriptionEs, atom.descriptionEn,
      domain?.nameEs ?? "", domain?.nameEn ?? "", domain?.descriptionEs ?? "", domain?.descriptionEn ?? "",
    ].join(" ").toLocaleLowerCase(english ? "en" : "es")
    return searchableText.includes(normalizedQuery) || matchingEdgeAtomIds.has(atom.id)
  }
  const domainMatchesQuery = (domain: HcuDomain) => !normalizedQuery || [domain.id, domain.nameEs, domain.nameEn, domain.descriptionEs, domain.descriptionEn].join(" ").toLocaleLowerCase(english ? "en" : "es").includes(normalizedQuery)
  const edgeMatchesEvidence = (edge: HcuEdge) => evidenceFilter === "all" || (evidenceFilter === "hypothesis" ? edge.evidenceStatus.toLowerCase().includes("hypoth") : !edge.evidenceStatus.toLowerCase().includes("hypoth"))
  const atomMatchesRecordFilter = (atom: HcuAtom) => recordFilter === "all" || (recordFilter === "provisional" ? atom.isProvisional : recordFilter === "quarantined" ? atom.isQuarantined : !atom.isQuarantined)
  const atomMatchesRiskFilter = (atom: HcuAtom) => riskFilter === "all" || (Number.isFinite(atom.riskY) && atom.riskY >= HCU_HIGH_RISK_THRESHOLD)
  const visibleAtoms = graph.atoms.filter((atom) =>
    (domainFilter === "all" || atom.domainId === domainFilter) &&
    atomMatchesRecordFilter(atom) &&
    atomMatchesRiskFilter(atom) &&
    atomMatchesQuery(atom),
  )
  const visibleAtomIds = new Set(visibleAtoms.map((atom) => atom.id))
  const visibleEdges = graph.edges.filter((edge) => {
    const endpointIds = [...edge.sourceAtomIds, ...edge.targetAtomIds]
    const inDomain = domainFilter === "all" || endpointIds.some((id) => atomById.get(id)?.domainId === domainFilter)
    const inSearch = !normalizedQuery || matchingEdgeIds.has(edge.id) || endpointIds.some((id) => visibleAtomIds.has(id))
    const inNodeScope = riskFilter === "all" && recordFilter === "all" || endpointIds.some((id) => visibleAtomIds.has(id))
    return edgeMatchesEvidence(edge) && inDomain && inSearch && inNodeScope
  })
  const visibleEdgeIds = new Set(visibleEdges.map((edge) => edge.id))
  const selectedAtom = selection?.kind === "atom" ? atomById.get(selection.id) : undefined
  const selectedDomain = selection?.kind === "domain" ? domainById.get(selection.id) : undefined
  const selectedEdge = selection?.kind === "edge" ? graph.edges.find((edge) => edge.id === selection.id) : undefined
  const selectedDomainAtoms = selectedDomain ? graph.atoms.filter((atom) => atom.domainId === selectedDomain.id) : []
  const selectedAtomEdges = selectedAtom ? graph.edges.filter((edge) => edge.sourceAtomIds.includes(selectedAtom.id) || edge.targetAtomIds.includes(selectedAtom.id)) : []
  const hasActiveFilters = Boolean(normalizedQuery) || domainFilter !== "all" || evidenceFilter !== "all" || riskFilter !== "all" || recordFilter !== "all"
  const visibleMeanRisk = mean(visibleAtoms.map((atom) => atom.riskY))
  const visibleMeanInfluence = mean(visibleAtoms.map((atom) => atom.influenceX))
  const visibleMeanEvidence = mean(visibleAtoms.map((atom) => atom.evidenceZ))

  function resetFilters() {
    setQuery("")
    setDomainFilter("all")
    setEvidenceFilter("all")
    setRiskFilter("all")
    setRecordFilter("all")
  }

  function relationshipName(edge: HcuEdge) {
    const sources = edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")
    const targets = edge.targetAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")
    return sources + (edge.sign > 0 ? " → " : " ⊣ ") + targets
  }

  function activateEdge(edgeId: string) {
    setSelection({ kind: "edge", id: edgeId })
    if (view === "matrix") setView("network")
  }

  return <div className="hcu-graph">
    <section className="hcu-analytics-panel" aria-labelledby="hcu-analytics-title">
      <div className="hcu-analytics-heading">
        <div>
          <p className="eyebrow">{english ? "HCU OBSERVATORY / DESCRIPTIVE LAYER" : "OBSERVATORIO HCU / CAPA DESCRIPTIVA"}</p>
          <h3 id="hcu-analytics-title">{english ? "Structure, risk and evidence signals" : "Estructura, riesgo y señales de evidencia"}</h3>
          <p>{english ? "Computed from the current public graph snapshot. Statistics describe declared model inputs and record structure; they are not independent validation." : "Calculado sobre la instantánea actual del grafo público. Las estadísticas describen entradas declaradas y estructura de registros; no constituyen validación independiente."}</p>
        </div>
        <span className="hcu-scope-badge">{english ? "EXPLORATORY · NON-CAUSAL" : "EXPLORATORIO · NO CAUSAL"}</span>
      </div>
      <div className="hcu-analytics-kpis">
        <article><span className="hcu-kpi-icon"><Network aria-hidden="true" /></span><div><small>{english ? "Public domains" : "Dominios públicos"}</small><strong>{analytics.domainCount}</strong><em>{english ? "classification groups" : "grupos de clasificación"}</em></div></article>
        <article><span className="hcu-kpi-icon"><Database aria-hidden="true" /></span><div><small>{english ? "Modeled nodes" : "Nodos modelados"}</small><strong>{analytics.atomCount}</strong><em>{analytics.connectedAtomCount} {english ? "connected" : "conectados"} · {analytics.isolatedAtomCount} {english ? "isolated" : "aislados"}</em></div></article>
        <article><span className="hcu-kpi-icon"><Workflow aria-hidden="true" /></span><div><small>{english ? "Declared hyperedges" : "Hiperaristas declaradas"}</small><strong>{analytics.edgeCount}</strong><em>{analytics.crossDomainEdgeCount} {english ? "cross-domain" : "entre dominios"}</em></div></article>
        <article><span className="hcu-kpi-icon is-risk"><ShieldAlert aria-hidden="true" /></span><div><small>{english ? "Risk ≥ " : "Riesgo ≥ "}{HCU_HIGH_RISK_THRESHOLD}</small><strong>{analytics.highRiskCount}</strong><em>{english ? "declared high-risk nodes" : "nodos con riesgo declarado alto"}</em></div></article>
        <article><span className="hcu-kpi-icon"><Activity aria-hidden="true" /></span><div><small>{english ? "Provisional records" : "Registros provisionales"}</small><strong>{analytics.provisionalCount}</strong><em>{english ? "require documentary progression" : "requieren progresión documental"}</em></div></article>
        <article><span className="hcu-kpi-icon is-quarantine"><SlidersHorizontal aria-hidden="true" /></span><div><small>{english ? "Quarantined nodes" : "Nodos en cuarentena"}</small><strong>{analytics.quarantinedCount}</strong><em>{english ? "excluded from signal transfer" : "excluidos de transmisión de señales"}</em></div></article>
      </div>
      <div className="hcu-analytics-summary">
        <div><span>{english ? "Mean declared influence · X" : "Influencia declarada media · X"}</span><strong>{formatMetric(analytics.meanInfluence)}</strong></div>
        <div><span>{english ? "Mean declared risk · Y" : "Riesgo declarado medio · Y"}</span><strong>{formatMetric(analytics.meanRisk)}</strong></div>
        <div><span>{english ? "Mean declared evidence · Z" : "Evidencia declarada media · Z"}</span><strong>{formatMetric(analytics.meanEvidence)}</strong></div>
        <div><span>{english ? "Relationships with source URL" : "Relaciones con URL de fuente"}</span><strong>{analytics.edgesWithSourceUrl} / {analytics.edgeCount}</strong></div>
      </div>
      {(analytics.invalidParameterAtomCount > 0 || analytics.invalidEdgeCount > 0) && <div className="hcu-data-warning" role="status">
        <ShieldAlert aria-hidden="true" />
        <p>{english ? "Structural data quality notice:" : "Aviso de calidad estructural:"} {analytics.invalidParameterAtomCount ? analytics.invalidParameterAtomCount + (english ? " node(s) have parameters outside the declared 0–100 scale. " : " nodo(s) tienen parámetros fuera de la escala declarada 0–100. ") : ""}{analytics.invalidEdgeCount ? analytics.invalidEdgeCount + (english ? " relationship(s) have empty or unresolved endpoints." : " relación(es) tienen extremos vacíos o sin resolver.") : ""}</p>
      </div>}
      <p className="hcu-analytics-footnote">{english ? "The threshold ≥ 65 is a visualization rule inherited from the graph legend, not a clinical, social, or externally validated risk standard. A source URL is a provenance pointer, not proof that a source supports the relationship." : "El umbral ≥ 65 es una regla visual heredada de la leyenda del grafo, no un estándar clínico, social ni de riesgo validado externamente. Una URL es una referencia de procedencia, no prueba de que la fuente respalde la relación."}</p>
    </section>

    <section className="hcu-explorer" aria-label={english ? "Graph explorer" : "Explorador del grafo"}>
      <div className="hcu-explorer-toolbar">
        <label className="hcu-search-field">
          <Search aria-hidden="true" />
          <span className="sr-only">{english ? "Search nodes and relationships" : "Buscar nodos y relaciones"}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "Search nodes, descriptions, sources…" : "Buscar nodos, descripciones o fuentes…"} />
        </label>
        <label className="hcu-evidence-select" htmlFor="hcu-evidence-filter">
          <span>{english ? "Relationship status" : "Estado de relaciones"}</span>
          <select id="hcu-evidence-filter" value={evidenceFilter} onChange={(event) => setEvidenceFilter(event.target.value as EvidenceFilter)}>
            <option value="all">{english ? "All statuses" : "Todos los estados"}</option>
            <option value="hypothesis">{english ? "Hypotheses" : "Hipótesis"}</option>
            <option value="other">{english ? "Other recorded statuses" : "Otros estados registrados"}</option>
          </select>
        </label>
        <label className="hcu-evidence-select" htmlFor="hcu-risk-filter">
          <span>{english ? "Declared risk" : "Riesgo declarado"}</span>
          <select id="hcu-risk-filter" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskFilter)}>
            <option value="all">{english ? "All risk levels" : "Todos los niveles"}</option>
            <option value="critical">{english ? "High display threshold ≥ 65" : "Umbral visual alto ≥ 65"}</option>
          </select>
        </label>
        <label className="hcu-evidence-select" htmlFor="hcu-record-filter">
          <span>{english ? "Record state" : "Estado del registro"}</span>
          <select id="hcu-record-filter" value={recordFilter} onChange={(event) => setRecordFilter(event.target.value as RecordFilter)}>
            <option value="all">{english ? "All record states" : "Todos los estados"}</option>
            <option value="active">{english ? "Not quarantined" : "Sin cuarentena"}</option>
            <option value="provisional">{english ? "Provisional records" : "Registros provisionales"}</option>
            <option value="quarantined">{english ? "Quarantined records" : "Registros en cuarentena"}</option>
          </select>
        </label>
        <div className="hcu-view-toggle" role="group" aria-label={english ? "Visualization mode" : "Modo de visualización"}>
          <button type="button" className={view === "network" ? "is-active" : ""} aria-pressed={view === "network"} onClick={() => setView("network")}><Network aria-hidden="true" />{english ? "Network" : "Red"}</button>
          <button type="button" className={view === "matrix" ? "is-active" : ""} aria-pressed={view === "matrix"} onClick={() => setView("matrix")}><BarChart3 aria-hidden="true" />{english ? "Matrix" : "Matriz"}</button>
          <button type="button" className={view === "records" ? "is-active" : ""} aria-pressed={view === "records"} onClick={() => setView("records")}><Table2 aria-hidden="true" />{english ? "Records" : "Registros"}</button>
        </div>
      </div>

      <div className="hcu-filter-row">
        <div className="hcu-domain-filters" role="group" aria-label={english ? "Filter by domain" : "Filtrar por dominio"}>
          <button type="button" className={domainFilter === "all" ? "hcu-filter-chip is-active" : "hcu-filter-chip"} aria-pressed={domainFilter === "all"} onClick={() => setDomainFilter("all")}>{english ? "All domains" : "Todos los dominios"}</button>
          {graph.domains.map((domain, index) => <button type="button" key={domain.id} className={domainFilter === domain.id ? "hcu-filter-chip is-active" : "hcu-filter-chip"} style={{ "--domain-color": domainColor(index) } as CSSProperties} aria-pressed={domainFilter === domain.id} onClick={() => setDomainFilter(domain.id)}>{localized(domain.nameEs, domain.nameEn, english)}</button>)}
        </div>
        <div className="hcu-map-links">
          {showLabels && view === "network" && <button type="button" className="hcu-reset-button" onClick={() => setShowLabels(false)}>{english ? "Hide node labels" : "Ocultar etiquetas"}</button>}
          {!showLabels && view === "network" && <button type="button" className="hcu-reset-button" onClick={() => setShowLabels(true)}>{english ? "Show node labels" : "Mostrar etiquetas"}</button>}
          {hasActiveFilters && <button type="button" className="hcu-reset-button" onClick={resetFilters}><RotateCcw aria-hidden="true" />{english ? "Reset filters" : "Limpiar filtros"}</button>}
          <a href="/api/v1/hcu/graph" target="_blank" rel="noopener noreferrer">{english ? "Graph API" : "API del grafo"}<ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>

      <div className="hcu-map-status" aria-live="polite">
        <span><strong>{visibleAtoms.length}</strong> {english ? "of" : "de"} {graph.atoms.length} {english ? "nodes" : "nodos"}</span>
        <span><strong>{visibleEdges.length}</strong> {english ? "of" : "de"} {graph.edges.length} {english ? "relationships" : "relaciones"}</span>
        <span>{english ? "Mean risk" : "Riesgo medio"} <strong>{formatMetric(visibleMeanRisk)}</strong></span>
        <span>{english ? "Mean influence" : "Influencia media"} <strong>{formatMetric(visibleMeanInfluence)}</strong></span>
        <span>{english ? "Mean evidence" : "Evidencia media"} <strong>{formatMetric(visibleMeanEvidence)}</strong></span>
        <span className="hcu-model-note">{english ? "Declared values · exploratory model" : "Valores declarados · modelo exploratorio"}</span>
      </div>

      <div className="hcu-explorer-grid">
        <div className="hcu-map-column">
          {view === "network" ? <div className="hcu-map-panel">
            <p className="hcu-map-scroll-hint">{english ? "On narrow screens, scroll horizontally. Select a node, domain or relationship to inspect its record." : "En pantallas estrechas, desplázate horizontalmente. Selecciona un nodo, dominio o relación para inspeccionar su registro."}</p>
            <div className="hcu-canvas-scroll" role="region" aria-label={english ? "Interactive HCU knowledge network" : "Red de conocimiento HCU interactiva"} tabIndex={0}>
              <svg className="hcu-canvas" viewBox="0 0 1180 760" aria-labelledby="hcu-canvas-title hcu-canvas-description">
                <title id="hcu-canvas-title">{english ? "HCU knowledge network" : "Red de conocimiento HCU"}</title>
                <desc id="hcu-canvas-description">{english ? analytics.domainCount + " domains, " + analytics.atomCount + " nodes and " + analytics.edgeCount + " declared hyperedges. Node outline indicates declared risk; dashed edges indicate hypotheses." : analytics.domainCount + " dominios, " + analytics.atomCount + " nodos y " + analytics.edgeCount + " hiperaristas declaradas. El contorno del nodo indica riesgo declarado; las líneas discontinuas representan hipótesis."}</desc>
                <defs>
                  <pattern id="hcu-observatory-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" className="hcu-svg-grid" /></pattern>
                  <radialGradient id="hcu-observatory-vignette"><stop offset="0%" stopColor="#203a4e" stopOpacity="0.05" /><stop offset="100%" stopColor="#071421" stopOpacity="0.62" /></radialGradient>
                  <marker id="hcu-arrow-positive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#6fd0c6" /></marker>
                  <marker id="hcu-arrow-negative" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#e2a27e" /></marker>
                </defs>
                <rect x="0" y="0" width="1180" height="760" fill="url(#hcu-observatory-grid)" />
                <rect x="0" y="0" width="1180" height="760" fill="url(#hcu-observatory-vignette)" />
                <g className="hcu-map-rings" aria-hidden="true"><ellipse cx={CENTER.x} cy={CENTER.y} rx="154" ry="112" /><ellipse cx={CENTER.x} cy={CENTER.y} rx="252" ry="184" /><ellipse cx={CENTER.x} cy={CENTER.y} rx="348" ry="255" /><line x1="46" y1={CENTER.y} x2="1134" y2={CENTER.y} /><line x1={CENTER.x} y1="28" x2={CENTER.x} y2="732" /></g>
                <g className="hcu-edge-layer">
                  {graph.edges.map((edge, index) => {
                    const start = averagePoint(edge.sourceAtomIds, coordinates.atomPositions)
                    const end = averagePoint(edge.targetAtomIds, coordinates.atomPositions)
                    if (!start || !end) return null
                    const dx = end.x - start.x
                    const dy = end.y - start.y
                    const length = Math.max(Math.hypot(dx, dy), 1)
                    const bend = (index % 2 === 0 ? 1 : -1) * (26 + (index % 5) * 9)
                    const controlX = (start.x + end.x) / 2 - (dy / length) * bend
                    const controlY = (start.y + end.y) / 2 + (dx / length) * bend
                    const path = length < 8 ? "M " + start.x + " " + start.y + " Q " + (start.x + 38) + " " + (start.y - 36) + " " + (end.x + 1) + " " + (end.y + 1) : "M " + start.x + " " + start.y + " Q " + controlX + " " + controlY + " " + end.x + " " + end.y
                    const selected = selection?.kind === "edge" && selection.id === edge.id
                    const relatedToSelection = selection?.kind === "atom" && [...edge.sourceAtomIds, ...edge.targetAtomIds].includes(selection.id)
                    const dimmed = hasActiveFilters && !visibleEdgeIds.has(edge.id)
                    const width = 1 + Math.min(Math.abs(edge.weight), 1) * 2
                    const activate = () => setSelection({ kind: "edge", id: edge.id })
                    return <g key={edge.id} role="button" tabIndex={dimmed ? -1 : 0} aria-hidden={dimmed ? true : undefined} aria-label={(english ? "Relationship: " : "Relación: ") + relationshipName(edge) + ". " + (english ? "Status: " : "Estado: ") + localizedEvidenceStatus(edge.evidenceStatus, english) + "."} aria-pressed={selected} className={"hcu-edge-link" + (selected ? " is-selected" : "") + (dimmed ? " is-dimmed" : "") + (relatedToSelection ? " is-related" : "") + (crossDomain(edge, atomById) ? " is-cross-domain" : "")} onClick={dimmed ? undefined : activate} onKeyDown={(event) => !dimmed && activateOnKeyboard(event, activate)}>
                      <path className="hcu-edge-hit-area" d={path} />
                      <path className={"hcu-edge-stroke " + (edge.sign > 0 ? "is-positive" : "is-negative") + (edge.evidenceStatus.toLowerCase().includes("hypoth") ? " is-hypothesis" : "")} d={path} strokeWidth={width} markerEnd={edge.sign > 0 ? "url(#hcu-arrow-positive)" : "url(#hcu-arrow-negative)"} />
                    </g>
                  })}
                </g>
                <g className="hcu-domain-layer">
                  {graph.domains.map((domain, index) => {
                    const point = coordinates.domainPositions.get(domain.id) ?? CENTER
                    const atoms = coordinates.atomsByDomain.get(domain.id) ?? []
                    const color = domainColor(index)
                    const selected = selection?.kind === "domain" && selection.id === domain.id
                    const dimmed = (domainFilter !== "all" && domain.id !== domainFilter) || (normalizedQuery && !domainMatchesQuery(domain) && !atoms.some(atomMatchesQuery))
                    const name = localized(domain.nameEs, domain.nameEn, english)
                    const shortName = name.length > 24 ? name.slice(0, 22) + "…" : name
                    const activate = () => setSelection({ kind: "domain", id: domain.id })
                    return <g key={domain.id} role="button" tabIndex={dimmed ? -1 : 0} aria-label={(english ? "Domain: " : "Dominio: ") + name + ". " + atoms.length + " " + (english ? "nodes." : "nodos.")} aria-pressed={selected} className={"hcu-domain-node" + (selected ? " is-selected" : "") + (dimmed ? " is-dimmed" : "")} style={{ color, "--domain-color": color } as CSSProperties} onClick={activate} onKeyDown={(event) => !dimmed && activateOnKeyboard(event, activate)}>
                      <circle className="hcu-domain-orbit" cx={point.x} cy={point.y} r="89" />
                      <circle className="hcu-domain-orbit-inner" cx={point.x} cy={point.y} r="74" />
                      <rect className="hcu-domain-label-bg" x={point.x - 91} y={point.y - 112} width="182" height="28" rx="5" />
                      <text className="hcu-domain-label" x={point.x} y={point.y - 94} textAnchor="middle">{shortName}</text>
                      <circle className="hcu-domain-anchor" cx={point.x} cy={point.y} r="19" />
                      <text className="hcu-domain-index" x={point.x} y={point.y + 3} textAnchor="middle">{String(domain.sortOrder).padStart(2, "0")}</text>
                      <text className="hcu-domain-count" x={point.x} y={point.y + 34} textAnchor="middle">{atoms.length + " " + (english ? "nodes" : "nodos")}</text>
                    </g>
                  })}
                </g>
                <g className="hcu-atom-layer">
                  {graph.atoms.map((atom, index) => {
                    const point = coordinates.atomPositions.get(atom.id)
                    if (!point) return null
                    const dIndex = graph.domains.findIndex((domain) => domain.id === atom.domainId)
                    const color = domainColor(dIndex)
                    const selected = selection?.kind === "atom" && selection.id === atom.id
                    const searchMatch = atomMatchesQuery(atom)
                    const dimmed = (domainFilter !== "all" && atom.domainId !== domainFilter) || !visibleAtomIds.has(atom.id) || (normalizedQuery && !searchMatch)
                    const label = localized(atom.nameEs, atom.nameEn, english)
                    const radius = 5.5 + clamp(atom.riskY) * 0.045 + clamp(atom.evidenceZ) * 0.025
                    const riskColor = atom.riskY >= HCU_HIGH_RISK_THRESHOLD ? "#ff9c85" : atom.isQuarantined ? "#e8d17b" : color
                    const showLabel = showLabels || selected
                    const activate = () => setSelection({ kind: "atom", id: atom.id })
                    const aria = label + ". " + (english ? "Influence " : "Influencia ") + atom.influenceX + "; " + (english ? "risk " : "riesgo ") + atom.riskY + "; " + (english ? "declared evidence " : "evidencia declarada ") + atom.evidenceZ + (atom.isProvisional ? (english ? "; provisional" : "; provisional") : "") + (atom.isQuarantined ? (english ? "; quarantined" : "; en cuarentena") : "")
                    return <g key={atom.id} role="button" tabIndex={dimmed ? -1 : 0} aria-hidden={dimmed ? true : undefined} aria-label={aria} aria-pressed={selected} className={"hcu-atom-node" + (selected ? " is-selected" : "") + (dimmed ? " is-dimmed" : "") + (atom.isQuarantined ? " is-quarantined" : "") + (atom.isProvisional ? " is-provisional" : "") + (atom.riskY >= HCU_HIGH_RISK_THRESHOLD ? " is-high-risk" : "")} style={{ color, "--risk-tone": riskColor, "--domain-color": color } as CSSProperties} onClick={activate} onKeyDown={(event) => !dimmed && activateOnKeyboard(event, activate)}>
                      <circle className="hcu-atom-halo" cx={point.x} cy={point.y} r={radius + 7} />
                      <circle className="hcu-atom-dot" cx={point.x} cy={point.y} r={radius} />
                      {atom.isQuarantined && <path className="hcu-quarantine-mark" d={"M " + (point.x - 4) + " " + (point.y - 4) + " L " + (point.x + 4) + " " + (point.y + 4) + " M " + (point.x + 4) + " " + (point.y - 4) + " L " + (point.x - 4) + " " + (point.y + 4)} />}
                      {!showLabels && <text className="hcu-atom-index" x={point.x} y={point.y + 3} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>}
                      {showLabel && <g className="hcu-atom-label-wrap" aria-hidden="true"><rect x={point.x + radius + 7} y={point.y - 15} width={Math.min(170, Math.max(76, label.length * 6.2))} height="23" rx="4" /><text x={point.x + radius + 14} y={point.y} className="hcu-atom-label">{label.length > 25 ? label.slice(0, 24) + "…" : label}</text></g>}
                    </g>
                  })}
                </g>
                <g className="hcu-center-node" aria-hidden="true">
                  <circle cx={CENTER.x} cy={CENTER.y} r="64" />
                  <circle className="hcu-center-ring" cx={CENTER.x} cy={CENTER.y} r="76" />
                  <circle className="hcu-center-ring is-outer" cx={CENTER.x} cy={CENTER.y} r="88" />
                  <text className="hcu-center-title" x={CENTER.x} y={CENTER.y - 5} textAnchor="middle">HCU</text>
                  <text className="hcu-center-caption" x={CENTER.x} y={CENTER.y + 17} textAnchor="middle">{english ? "KNOWLEDGE COMMONS" : "RED DE CONOCIMIENTO"}</text>
                </g>
              </svg>
            </div>
            <div className="hcu-map-legend" aria-label={english ? "Map legend" : "Leyenda del mapa"}>
              <span><i className="hcu-legend-dot" />{english ? "Node / modeled input" : "Nodo / entrada modelada"}</span>
              <span><i className="hcu-legend-dot is-high-risk" />{english ? "Risk ≥ 65" : "Riesgo ≥ 65"}</span>
              <span><i className="hcu-legend-dot is-quarantined" />{english ? "Quarantined" : "En cuarentena"}</span>
              <span><i className="hcu-legend-dot is-provisional" />{english ? "Provisional" : "Provisional"}</span>
              <span><i className="hcu-legend-line is-positive" />{english ? "Positive sign" : "Signo positivo"}</span>
              <span><i className="hcu-legend-line is-negative" />{english ? "Negative sign" : "Signo negativo"}</span>
              <span><i className="hcu-legend-line is-dashed" />{english ? "Hypothesis" : "Hipótesis"}</span>
            </div>
          </div> : view === "matrix" ? <MatrixView atoms={visibleAtoms} domains={graph.domains} selection={selection} english={english} onSelect={(id) => setSelection({ kind: "atom", id })} /> : <div className="hcu-records-view">
            {graph.domains.map((domain, index) => {
              const atoms = visibleAtoms.filter((atom) => atom.domainId === domain.id)
              if (!domainMatchesQuery(domain) && atoms.length === 0 && normalizedQuery) return null
              if (domainFilter !== "all" && domain.id !== domainFilter) return null
              const stats = domainAnalyticsById.get(domain.id)
              return <article className="hcu-domain-card" key={domain.id} style={{ "--domain-color": domainColor(index) } as CSSProperties}>
                <p className="eyebrow">{String(domain.sortOrder).padStart(2, "0")} / {english ? "DOMAIN" : "DOMINIO"}</p>
                <h3>{localized(domain.nameEs, domain.nameEn, english)}</h3>
                <p>{localized(domain.descriptionEs, domain.descriptionEn, english)}</p>
                <div className="hcu-domain-analytics">
                  <span>{english ? "Nodes" : "Nodos"} <strong>{stats?.atomCount ?? atoms.length}</strong></span>
                  <span>{english ? "Mean risk" : "Riesgo medio"} <strong>{formatMetric(stats?.meanRisk ?? null)}</strong></span>
                  <span>{english ? "High risk" : "Riesgo alto"} <strong>{stats?.highRiskCount ?? 0}</strong></span>
                  <span>{english ? "Relationships" : "Relaciones"} <strong>{stats?.incidentEdgeCount ?? 0}</strong></span>
                </div>
                {atoms.length ? <ul className="hcu-atom-list">{atoms.map((atom) => <li key={atom.id}>
                  <button type="button" className="hcu-record-atom" onClick={() => setSelection({ kind: "atom", id: atom.id })}>
                    <strong>{localized(atom.nameEs, atom.nameEn, english)}</strong><span>{localized(atom.descriptionEs, atom.descriptionEn, english)}</span>
                    <span className="hcu-record-scores">{english ? "X Influence" : "X Influencia"} {atom.influenceX} · {english ? "Y Risk" : "Y Riesgo"} {atom.riskY} · {english ? "Z Evidence" : "Z Evidencia"} {atom.evidenceZ}</span>
                    <span className="hcu-record-status">{atom.isQuarantined ? (english ? "QUARANTINED" : "EN CUARENTENA") : atom.isProvisional ? (english ? "PROVISIONAL" : "PROVISIONAL") : (english ? "DECLARED" : "DECLARADO")}</span>
                  </button>
                </li>)}</ul> : <p className="hcu-unmodeled-note">{english ? "Reference domain only; no modeled atoms match the current filters." : "Dominio de referencia; no hay átomos modelados que coincidan con los filtros."}</p>}
              </article>
            })}
          </div>}
        </div>

        <aside className="hcu-inspector" aria-live="polite" aria-label={english ? "Selected map record" : "Registro seleccionado del mapa"}>
          <div className="hcu-inspector-topline"><span>{english ? "RECORD INSPECTOR" : "INSPECTOR DE REGISTRO"}</span><span>HCU / 02</span></div>
          {selectedAtom ? <>
            <p className="hcu-selection-kicker">{english ? "NODE · DECLARED INPUT" : "NODO · ENTRADA DECLARADA"}</p>
            <h3 className="hcu-inspector-title">{localized(selectedAtom.nameEs, selectedAtom.nameEn, english)}</h3>
            <p className="hcu-inspector-copy">{localized(selectedAtom.descriptionEs, selectedAtom.descriptionEn, english)}</p>
            <div className="hcu-status-row">
              <span className="hcu-status-tag">{selectedAtom.isProvisional ? (english ? "Provisional" : "Provisional") : (english ? "Declared" : "Declarado")}</span>
              {selectedAtom.isQuarantined && <span className="hcu-status-tag is-quarantined">{english ? "Quarantined" : "En cuarentena"}</span>}
              {selectedAtom.riskY >= HCU_HIGH_RISK_THRESHOLD && <span className="hcu-status-tag is-high-risk">{english ? "Risk ≥ 65" : "Riesgo ≥ 65"}</span>}
              <span className="hcu-status-tag">{localized(domainById.get(selectedAtom.domainId)?.nameEs ?? "Dominio", domainById.get(selectedAtom.domainId)?.nameEn ?? "Domain", english)}</span>
            </div>
            <div className="hcu-vector-values" aria-label={english ? "Declared X Y Z values" : "Valores declarados X Y Z"}>
              <div><span>X</span><small>{english ? "Influence" : "Influencia"}</small><strong>{selectedAtom.influenceX}</strong></div>
              <div><span>Y</span><small>{english ? "Risk" : "Riesgo"}</small><strong>{selectedAtom.riskY}</strong></div>
              <div><span>Z</span><small>{english ? "Evidence" : "Evidencia"}</small><strong>{selectedAtom.evidenceZ}</strong></div>
            </div>
            <div className="hcu-meters">
              <Meter label={english ? "Influence · X" : "Influencia · X"} value={selectedAtom.influenceX} />
              <Meter label={english ? "Risk · Y" : "Riesgo · Y"} value={selectedAtom.riskY} />
              <Meter label={english ? "Declared evidence · Z" : "Evidencia declarada · Z"} value={selectedAtom.evidenceZ} />
            </div>
            <button type="button" className="button button-copper hcu-scenario-link" onClick={() => onUseAtom(selectedAtom.id)}>{english ? "Use as scenario input" : "Usar en el escenario"}<ArrowUpRight aria-hidden="true" /></button>
            <div className="hcu-related-list">
              <h4>{english ? "Connected relationships" : "Relaciones conectadas"}<span>{selectedAtomEdges.length}</span></h4>
              {selectedAtomEdges.length ? selectedAtomEdges.map((edge) => <button type="button" key={edge.id} className="hcu-related-link" onClick={() => activateEdge(edge.id)}><span>{relationshipName(edge)}</span><small>{localizedEvidenceStatus(edge.evidenceStatus, english)} · {crossDomain(edge, atomById) ? (english ? "cross-domain" : "entre dominios") : (english ? "within-domain" : "intradominio")}</small></button>) : <p>{english ? "No public relationships are connected to this node yet." : "Aún no hay relaciones públicas conectadas a este nodo."}</p>}
            </div>
          </> : selectedEdge ? <>
            <p className="hcu-selection-kicker">{english ? "RELATIONSHIP · HYPEREDGE" : "RELACIÓN · HIPERARISTA"}</p>
            <h3 className="hcu-inspector-title">{relationshipName(selectedEdge)}</h3>
            <p className="hcu-inspector-copy">{english ? "A declared relationship in the public graph. Its direction and status do not establish causation or independent verification." : "Relación declarada en el grafo público. Su dirección y estado no demuestran causalidad ni verificación independiente."}</p>
            <div className="hcu-status-row"><span className="hcu-status-tag">{localizedEvidenceStatus(selectedEdge.evidenceStatus, english)}</span><span className="hcu-status-tag">{crossDomain(selectedEdge, atomById) ? (english ? "Cross-domain" : "Entre dominios") : (english ? "Within-domain" : "Intradominio")}</span></div>
            <dl className="hcu-edge-detail-list">
              <div><dt>{english ? "Declared weight" : "Peso declarado"}</dt><dd>{selectedEdge.weight}</dd></div>
              <div><dt>{english ? "Sign" : "Signo"}</dt><dd>{selectedEdge.sign > 0 ? (english ? "Positive" : "Positivo") : (english ? "Negative" : "Negativo")}</dd></div>
              <div><dt>{english ? "Delay" : "Rezago"}</dt><dd>{selectedEdge.delayYears} {english ? "years" : "años"}</dd></div>
              <div><dt>TQAF</dt><dd>{selectedEdge.tqafLevel ?? "—"}</dd></div>
              <div><dt>{english ? "Sources" : "Orígenes"}</dt><dd>{selectedEdge.sourceAtomIds.length}</dd></div>
              <div><dt>{english ? "Targets" : "Destinos"}</dt><dd>{selectedEdge.targetAtomIds.length}</dd></div>
            </dl>
            <div className="hcu-source-record"><span>{english ? "PROVENANCE" : "PROCEDENCIA"}</span><strong>{selectedEdge.sourceTitle ?? (english ? "No source title recorded" : "Sin título de fuente registrado")}</strong>
              {safeExternalUrl(selectedEdge.sourceUrl) ? <a href={safeExternalUrl(selectedEdge.sourceUrl) ?? undefined} target="_blank" rel="noopener noreferrer">{english ? "Open source" : "Abrir fuente"}<ArrowUpRight aria-hidden="true" /></a> : <p>{english ? "No public HTTP(S) URL is recorded for this relationship." : "No se registró una URL HTTP(S) pública para esta relación."}</p>}
            </div>
          </> : selectedDomain ? <>
            <p className="hcu-selection-kicker">{english ? "DOMAIN · REFERENCE AREA" : "DOMINIO · ÁREA DE REFERENCIA"}</p>
            <h3 className="hcu-inspector-title">{localized(selectedDomain.nameEs, selectedDomain.nameEn, english)}</h3>
            <p className="hcu-inspector-copy">{localized(selectedDomain.descriptionEs, selectedDomain.descriptionEn, english)}</p>
            {(() => {
              const stats = domainAnalyticsById.get(selectedDomain.id)
              return <div className="hcu-domain-summary-grid">
                <div><strong>{stats?.atomCount ?? selectedDomainAtoms.length}</strong><span>{english ? "modeled nodes" : "nodos modelados"}</span></div>
                <div><strong>{formatMetric(stats?.meanRisk ?? null)}</strong><span>{english ? "mean declared risk" : "riesgo declarado medio"}</span></div>
                <div><strong>{stats?.highRiskCount ?? 0}</strong><span>{english ? "risk ≥ 65" : "riesgo ≥ 65"}</span></div>
                <div><strong>{stats?.incidentEdgeCount ?? 0}</strong><span>{english ? "incident relations" : "relaciones incidentes"}</span></div>
              </div>
            })()}
            {selectedDomainAtoms.length ? <div className="hcu-related-list"><h4>{english ? "Nodes in this domain" : "Nodos del dominio"}</h4>{selectedDomainAtoms.map((atom) => <button type="button" key={atom.id} className="hcu-related-link" onClick={() => setSelection({ kind: "atom", id: atom.id })}><span>{localized(atom.nameEs, atom.nameEn, english)}</span><small>{english ? "Risk " : "Riesgo "}{atom.riskY} · {atom.isQuarantined ? (english ? "quarantined" : "en cuarentena") : atom.isProvisional ? (english ? "provisional" : "provisional") : (english ? "declared" : "declarado")}</small></button>)}</div> : <p className="hcu-unmodeled-note">{english ? "This is a documentary reference area. It has no quantified atoms or relationships and is excluded from the simulation." : "Es un área documental de referencia. No contiene átomos cuantificados ni relaciones, y está excluida de la simulación."}</p>}
          </> : <div className="hcu-inspector-empty"><span>HCU</span><p>{english ? "Select a domain, node, or relationship to inspect its definition and provenance." : "Selecciona un dominio, nodo o relación para explorar su definición y procedencia."}</p></div>}
        </aside>
      </div>
    </section>

    <section className="hcu-edges" aria-labelledby="hcu-edges-title">
      <div className="hcu-section-heading hcu-relationships-heading"><div><p className="eyebrow">{english ? "RELATIONSHIP REGISTER" : "REGISTRO DE RELACIONES"}</p><h2 id="hcu-edges-title">{english ? "Trace every declared connection." : "Traza cada conexión declarada."}</h2></div><p>{english ? "Each relationship keeps its sign, weight, delay, evidence state and recorded source. None of these fields alone establishes causality." : "Cada relación conserva signo, peso, rezago, estado de evidencia y fuente registrada. Ninguno de estos campos demuestra causalidad por sí solo."}</p></div>
      {visibleEdges.length ? <div className="hcu-edge-list">{visibleEdges.map((edge) => <article className="hcu-edge-card" key={edge.id}>
        <button type="button" className="hcu-edge-select" onClick={() => { setSelection({ kind: "edge", id: edge.id }); setView("network") }}><span>{relationshipName(edge)}</span><ArrowUpRight aria-hidden="true" /></button>
        <div className="hcu-edge-meta"><span>{english ? "Weight" : "Peso"} {edge.weight}</span><span>{english ? "Delay" : "Rezago"} {edge.delayYears} {english ? "years" : "años"}</span><span>{edge.tqafLevel ?? "TQAF —"}</span><span>{localizedEvidenceStatus(edge.evidenceStatus, english)}</span><span>{crossDomain(edge, atomById) ? (english ? "Cross-domain" : "Entre dominios") : (english ? "Within-domain" : "Intradominio")}</span></div>
        <p>{english ? "Source" : "Fuente"}: {safeExternalUrl(edge.sourceUrl) ? <a href={safeExternalUrl(edge.sourceUrl) ?? undefined} target="_blank" rel="noopener noreferrer">{edge.sourceTitle ?? edge.sourceUrl}<ArrowUpRight aria-hidden="true" /></a> : edge.sourceTitle ?? (english ? "No source URL recorded" : "Sin URL de fuente registrada")}</p>
      </article>)}</div> : <p className="empty-state">{english ? "No public relationships match these filters." : "Ninguna relación pública coincide con estos filtros."}</p>}
      <p className="hcu-trust-note">{english ? "Public means visible in this dataset, not independently verified. Declared values and graph-derived aggregates are descriptive only; no score is a causal finding, validated risk rating, or impact measurement." : "Público significa visible en este conjunto de datos, no verificado independientemente. Los valores declarados y agregados del grafo son descriptivos; ningún puntaje es un hallazgo causal, una clasificación de riesgo validada o una medición de impacto."}</p>
    </section>
  </div>
}
