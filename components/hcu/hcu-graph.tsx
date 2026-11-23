"use client"

import { useMemo, useState, type KeyboardEvent } from "react"
import type { Locale } from "@/lib/i18n"

type Domain = { id: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; sortOrder: number }
type Atom = { id: string; domainId: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; influenceX: number; riskY: number; evidenceZ: number; isProvisional: boolean; isQuarantined: boolean }
type Edge = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; weight: number; sign: number; delayYears: number; tqafLevel: string | null; evidenceStatus: string; sourceTitle: string | null; sourceUrl: string | null }
type Point = { x: number; y: number }
type Layer = "domain" | "risk" | "evidence" | "connections" | "sources" | "uncertainty"

const layerLabels: Record<Layer, [string, string]> = {
  domain: ["Dominio", "Domain"],
  risk: ["Riesgo", "Risk"],
  evidence: ["Evidencia", "Evidence"],
  connections: ["Conexiones", "Connectivity"],
  sources: ["Fuentes citadas", "Cited sources"],
  uncertainty: ["Incertidumbre", "Uncertainty"],
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function averagePoint(points: Point[]) {
  return points.reduce((value, point) => ({ x: value.x + point.x / points.length, y: value.y + point.y / points.length }), { x: 0, y: 0 })
}

function shortLabel(value: string, maxLength = 22) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

export function HcuGraph({ graph, locale = "es" }: { graph: { domains: Domain[]; atoms: Atom[]; edges: Edge[] }; locale?: Locale }) {
  const english = locale === "en"
  const [layer, setLayer] = useState<Layer>("domain")
  const [referenceYear, setReferenceYear] = useState(2032)
  const [selectedId, setSelectedId] = useState(graph.atoms[0]?.id ?? "")
  const [query, setQuery] = useState("")
  const atomNames = useMemo(() => new Map(graph.atoms.map((atom) => [atom.id, english ? atom.nameEn : atom.nameEs])), [graph.atoms, english])
  const positions = useMemo(() => {
    const domainPoints = new Map<string, Point>()
    const atomPoints = new Map<string, Point>()
    const domains = [...graph.domains].sort((left, right) => left.sortOrder - right.sortOrder)
    const cx = 500
    const cy = 320
    domains.forEach((domain, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, domains.length) - Math.PI / 2
      const center = { x: cx + Math.cos(angle) * 350, y: cy + Math.sin(angle) * 215 }
      domainPoints.set(domain.id, center)
      const members = graph.atoms.filter((atom) => atom.domainId === domain.id)
      members.forEach((atom, atomIndex) => {
        const atomAngle = (Math.PI * 2 * atomIndex) / Math.max(1, members.length) + index * 0.41
        const radius = members.length === 1 ? 66 : 60 + Math.max(0, members.length - 4) * 5
        atomPoints.set(atom.id, { x: center.x + Math.cos(atomAngle) * radius, y: center.y + Math.sin(atomAngle) * radius })
      })
    })
    return { domains: domainPoints, atoms: atomPoints }
  }, [graph.domains, graph.atoms])
  const selectedAtom = graph.atoms.find((atom) => atom.id === selectedId) ?? graph.atoms[0]
  const selectedDomain = selectedAtom ? graph.domains.find((domain) => domain.id === selectedAtom.domainId) : undefined
  const selectedUncertainty = selectedAtom ? Math.min(1, Math.max(0, 0.1 + 0.5 * (1 - selectedAtom.evidenceZ / 100) + 0.012 * (referenceYear - 2026))) : 0
  const relatedEdges = selectedAtom ? graph.edges.filter((edge) => edge.sourceAtomIds.includes(selectedAtom.id) || edge.targetAtomIds.includes(selectedAtom.id)) : []
  const terms = query.split("+").map((term) => normalize(term.trim())).filter(Boolean)
  const searchResults = terms.length
    ? graph.atoms.filter((atom) => {
        const domain = graph.domains.find((candidate) => candidate.id === atom.domainId)
        const text = normalize([atom.nameEs, atom.nameEn, atom.descriptionEs, atom.descriptionEn, domain?.nameEs, domain?.nameEn].join(" "))
        return terms.every((term) => text.includes(term))
      }).slice(0, 8)
    : []

  function selectWithKeyboard(event: KeyboardEvent<SVGGElement>, atomId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setSelectedId(atomId)
    }
  }

  function atomFill(atom: Atom) {
    if (layer === "risk") return `rgba(166, 94, 61, ${Math.max(0.18, atom.riskY / 100)})`
    if (layer === "evidence") return `rgba(34, 61, 78, ${Math.max(0.18, atom.evidenceZ / 100)})`
    if (layer === "uncertainty") {
      const uncertainty = Math.min(1, Math.max(0, 0.1 + 0.5 * (1 - atom.evidenceZ / 100) + 0.012 * (referenceYear - 2026)))
      return `rgba(166, 94, 61, ${Math.max(0.18, uncertainty)})`
    }
    if (layer === "connections") {
      const degree = graph.edges.filter((edge) => edge.sourceAtomIds.includes(atom.id) || edge.targetAtomIds.includes(atom.id)).length
      return `rgba(34, 61, 78, ${Math.min(1, 0.2 + degree * 0.16)})`
    }
    return "rgba(34, 61, 78, 0.82)"
  }

  return (
    <div className="hcu-graph">
      <div className="hcu-graph-toolbar">
        <div>
          <p className="eyebrow">{english ? "GRAPH LAYERS" : "CAPAS DEL GRAFO"}</p>
          <p>{english ? "Choose a view; values remain declared inputs." : "Elige una lectura; los valores siguen siendo entradas declaradas."}</p>
        </div>
        <div className="hcu-layer-switch" role="group" aria-label={english ? "Graph display layer" : "Capa de visualización del grafo"}>
          {(Object.keys(layerLabels) as Layer[]).map((option) => (
            <button key={option} type="button" aria-pressed={layer === option} onClick={() => setLayer(option)}>{english ? layerLabels[option][1] : layerLabels[option][0]}</button>
          ))}
        </div>
      </div>

      <div className="hcu-year-control">
        <label htmlFor="hcu-reference-year">{english ? "Reference year for uncertainty metrics" : "Año de referencia para métricas de incertidumbre"}<span>{referenceYear}</span></label>
        <input id="hcu-reference-year" type="range" min={2026} max={2050} step={1} value={referenceYear} onChange={(event) => setReferenceYear(Number(event.target.value))} />
        <p>{english ? "The year updates Q, adjusted potential, and coherence; it does not run a simulation." : "El año actualiza Q, potencial ajustado y coherencia; no ejecuta una simulación."}</p>
      </div>
      <div className="hcu-visual-grid">
        <figure className="hcu-network-figure">
          <svg className="hcu-network-svg" viewBox="0 0 1000 640" role="group" aria-labelledby="hcu-network-title hcu-network-description">
            <title id="hcu-network-title">{english ? "TAMV HCU relationship map" : "Mapa de relaciones HCU TAMV"}</title>
            <desc id="hcu-network-description">{english ? "Select a node to inspect its declared values and linked sources. The arrangement is a navigation aid, not a geographic or causal projection." : "Selecciona un nodo para consultar sus valores declarados y fuentes relacionadas. La distribución ayuda a navegar; no es una proyección geográfica ni causal."}</desc>
            <defs>
              <marker id="hcu-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 z" fill="var(--copper-dark)" />
              </marker>
            </defs>
            <circle className="hcu-orbit hcu-orbit-outer" cx="500" cy="320" r="270" />
            <circle className="hcu-orbit" cx="500" cy="320" r="128" />
            {graph.edges.map((edge, index) => {
              const sourcePoints = edge.sourceAtomIds.map((id) => positions.atoms.get(id)).filter((point): point is Point => Boolean(point))
              const targetPoints = edge.targetAtomIds.map((id) => positions.atoms.get(id)).filter((point): point is Point => Boolean(point))
              if (!sourcePoints.length || !targetPoints.length) return null
              const source = averagePoint(sourcePoints)
              const target = averagePoint(targetPoints)
              const dx = target.x - source.x
              const dy = target.y - source.y
              const length = Math.max(1, Math.hypot(dx, dy))
              const offset = (index % 2 === 0 ? 1 : -1) * (24 + (index % 4) * 9)
              const control = { x: (source.x + target.x) / 2 - (dy / length) * offset, y: (source.y + target.y) / 2 + (dx / length) * offset }
              return <path key={edge.id} className={`hcu-network-edge${edge.sign < 0 ? " is-negative" : ""}`} d={`M ${source.x} ${source.y} Q ${control.x} ${control.y} ${target.x} ${target.y}`} strokeWidth={1 + edge.weight * 2.5} markerEnd="url(#hcu-arrow)"><title>{`${edge.sourceTitle ?? (english ? "Declared relationship" : "Relación declarada")}: ${edge.sign > 0 ? "+" : "−"}, ${edge.delayYears} ${english ? "year delay" : "años de rezago"}`}</title></path>
            })}
            {[...graph.domains].sort((left, right) => left.sortOrder - right.sortOrder).map((domain, index) => {
              const point = positions.domains.get(domain.id)
              if (!point) return null
              const domainName = english ? domain.nameEn : domain.nameEs
              return <g key={domain.id} className="hcu-network-domain">
                <circle cx={point.x} cy={point.y} r="31" />
                <text x={point.x} y={point.y + 48} textAnchor="middle">{shortLabel(domainName, 26)}</text>
                <title>{`${String(index + 1).padStart(2, "0")} · ${domainName}`}</title>
              </g>
            })}
            <g className="hcu-network-core" aria-hidden="true"><circle cx="500" cy="320" r="43" /><text x="500" y="316" textAnchor="middle">Ω</text><text x="500" y="334" textAnchor="middle">CORE</text></g>
            {graph.atoms.map((atom) => {
              const point = positions.atoms.get(atom.id)
              if (!point) return null
              const radius = 8 + Math.max(0, atom.influenceX) / 100 * 9
              const name = english ? atom.nameEn : atom.nameEs
              return <g
                key={atom.id}
                className={`hcu-network-atom${selectedAtom?.id === atom.id ? " is-selected" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${name}; ${english ? "influence" : "influencia"} ${atom.influenceX}, ${english ? "risk" : "riesgo"} ${atom.riskY}, ${english ? "evidence" : "evidencia"} ${atom.evidenceZ}`}
                aria-pressed={selectedAtom?.id === atom.id}
                onClick={() => setSelectedId(atom.id)}
                onKeyDown={(event) => selectWithKeyboard(event, atom.id)}
              >
                <circle cx={point.x} cy={point.y} r={radius} fill={atomFill(atom)} />
                {atom.isQuarantined && <path className="hcu-quarantine-mark" d={`M ${point.x - 5} ${point.y - 5} L ${point.x + 5} ${point.y + 5} M ${point.x + 5} ${point.y - 5} L ${point.x - 5} ${point.y + 5}`} />}
                <text x={point.x} y={point.y + radius + 16} textAnchor="middle">{shortLabel(name, 19)}</text>
                <title>{name}</title>
              </g>
            })}
          </svg>
          <figcaption>{english ? "Lines encode declared source and destination sets, sign, weight, and delay. Node placement is deterministic for navigation and does not encode geographic position." : "Las líneas codifican conjuntos de origen y destino declarados, signo, peso y rezago. La posición de los nodos facilita la navegación y no representa geografía."}</figcaption>
        </figure>

        <aside className="hcu-selected-panel" aria-live="polite" aria-label={english ? "Selected node details" : "Detalle del nodo seleccionado"}>
          <p className="eyebrow">{english ? "SELECTED ATOM" : "ÁTOMO SELECCIONADO"}</p>
          {selectedAtom ? <>
            <p className="hcu-selected-domain">{selectedDomain ? (english ? selectedDomain.nameEn : selectedDomain.nameEs) : "HCU"}</p>
            <h3>{english ? selectedAtom.nameEn : selectedAtom.nameEs}</h3>
            <p className="hcu-selected-description">{english ? selectedAtom.descriptionEn : selectedAtom.descriptionEs}</p>
            <dl className="hcu-atom-metrics">
              <div><dt>{english ? "Influence X" : "Influencia X"}</dt><dd>{selectedAtom.influenceX}</dd></div>
              <div><dt>{english ? "Risk Y" : "Riesgo Y"}</dt><dd>{selectedAtom.riskY}</dd></div>
              <div><dt>{english ? "Evidence Z" : "Evidencia Z"}</dt><dd>{selectedAtom.evidenceZ}</dd></div>
              <div><dt>Q · {referenceYear}</dt><dd>{(selectedUncertainty * 100).toFixed(1)}</dd></div>
              <div><dt>{english ? "Adjusted potential" : "Potencial ajustado"}</dt><dd>{(selectedAtom.influenceX * (1 - selectedUncertainty)).toFixed(1)}</dd></div>
              <div><dt>κ · {referenceYear}</dt><dd>{(selectedAtom.evidenceZ * (1 - selectedUncertainty)).toFixed(1)}</dd></div>
            </dl>
            <div className="hcu-node-flags"><span className="status-pill">{selectedAtom.isProvisional ? (english ? "Provisional" : "Provisional") : (english ? "Reviewed" : "Revisado")}</span>{selectedAtom.isQuarantined && <span className="status-pill">{english ? "Quarantined" : "En cuarentena"}</span>}</div>
            <div className="hcu-related-list"><h4>{english ? "Declared relationships" : "Relaciones declaradas"}</h4>
              {relatedEdges.length ? relatedEdges.map((edge) => <article key={edge.id}>
                <strong>{edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")} {edge.sign > 0 ? "→" : "⊣"} {edge.targetAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")}</strong>
                <span>{english ? "Weight" : "Peso"} {edge.weight} · {english ? "delay" : "rezago"} {edge.delayYears} {english ? "years" : "años"} · {edge.tqafLevel ?? "TQAF —"}</span>
                {edge.sourceUrl ? <a href={edge.sourceUrl} target="_blank" rel="noopener noreferrer">{edge.sourceTitle ?? edge.sourceUrl}</a> : <span>{edge.sourceTitle ?? (english ? "No cited source" : "Sin fuente citada")} · {edge.evidenceStatus}</span>}
              </article>) : <p>{english ? "No active relationships are recorded for this atom." : "No hay relaciones activas registradas para este átomo."}</p>}
            </div>
          </> : <p>{english ? "No atoms are available in the public graph." : "No hay átomos en el grafo público."}</p>}
        </aside>
      </div>

      <section className="hcu-explorer" aria-labelledby="hcu-explorer-title">
        <div className="hcu-explorer-heading"><div><p className="eyebrow">{english ? "INTENT SEARCH" : "BÚSQUEDA POR INTENCIÓN"}</p><h2 id="hcu-explorer-title">{english ? "Find a connected question." : "Encuentra una pregunta conectada."}</h2></div><p>{english ? "Separate terms with +; all terms must match." : "Separa términos con +; todos deben coincidir."}</p></div>
        <label className="hcu-search-field" htmlFor="hcu-intent-search"><span>{english ? "Search atoms, descriptions, and domains" : "Buscar átomos, descripciones y dominios"}</span><input id="hcu-intent-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "AI + education + climate" : "IA + educación + clima"} maxLength={120} /></label>
        {terms.length > 0 && <div className="hcu-search-results" aria-live="polite">{searchResults.length ? searchResults.map((atom) => <button type="button" key={atom.id} onClick={() => setSelectedId(atom.id)} aria-pressed={selectedAtom?.id === atom.id}>{english ? atom.nameEn : atom.nameEs}<span>{english ? "Select node" : "Seleccionar nodo"}</span></button>) : <p>{english ? "No nodes match every term." : "Ningún nodo coincide con todos los términos."}</p>}</div>}
        <div className="hcu-domain-grid">
          {graph.domains.map((domain) => {
            const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
            return <article className="hcu-domain-card" key={domain.id}>
              <p className="eyebrow">{String(domain.sortOrder).padStart(2, "0")} / {english ? "DOMAIN" : "DOMINIO"}</p>
              <h3>{english ? domain.nameEn : domain.nameEs}</h3>
              <p>{english ? domain.descriptionEn : domain.descriptionEs}</p>
              {atoms.length ? <ul className="hcu-atom-list">
                {atoms.map((atom) => <li key={atom.id}>
                  <button type="button" className="hcu-atom-select" aria-pressed={selectedAtom?.id === atom.id} onClick={() => setSelectedId(atom.id)}>
                    <strong>{english ? atom.nameEn : atom.nameEs}</strong><span>{english ? atom.descriptionEn : atom.descriptionEs}</span>
                  </button>
                  <dl><div><dt>{english ? "Influence" : "Influencia"}</dt><dd>{atom.influenceX}</dd></div><div><dt>{english ? "Risk" : "Riesgo"}</dt><dd>{atom.riskY}</dd></div><div><dt>{english ? "Evidence" : "Evidencia"}</dt><dd>{atom.evidenceZ}</dd></div></dl>
                  {atom.isProvisional && <span className="status-pill">{english ? "Provisional" : "Provisional"}</span>}
                </li>)}
              </ul> : <p className="hcu-unmodeled-note">{english ? "Reference domain only; no modeled atoms or relationships yet." : "Dominio de referencia; aún no tiene átomos ni relaciones modeladas."}</p>}
            </article>
          })}
        </div>
      </section>

      <section className="hcu-edges" aria-labelledby="hcu-edges-title">
        <div className="hcu-section-heading"><p className="eyebrow">{english ? "RELATIONSHIPS & PROVENANCE" : "RELACIONES Y PROCEDENCIA"}</p><h2 id="hcu-edges-title">{english ? "Signals with explicit assumptions." : "Señales con supuestos explícitos."}</h2></div>
        {graph.edges.length ? <div className="hcu-edge-list">{graph.edges.map((edge) => (
          <article className="hcu-edge-card" key={edge.id}>
            <div className="hcu-edge-flow"><strong>{edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")}</strong><span aria-label={edge.sign > 0 ? "influencia positiva" : "influencia negativa"}>{edge.sign > 0 ? "→" : "⊣"}</span><strong>{edge.targetAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")}</strong></div>
            <div className="hcu-edge-meta"><span>{english ? "Weight" : "Peso"} {edge.weight}</span><span>{english ? "Delay" : "Rezago"} {edge.delayYears} {english ? "years" : "años"}</span><span>{edge.tqafLevel ?? "TQAF —"}</span><span>{edge.evidenceStatus}</span></div>
            <p>{english ? "Source" : "Fuente"}: {edge.sourceUrl ? <a href={edge.sourceUrl} target="_blank" rel="noopener noreferrer">{edge.sourceTitle ?? edge.sourceUrl}</a> : edge.sourceTitle ?? (english ? "Not specified" : "No especificada")}</p>
          </article>
        ))}</div> : <p className="empty-state">{english ? "No public relationships are available." : "No hay relaciones públicas disponibles."}</p>}
      </section>
    </div>
  )
}
