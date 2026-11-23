"use client"

import { Search, ArrowUpRight } from "lucide-react"
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react"
import type { Locale } from "@/lib/i18n"
import { Hcu3DCanvas } from "@/components/hcu/hcu-3d-canvas"
import { HcuAnalyticsOverview } from "@/components/hcu/hcu-analytics-overview"

type HcuDomain = { id: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; sortOrder: number }
type HcuAtom = { id: string; domainId: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; influenceX: number; riskY: number; evidenceZ: number; isProvisional: boolean; isQuarantined: boolean }
type HcuEdge = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; weight: number; sign: number; delayYears: number; tqafLevel: string | null; evidenceStatus: string; sourceTitle: string | null; sourceUrl: string | null }
export type HcuGraphData = { domains: HcuDomain[]; atoms: HcuAtom[]; edges: HcuEdge[] }
type Point = { x: number; y: number }
type Selection = { kind: "atom" | "domain" | "edge"; id: string }
type EvidenceFilter = "all" | "hypothesis" | "other"
type GraphView = "3d" | "map" | "records"

const MAP_WIDTH = 1000
const MAP_HEIGHT = 680
const CENTER = { x: 500, y: 340 }
const DOMAIN_COLORS = ["#a56848", "#4d756d", "#52718a", "#857254", "#777194"]

function buildMapCoordinates(graph: HcuGraphData) {
  const domainPositions = new Map<string, Point>()
  const atomPositions = new Map<string, Point>()
  const domainCount = Math.max(graph.domains.length, 1)

  graph.domains.forEach((domain, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / domainCount
    domainPositions.set(domain.id, {
      x: CENTER.x + Math.cos(angle) * 310,
      y: CENTER.y + Math.sin(angle) * 220,
    })
  })

  graph.domains.forEach((domain) => {
    const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
    const ringRadius = atoms.length > 8 ? 70 : 52
    atoms.forEach((atom, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(atoms.length, 1)
      const center = domainPositions.get(domain.id) ?? CENTER
      atomPositions.set(atom.id, {
        x: center.x + Math.cos(angle) * ringRadius,
        y: center.y + Math.sin(angle) * ringRadius,
      })
    })
  })

  return { domainPositions, atomPositions }
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
  return status.toLowerCase().includes("hypoth") ? english ? "Hypothesis" : "Hipótesis" : status
}

function Meter({ label, value }: { label: string; value: number }) {
  const boundedValue = Math.min(100, Math.max(0, value))
  return <div className="hcu-meter-row">
    <div className="hcu-meter-label"><span>{label}</span><strong>{value.toFixed(1)}</strong></div>
    <div className="hcu-meter-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={boundedValue}>
      <span style={{ width: `${boundedValue}%` }} />
    </div>
  </div>
}

export function HcuGraph({ graph, locale = "es", onUseAtom }: { graph: HcuGraphData; locale?: Locale; onUseAtom: (id: string) => void }) {
  const english = locale === "en"
  const [query, setQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("all")
  const [view, setView] = useState<GraphView>("3d")
  const [selection, setSelection] = useState<Selection | null>(() => graph.atoms[0] ? { kind: "atom", id: graph.atoms[0].id } : null)
  const coordinates = useMemo(() => buildMapCoordinates(graph), [graph])
  const normalizedQuery = query.trim().toLocaleLowerCase(english ? "en" : "es")
  const domainById = useMemo(() => new Map(graph.domains.map((domain) => [domain.id, domain])), [graph.domains])
  const atomById = useMemo(() => new Map(graph.atoms.map((atom) => [atom.id, atom])), [graph.atoms])
  const atomNames = useMemo(() => new Map(graph.atoms.map((atom) => [atom.id, localized(atom.nameEs, atom.nameEn, english)])), [graph.atoms, english])

  const matchingEdgeIds = useMemo(() => new Set(graph.edges.filter((edge) => {
    if (!normalizedQuery) return false
    const searchText = [edge.id, edge.evidenceStatus, localizedEvidenceStatus(edge.evidenceStatus, english), edge.sourceTitle ?? "", edge.tqafLevel ?? "", ...edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id), ...edge.targetAtomIds.map((id) => atomNames.get(id) ?? id)].join(" ").toLocaleLowerCase(english ? "en" : "es")
    return searchText.includes(normalizedQuery)
  }).map((edge) => edge.id)), [graph.edges, atomNames, english, normalizedQuery])
  const matchingEdgeAtomIds = useMemo(() => new Set(graph.edges.filter((edge) => matchingEdgeIds.has(edge.id)).flatMap((edge) => [...edge.sourceAtomIds, ...edge.targetAtomIds])), [graph.edges, matchingEdgeIds])

  const atomMatchesQuery = (atom: HcuAtom) => {
    if (!normalizedQuery) return true
    const domain = domainById.get(atom.domainId)
    const searchableText = [atom.nameEs, atom.nameEn, atom.descriptionEs, atom.descriptionEn, domain?.nameEs ?? "", domain?.nameEn ?? "", domain?.descriptionEs ?? "", domain?.descriptionEn ?? ""].join(" ").toLocaleLowerCase(english ? "en" : "es")
    return searchableText.includes(normalizedQuery) || matchingEdgeAtomIds.has(atom.id)
  }
  const domainMatchesQuery = (domain: HcuDomain) => !normalizedQuery || [domain.nameEs, domain.nameEn, domain.descriptionEs, domain.descriptionEn].join(" ").toLocaleLowerCase(english ? "en" : "es").includes(normalizedQuery)
  const edgeMatchesEvidence = (edge: HcuEdge) => evidenceFilter === "all" || (evidenceFilter === "hypothesis" ? edge.evidenceStatus.toLowerCase().includes("hypoth") : !edge.evidenceStatus.toLowerCase().includes("hypoth"))
  const visibleAtoms = graph.atoms.filter((atom) => (domainFilter === "all" || atom.domainId === domainFilter) && atomMatchesQuery(atom))
  const visibleAtomIds = new Set(visibleAtoms.map((atom) => atom.id))
  const visibleEdges = graph.edges.filter((edge) => {
    const inDomain = domainFilter === "all" || [...edge.sourceAtomIds, ...edge.targetAtomIds].some((id) => atomById.get(id)?.domainId === domainFilter)
    const inSearch = !normalizedQuery || matchingEdgeIds.has(edge.id) || [...edge.sourceAtomIds, ...edge.targetAtomIds].some((id) => visibleAtomIds.has(id))
    return edgeMatchesEvidence(edge) && inDomain && inSearch
  })
  const visibleEdgeIds = new Set(visibleEdges.map((edge) => edge.id))
  const selectedAtom = selection?.kind === "atom" ? atomById.get(selection.id) : undefined
  const selectedDomain = selection?.kind === "domain" ? domainById.get(selection.id) : undefined
  const selectedEdge = selection?.kind === "edge" ? graph.edges.find((edge) => edge.id === selection.id) : undefined
  const selectedDomainAtoms = selectedDomain ? graph.atoms.filter((atom) => atom.domainId === selectedDomain.id) : []
  const selectedAtomEdges = selectedAtom ? graph.edges.filter((edge) => edge.sourceAtomIds.includes(selectedAtom.id) || edge.targetAtomIds.includes(selectedAtom.id)) : []
  const hasActiveFilters = Boolean(normalizedQuery) || domainFilter !== "all" || evidenceFilter !== "all"

  function resetFilters() {
    setQuery("")
    setDomainFilter("all")
    setEvidenceFilter("all")
  }

  function relationshipName(edge: HcuEdge) {
    const sources = edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")
    const targets = edge.targetAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")
    return `${sources} ${edge.sign > 0 ? "→" : "⊣"} ${targets}`
  }

  return <div className="hcu-graph">
    <HcuAnalyticsOverview graph={graph} locale={locale} onSelectDomain={(id) => { setDomainFilter(id); setSelection({ kind: "domain", id }); setView("3d") }} />
    <div className="hcu-explorer-toolbar">
      <label className="hcu-search-field">
        <Search aria-hidden="true" />
        <span className="sr-only">{english ? "Search nodes and relationships" : "Buscar nodos y relaciones"}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "Search topics, nodes, sources…" : "Buscar temas, nodos o fuentes…"} />
      </label>
      <label className="hcu-evidence-select" htmlFor="hcu-evidence-filter">
        <span>{english ? "Relationship status" : "Estado de relaciones"}</span>
        <select id="hcu-evidence-filter" value={evidenceFilter} onChange={(event) => setEvidenceFilter(event.target.value as EvidenceFilter)}>
          <option value="all">{english ? "All statuses" : "Todos los estados"}</option>
          <option value="hypothesis">{english ? "Hypotheses" : "Hipótesis"}</option>
          <option value="other">{english ? "Other recorded statuses" : "Otros estados registrados"}</option>
        </select>
      </label>
      <div className="hcu-view-toggle" role="group" aria-label={english ? "Visualization mode" : "Modo de visualización"}>
        <button type="button" className={view === "3d" ? "is-active" : ""} aria-pressed={view === "3d"} onClick={() => setView("3d")}>{english ? "3D field" : "Campo 3D"}</button>
        <button type="button" className={view === "map" ? "is-active" : ""} aria-pressed={view === "map"} onClick={() => setView("map")}>{english ? "2D scheme" : "Esquema 2D"}</button>
        <button type="button" className={view === "records" ? "is-active" : ""} aria-pressed={view === "records"} onClick={() => setView("records")}>{english ? "Records" : "Registros"}</button>
      </div>
    </div>

    <div className="hcu-filter-row">
      <div className="hcu-domain-filters" role="group" aria-label={english ? "Filter by domain" : "Filtrar por dominio"}>
        <button type="button" className={domainFilter === "all" ? "hcu-filter-chip is-active" : "hcu-filter-chip"} aria-pressed={domainFilter === "all"} onClick={() => setDomainFilter("all")}>{english ? "All domains" : "Todos los dominios"}</button>
        {graph.domains.map((domain, index) => <button type="button" key={domain.id} className={domainFilter === domain.id ? "hcu-filter-chip is-active" : "hcu-filter-chip"} style={{ "--domain-color": DOMAIN_COLORS[index % DOMAIN_COLORS.length] } as CSSProperties} aria-pressed={domainFilter === domain.id} onClick={() => setDomainFilter(domain.id)}>{localized(domain.nameEs, domain.nameEn, english)}</button>)}
      </div>
      <div className="hcu-map-links">
        {hasActiveFilters && <button type="button" className="hcu-reset-button" onClick={resetFilters}>{english ? "Reset filters" : "Limpiar filtros"}</button>}
        <a href="/api/v1/hcu/graph" target="_blank" rel="noopener noreferrer">{english ? "Public graph API" : "API pública del grafo"}<ArrowUpRight aria-hidden="true" /></a>
      </div>
    </div>

    <div className="hcu-map-status" aria-live="polite">
      <span><strong>{visibleAtoms.length}</strong> {english ? "of" : "de"} {graph.atoms.length} {english ? "nodes" : "nodos"}</span>
      <span><strong>{visibleEdges.length}</strong> {english ? "of" : "de"} {graph.edges.length} {english ? "relationships" : "relaciones"}</span>
      <span className="hcu-model-note">{english ? "Declared values · exploratory model" : "Valores declarados · modelo exploratorio"}</span>
    </div>

    <div className="hcu-explorer-grid">
      <div className="hcu-map-column">
        {view === "3d" ? <Hcu3DCanvas graph={graph} visibleAtomIds={[...visibleAtomIds]} visibleEdgeIds={[...visibleEdgeIds]} selection={selection} locale={locale} onSelect={setSelection} /> : view === "map" ? <div className="hcu-map-panel">
          <p className="hcu-map-scroll-hint">{english ? "Swipe horizontally to explore every domain and relationship." : "Desliza horizontalmente para recorrer todos los dominios y relaciones."}</p>
          <div className="hcu-canvas-scroll" role="region" aria-label={english ? "Interactive HCU knowledge map; scroll horizontally on small screens" : "Mapa interactivo de conocimiento HCU; desplázate horizontalmente en pantallas pequeñas"} tabIndex={0}>
            <svg className="hcu-canvas" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-labelledby="hcu-canvas-title hcu-canvas-description">
              <title id="hcu-canvas-title">{english ? "HCU knowledge network" : "Red de conocimiento HCU"}</title>
              <desc id="hcu-canvas-description">{english ? `${graph.domains.length} domains, ${graph.atoms.length} nodes and ${graph.edges.length} declared relationships. Select a node, domain, or line to inspect it.` : `${graph.domains.length} dominios, ${graph.atoms.length} nodos y ${graph.edges.length} relaciones declaradas. Selecciona un nodo, dominio o línea para explorarlo.`}</desc>
              <defs>
                <marker id="hcu-arrow-positive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#4d756d" /></marker>
                <marker id="hcu-arrow-negative" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#a56848" /></marker>
              </defs>
              <g className="hcu-map-rings" aria-hidden="true"><circle cx={CENTER.x} cy={CENTER.y} r="156" /><circle cx={CENTER.x} cy={CENTER.y} r="246" /><circle cx={CENTER.x} cy={CENTER.y} r="326" /></g>
              <g className="hcu-edge-layer">
                {graph.edges.map((edge, index) => {
                  const start = averagePoint(edge.sourceAtomIds, coordinates.atomPositions)
                  const end = averagePoint(edge.targetAtomIds, coordinates.atomPositions)
                  if (!start || !end) return null
                  const dx = end.x - start.x
                  const dy = end.y - start.y
                  const length = Math.max(Math.hypot(dx, dy), 1)
                  const bend = (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 7)
                  const controlX = (start.x + end.x) / 2 - (dy / length) * bend
                  const controlY = (start.y + end.y) / 2 + (dx / length) * bend
                  const path = length < 8 ? `M ${start.x} ${start.y} Q ${start.x + 38} ${start.y - 36} ${end.x + 1} ${end.y + 1}` : `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`
                  const selected = selection?.kind === "edge" && selection.id === edge.id
                  const relatedToSelection = selection?.kind === "atom" && [...edge.sourceAtomIds, ...edge.targetAtomIds].includes(selection.id)
                  const dimmed = hasActiveFilters && !visibleEdgeIds.has(edge.id)
                  const width = 1.25 + Math.min(Math.abs(edge.weight), 1) * 2.2
                  const activate = () => setSelection({ kind: "edge", id: edge.id })
                  return <g key={edge.id} role="button" tabIndex={dimmed ? -1 : 0} aria-hidden={dimmed ? true : undefined} aria-label={`${english ? "Relationship" : "Relación"}: ${relationshipName(edge)}. ${english ? "Status" : "Estado"}: ${localizedEvidenceStatus(edge.evidenceStatus, english)}.`} aria-pressed={selected} className={`hcu-edge-link${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}${relatedToSelection ? " is-related" : ""}`} onClick={dimmed ? undefined : activate} onKeyDown={(event) => !dimmed && activateOnKeyboard(event, activate)}>
                    <path className="hcu-edge-hit-area" d={path} />
                    <path className={`hcu-edge-stroke ${edge.sign > 0 ? "is-positive" : "is-negative"}${edge.evidenceStatus.toLowerCase().includes("hypoth") ? " is-hypothesis" : ""}`} d={path} strokeWidth={width} markerEnd={edge.sign > 0 ? "url(#hcu-arrow-positive)" : "url(#hcu-arrow-negative)"} />
                  </g>
                })}
              </g>
              <g className="hcu-domain-layer">
                {graph.domains.map((domain, index) => {
                  const point = coordinates.domainPositions.get(domain.id) ?? CENTER
                  const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
                  const color = DOMAIN_COLORS[index % DOMAIN_COLORS.length]
                  const selected = selection?.kind === "domain" && selection.id === domain.id
                  const dimmed = (domainFilter !== "all" && domain.id !== domainFilter) || (normalizedQuery && !domainMatchesQuery(domain) && !atoms.some(atomMatchesQuery))
                  const name = localized(domain.nameEs, domain.nameEn, english)
                  const shortName = name.length > 20 ? `${name.slice(0, 19)}…` : name
                  const activate = () => setSelection({ kind: "domain", id: domain.id })
                  return <g key={domain.id} role="button" tabIndex={0} aria-label={`${english ? "Domain" : "Dominio"}: ${name}. ${atoms.length} ${english ? "nodes" : "nodos"}.`} aria-pressed={selected} className={`hcu-domain-node${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}`} style={{ color }} onClick={activate} onKeyDown={(event) => activateOnKeyboard(event, activate)}>
                    <circle className="hcu-domain-orbit" cx={point.x} cy={point.y} r="86" />
                    <rect className="hcu-domain-label-bg" x={point.x - 75} y={point.y - 103} width="150" height="25" rx="4" />
                    <text className="hcu-domain-label" x={point.x} y={point.y - 87} textAnchor="middle">{shortName}</text>
                    <circle className="hcu-domain-anchor" cx={point.x} cy={point.y} r="19" />
                    <text className="hcu-domain-index" x={point.x} y={point.y + 3} textAnchor="middle">{String(domain.sortOrder).padStart(2, "0")}</text>
                    <text className="hcu-domain-count" x={point.x} y={point.y + 35} textAnchor="middle">{atoms.length ? `${atoms.length} ${english ? "nodes" : "nodos"}` : english ? "reference only" : "solo referencia"}</text>
                  </g>
                })}
              </g>
              <g className="hcu-atom-layer">
                {graph.atoms.map((atom, index) => {
                  const point = coordinates.atomPositions.get(atom.id)
                  if (!point) return null
                  const domainIndex = graph.domains.findIndex((domain) => domain.id === atom.domainId)
                  const color = DOMAIN_COLORS[Math.max(domainIndex, 0) % DOMAIN_COLORS.length]
                  const selected = selection?.kind === "atom" && selection.id === atom.id
                  const searchMatch = atomMatchesQuery(atom)
                  const dimmed = (domainFilter !== "all" && atom.domainId !== domainFilter) || (normalizedQuery && !searchMatch)
                  const label = localized(atom.nameEs, atom.nameEn, english)
                  const activate = () => setSelection({ kind: "atom", id: atom.id })
                  return <g key={atom.id} role="button" tabIndex={0} aria-label={`${label}. ${english ? "Influence" : "Influencia"} ${atom.influenceX}; ${english ? "risk" : "riesgo"} ${atom.riskY}; ${english ? "evidence" : "evidencia"} ${atom.evidenceZ}${atom.isProvisional ? `; ${english ? "provisional" : "provisional"}` : ""}${atom.isQuarantined ? `; ${english ? "quarantined" : "en cuarentena"}` : ""}.`} aria-pressed={selected} className={`hcu-atom-node${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}${atom.isQuarantined ? " is-quarantined" : ""}`} style={{ color, "--risk-tone": atom.riskY >= 65 ? "#a56848" : "#4d756d" } as CSSProperties} onClick={activate} onKeyDown={(event) => activateOnKeyboard(event, activate)}>
                    <circle className="hcu-atom-halo" cx={point.x} cy={point.y} r="18" />
                    <circle className="hcu-atom-dot" cx={point.x} cy={point.y} r="12" />
                    <text className="hcu-atom-index" x={point.x} y={point.y + 3} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
                  </g>
                })}
              </g>
              <g className="hcu-center-node" aria-hidden="true">
                <circle cx={CENTER.x} cy={CENTER.y} r="61" />
                <circle className="hcu-center-ring" cx={CENTER.x} cy={CENTER.y} r="72" />
                <text className="hcu-center-title" x={CENTER.x} y={CENTER.y - 5} textAnchor="middle">HCU</text>
                <text className="hcu-center-caption" x={CENTER.x} y={CENTER.y + 16} textAnchor="middle">{english ? "KNOWLEDGE COMMONS" : "RED DE CONOCIMIENTO"}</text>
              </g>
            </svg>
          </div>
          <div className="hcu-map-legend" aria-label={english ? "Map legend" : "Leyenda del mapa"}>
            <span><i className="hcu-legend-dot" />{english ? "Atom / modeled input" : "Átomo / entrada del modelo"}</span>
            <span><i className="hcu-legend-dot is-high-risk" />{english ? "Declared risk ≥ 65" : "Riesgo declarado ≥ 65"}</span>
            <span><i className="hcu-legend-line is-positive" />{english ? "Positive influence" : "Influencia positiva"}</span>
            <span><i className="hcu-legend-line is-negative" />{english ? "Negative influence" : "Influencia negativa"}</span>
            <span><i className="hcu-legend-line is-dashed" />{english ? "Hypothesized relationship" : "Relación hipotética"}</span>
          </div>
        </div> : <div className="hcu-records-view">
          {graph.domains.map((domain, index) => {
            const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id && (domainFilter === "all" || domainFilter === domain.id) && atomMatchesQuery(atom))
            if (!domainMatchesQuery(domain) && atoms.length === 0 && normalizedQuery) return null
            if (domainFilter !== "all" && domain.id !== domainFilter) return null
            return <article className="hcu-domain-card" key={domain.id} style={{ "--domain-color": DOMAIN_COLORS[index % DOMAIN_COLORS.length] } as CSSProperties}>
              <p className="eyebrow">{String(domain.sortOrder).padStart(2, "0")} / {english ? "DOMAIN" : "DOMINIO"}</p>
              <h3>{localized(domain.nameEs, domain.nameEn, english)}</h3>
              <p>{localized(domain.descriptionEs, domain.descriptionEn, english)}</p>
              {atoms.length ? <ul className="hcu-atom-list">{atoms.map((atom) => <li key={atom.id}>
                <button type="button" className="hcu-record-atom" onClick={() => setSelection({ kind: "atom", id: atom.id })}>
                  <strong>{localized(atom.nameEs, atom.nameEn, english)}</strong><span>{localized(atom.descriptionEs, atom.descriptionEn, english)}</span>
                  <span className="hcu-record-scores">{english ? "Influence" : "Influencia"} {atom.influenceX} · {english ? "Risk" : "Riesgo"} {atom.riskY} · {english ? "Evidence" : "Evidencia"} {atom.evidenceZ}</span>
                </button>
              </li>)}</ul> : <p className="hcu-unmodeled-note">{english ? "Reference domain only; no modeled atoms or relationships yet." : "Dominio de referencia; aún no tiene átomos ni relaciones modeladas."}</p>}
            </article>
          })}
        </div>}
      </div>

      <aside className="hcu-inspector" aria-live="polite" aria-label={english ? "Selected map record" : "Registro seleccionado del mapa"}>
        <div className="hcu-inspector-topline"><span>{english ? "INSPECTOR" : "INSPECTOR"}</span><span>HCU / 01</span></div>
        {selectedAtom ? <>
          <p className="hcu-selection-kicker">{english ? "NODE · DECLARED INPUT" : "NODO · ENTRADA DECLARADA"}</p>
          <h3 className="hcu-inspector-title">{localized(selectedAtom.nameEs, selectedAtom.nameEn, english)}</h3>
          <p className="hcu-inspector-copy">{localized(selectedAtom.descriptionEs, selectedAtom.descriptionEn, english)}</p>
          <div className="hcu-status-row">
            <span className="hcu-status-tag">{selectedAtom.isProvisional ? english ? "Provisional" : "Provisional" : english ? "Declared" : "Declarado"}</span>
            {selectedAtom.isQuarantined && <span className="hcu-status-tag is-quarantined">{english ? "Quarantined" : "En cuarentena"}</span>}
            <span className="hcu-status-tag">{localized(domainById.get(selectedAtom.domainId)?.nameEs ?? "Dominio", domainById.get(selectedAtom.domainId)?.nameEn ?? "Domain", english)}</span>
          </div>
          <div className="hcu-meters">
            <Meter label={english ? "Influence" : "Influencia"} value={selectedAtom.influenceX} />
            <Meter label={english ? "Risk" : "Riesgo"} value={selectedAtom.riskY} />
            <Meter label={english ? "Declared evidence" : "Evidencia declarada"} value={selectedAtom.evidenceZ} />
          </div>
          <button type="button" className="button button-copper hcu-scenario-link" onClick={() => onUseAtom(selectedAtom.id)}>{english ? "Use as scenario input" : "Usar en el escenario"}<ArrowUpRight aria-hidden="true" /></button>
          <div className="hcu-related-list">
            <h4>{english ? "Related relationships" : "Relaciones relacionadas"}<span>{selectedAtomEdges.length}</span></h4>
            {selectedAtomEdges.length ? selectedAtomEdges.map((edge) => <button type="button" key={edge.id} className="hcu-related-link" onClick={() => setSelection({ kind: "edge", id: edge.id })}><span>{relationshipName(edge)}</span><small>{localizedEvidenceStatus(edge.evidenceStatus, english)}</small></button>) : <p>{english ? "No public relationships are connected to this node yet." : "Aún no hay relaciones públicas conectadas a este nodo."}</p>}
          </div>
        </> : selectedEdge ? <>
          <p className="hcu-selection-kicker">{english ? "RELATIONSHIP · HYPEREDGE" : "RELACIÓN · HIPERARISTA"}</p>
          <h3 className="hcu-inspector-title">{relationshipName(selectedEdge)}</h3>
          <p className="hcu-inspector-copy">{english ? "A declared relationship in the public graph. Its direction and status do not establish causation or independent verification." : "Relación declarada en el grafo público. Su dirección y estado no demuestran causalidad ni verificación independiente."}</p>
          <dl className="hcu-edge-detail-list">
            <div><dt>{english ? "Status" : "Estado"}</dt><dd>{localizedEvidenceStatus(selectedEdge.evidenceStatus, english)}</dd></div>
            <div><dt>{english ? "Weight" : "Peso"}</dt><dd>{selectedEdge.weight}</dd></div>
            <div><dt>{english ? "Direction" : "Dirección"}</dt><dd>{selectedEdge.sign > 0 ? english ? "Positive" : "Positiva" : english ? "Negative" : "Negativa"}</dd></div>
            <div><dt>{english ? "Delay" : "Rezago"}</dt><dd>{selectedEdge.delayYears} {english ? "years" : "años"}</dd></div>
            <div><dt>TQAF</dt><dd>{selectedEdge.tqafLevel ?? "—"}</dd></div>
          </dl>
          <div className="hcu-source-record"><span>{english ? "PROVENANCE" : "PROCEDENCIA"}</span><strong>{selectedEdge.sourceTitle ?? (english ? "No source title recorded" : "Sin título de fuente registrado")}</strong>
            {safeExternalUrl(selectedEdge.sourceUrl) ? <a href={safeExternalUrl(selectedEdge.sourceUrl) ?? undefined} target="_blank" rel="noopener noreferrer">{english ? "Open source" : "Abrir fuente"}<ArrowUpRight aria-hidden="true" /></a> : <p>{english ? "No public URL is recorded for this relationship." : "No se registró una URL pública para esta relación."}</p>}
          </div>
        </> : selectedDomain ? <>
          <p className="hcu-selection-kicker">{english ? "DOMAIN · REFERENCE AREA" : "DOMINIO · ÁREA DE REFERENCIA"}</p>
          <h3 className="hcu-inspector-title">{localized(selectedDomain.nameEs, selectedDomain.nameEn, english)}</h3>
          <p className="hcu-inspector-copy">{localized(selectedDomain.descriptionEs, selectedDomain.descriptionEn, english)}</p>
          <div className="hcu-domain-summary"><strong>{selectedDomainAtoms.length.toString().padStart(2, "0")}</strong><span>{english ? "modeled atoms" : "átomos modelados"}</span></div>
          {selectedDomainAtoms.length ? <div className="hcu-related-list"><h4>{english ? "Nodes in this domain" : "Nodos de este dominio"}</h4>{selectedDomainAtoms.map((atom) => <button type="button" key={atom.id} className="hcu-related-link" onClick={() => setSelection({ kind: "atom", id: atom.id })}><span>{localized(atom.nameEs, atom.nameEn, english)}</span><small>{english ? "Inspect node" : "Explorar nodo"}</small></button>)}</div> : <p className="hcu-unmodeled-note">{english ? "This is a documentary reference area. It has no quantified atoms or relationships and is excluded from the simulation." : "Es un área documental de referencia. No contiene átomos cuantificados ni relaciones, y está excluida de la simulación."}</p>}
        </> : <div className="hcu-inspector-empty"><span>HCU</span><p>{english ? "Select a domain, node, or relationship to inspect its definition and provenance." : "Selecciona un dominio, nodo o relación para explorar su definición y procedencia."}</p></div>}
      </aside>
    </div>

    <section className="hcu-edges" aria-labelledby="hcu-edges-title">
      <div className="hcu-section-heading hcu-relationships-heading"><div><p className="eyebrow">{english ? "RELATIONSHIP REGISTER" : "REGISTRO DE RELACIONES"}</p><h2 id="hcu-edges-title">{english ? "Trace the connections." : "Sigue cada conexión."}</h2></div><p>{english ? "Every public edge retains its declared status, sign, weight, delay and source details." : "Cada arista pública conserva su estado declarado, signo, peso, rezago y datos de procedencia."}</p></div>
      {visibleEdges.length ? <div className="hcu-edge-list">{visibleEdges.map((edge) => <article className="hcu-edge-card" key={edge.id}>
        <button type="button" className="hcu-edge-select" onClick={() => { setSelection({ kind: "edge", id: edge.id }); setView("map") }}><span>{relationshipName(edge)}</span><ArrowUpRight aria-hidden="true" /></button>
        <div className="hcu-edge-meta"><span>{english ? "Weight" : "Peso"} {edge.weight}</span><span>{english ? "Delay" : "Rezago"} {edge.delayYears} {english ? "years" : "años"}</span><span>{edge.tqafLevel ?? "TQAF —"}</span><span>{localizedEvidenceStatus(edge.evidenceStatus, english)}</span></div>
        <p>{english ? "Source" : "Fuente"}: {safeExternalUrl(edge.sourceUrl) ? <a href={safeExternalUrl(edge.sourceUrl) ?? undefined} target="_blank" rel="noopener noreferrer">{edge.sourceTitle ?? edge.sourceUrl}<ArrowUpRight aria-hidden="true" /></a> : edge.sourceTitle ?? (english ? "No source recorded" : "Sin fuente registrada")}</p>
      </article>)}</div> : <p className="empty-state">{english ? "No public relationships match these filters." : "Ninguna relación pública coincide con estos filtros."}</p>}
      <p className="hcu-trust-note">{english ? "Public means visible in this dataset, not independently verified. Model values are declared inputs; no score is a causal finding or impact measurement." : "Público significa visible en este conjunto de datos, no verificado independientemente. Los valores del modelo son entradas declaradas; ningún puntaje es un hallazgo causal o una medición de impacto."}</p>
    </section>
  </div>
}
