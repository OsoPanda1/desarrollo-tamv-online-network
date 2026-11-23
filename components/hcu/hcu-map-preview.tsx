import type { Locale } from "@/lib/i18n"

type Domain = { id: string; nameEs: string; nameEn: string; sortOrder: number }
type Atom = { id: string; domainId: string; nameEs: string; nameEn: string; influenceX: number; riskY: number; evidenceZ: number; isProvisional: boolean }
type Edge = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; weight: number; sign: number; sourceTitle: string | null }
type Point = { x: number; y: number }
type Graph = { domains: Domain[]; atoms: Atom[]; edges: Edge[] }

function averagePoint(points: Point[]) {
  return points.reduce((value, point) => ({ x: value.x + point.x / points.length, y: value.y + point.y / points.length }), { x: 0, y: 0 })
}

export function HcuMapPreview({ graph, locale = "es" }: { graph: Graph; locale?: Locale }) {
  const english = locale === "en"
  const domains = [...graph.domains].sort((left, right) => left.sortOrder - right.sortOrder).slice(0, 8)
  const domainPoints = new Map<string, Point>()
  const atomPoints = new Map<string, Point>()
  const atomsByDomain = new Map<string, Atom[]>()

  domains.forEach((domain, domainIndex) => {
    const angle = (Math.PI * 2 * domainIndex) / Math.max(1, domains.length) - Math.PI / 2
    const point = { x: 500 + Math.cos(angle) * 345, y: 260 + Math.sin(angle) * 165 }
    domainPoints.set(domain.id, point)
    const members = graph.atoms
      .filter((atom) => atom.domainId === domain.id)
      .sort((left, right) => right.influenceX - left.influenceX)
      .slice(0, 3)
    atomsByDomain.set(domain.id, members)
    members.forEach((atom, atomIndex) => {
      const atomAngle = (Math.PI * 2 * atomIndex) / Math.max(1, members.length) + domainIndex * 0.47
      atomPoints.set(atom.id, { x: point.x + Math.cos(atomAngle) * 47, y: point.y + Math.sin(atomAngle) * 47 })
    })
  })

  const visibleAtomIds = new Set(atomPoints.keys())
  const visibleEdges = graph.edges.filter((edge) =>
    edge.sourceAtomIds.some((id) => visibleAtomIds.has(id)) && edge.targetAtomIds.some((id) => visibleAtomIds.has(id)),
  ).slice(0, 18)
  const mapTitleId = `hcu-preview-title-${locale}`
  const mapDescriptionId = `hcu-preview-description-${locale}`

  return (
    <figure className="hcu-preview-figure">
      <svg className="hcu-preview-svg" viewBox="0 0 1000 520" role="img" aria-labelledby={`${mapTitleId} ${mapDescriptionId}`}>
        <title id={mapTitleId}>{english ? "Preview of the public HCU relationship graph" : "Vista previa del grafo público de relaciones HCU"}</title>
        <desc id={mapDescriptionId}>{english ? "A navigation sample using up to three public nodes per domain. It is not a geographic or causal map." : "Muestra de navegación con hasta tres nodos públicos por dominio. No es un mapa geográfico ni causal."}</desc>
        <ellipse className="hcu-preview-orbit" cx="500" cy="260" rx="385" ry="200" />
        <ellipse className="hcu-preview-orbit hcu-preview-orbit-inner" cx="500" cy="260" rx="140" ry="80" />
        {visibleEdges.map((edge, index) => {
          const sourcePoints = edge.sourceAtomIds.map((id) => atomPoints.get(id)).filter((point): point is Point => Boolean(point))
          const targetPoints = edge.targetAtomIds.map((id) => atomPoints.get(id)).filter((point): point is Point => Boolean(point))
          if (!sourcePoints.length || !targetPoints.length) return null
          const source = averagePoint(sourcePoints)
          const target = averagePoint(targetPoints)
          const dx = target.x - source.x
          const dy = target.y - source.y
          const length = Math.max(1, Math.hypot(dx, dy))
          const curve = (index % 2 === 0 ? 1 : -1) * (20 + (index % 3) * 9)
          const control = { x: (source.x + target.x) / 2 - (dy / length) * curve, y: (source.y + target.y) / 2 + (dx / length) * curve }
          return <path key={edge.id} className={`hcu-preview-edge${edge.sign < 0 ? " is-negative" : ""}`} d={`M ${source.x} ${source.y} Q ${control.x} ${control.y} ${target.x} ${target.y}`} strokeWidth={1 + edge.weight * 2}><title>{edge.sourceTitle ?? (english ? "Declared relationship" : "Relación declarada")}</title></path>
        })}
        {domains.map((domain, index) => {
          const point = domainPoints.get(domain.id)
          if (!point) return null
          return <g className="hcu-preview-domain" key={domain.id}>
            <circle cx={point.x} cy={point.y} r="20" />
            <text x={point.x} y={point.y + 4} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
          </g>
        })}
        <g className="hcu-preview-core" aria-hidden="true"><circle cx="500" cy="260" r="36" /><text x="500" y="256" textAnchor="middle">Ω</text><text x="500" y="272" textAnchor="middle">HCU</text></g>
        {[...atomPoints.entries()].map(([atomId, point]) => {
          const atom = graph.atoms.find((candidate) => candidate.id === atomId)
          if (!atom) return null
          return <circle key={atomId} className={`hcu-preview-node${atom.isProvisional ? " is-provisional" : ""}`} cx={point.x} cy={point.y} r={5 + Math.max(0, atom.influenceX) / 100 * 3} fill={atom.evidenceZ >= 50 ? "var(--hcu-preview-evidence)" : "var(--hcu-preview-risk)"} opacity={Math.max(0.36, atom.evidenceZ / 100)}><title>{`${english ? atom.nameEn : atom.nameEs} · ${english ? "evidence" : "evidencia"} ${atom.evidenceZ}${atom.isProvisional ? " · provisional" : ""}`}</title></circle>
        })}
      </svg>
      <div className="hcu-preview-legend" aria-label={english ? "Map key" : "Leyenda del mapa"}>
        <span><i className="hcu-preview-key-node" />{english ? "Public node" : "Nodo público"}</span>
        <span><i className="hcu-preview-key-evidence" />{english ? "Evidence score ≥ 50" : "Evidencia declarada ≥ 50"}</span>
        <span><i className="hcu-preview-key-negative" />{english ? "Negative relationship" : "Relación negativa"}</span>
      </div>
      <ol className="hcu-preview-domain-list">
        {domains.map((domain, index) => <li key={domain.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{english ? domain.nameEn : domain.nameEs}</strong><small>{atomsByDomain.get(domain.id)?.length ?? 0} {english ? "sample nodes" : "nodos en muestra"}</small></li>)}
      </ol>
      <figcaption>{english ? "Sample only: up to three nodes per domain. Positions support navigation; lines encode project-declared relations, not geography or causal evidence." : "Muestra: hasta tres nodos por dominio. La posición facilita la navegación; las líneas muestran relaciones declaradas por el proyecto, no geografía ni causalidad."}</figcaption>
    </figure>
  )
}
