import type { ReactNode } from "react"
import type { Locale } from "@/lib/i18n"
import type { GraphSpec } from "@/lib/visuals/catalog"
import { graphs } from "@/lib/visuals/catalog"
import { COURSE_MODULE_IDS, MEMBERSHIP_PLANS } from "@/lib/billing/plans"

type Cell = string | number

function GraphFrame({
  spec,
  locale,
  index,
  children,
  columns,
  rows,
  note,
  className = "",
}: {
  spec: GraphSpec
  locale: Locale
  index: number
  children: ReactNode
  columns: string[]
  rows: Cell[][]
  note?: string
  className?: string
}) {
  const es = locale === "es"
  const titleId = `${spec.id}-title`
  const descId = `${spec.id}-desc`
  return (
    <figure className={`graph-figure ${className}`.trim()} id={spec.id}>
      <div className="graph-canvas">
        <svg viewBox="0 0 720 420" role="img" aria-labelledby={`${titleId} ${descId}`} preserveAspectRatio="xMidYMid meet">
          <title id={titleId}>{es ? spec.titleEs : spec.titleEn}</title>
          <desc id={descId}>{es ? spec.captionEs : spec.captionEn}</desc>
          {children}
        </svg>
      </div>
      <figcaption className="graph-caption">
        <div className="graph-head">
          <span className="graph-kicker">
            {es ? "GRAFO" : "GRAPH"} {String(index).padStart(2, "0")}
          </span>
          <h3>{es ? spec.titleEs : spec.titleEn}</h3>
        </div>
        <p>{es ? spec.captionEs : spec.captionEn}</p>
        {note && <p className="graph-note">{note}</p>}
        <p className="graph-source">
          <span aria-hidden="true">§</span> {es ? "Fuente: " : "Source: "}
          {es ? spec.sourceEs : spec.sourceEn}
        </p>
        <details className="graph-data">
          <summary>{es ? "Ver datos y etiquetas" : "View data and labels"}</summary>
          <div className="graph-table-wrap">
            <table>
              <caption className="sr-only">{es ? spec.titleEs : spec.titleEn}</caption>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} scope="col">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th key={cellIndex} scope="row">{cell}</th>
                      ) : (
                        <td key={cellIndex}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </figcaption>
    </figure>
  )
}

const axis = (label: string, x: number, y: number, anchor: "start" | "middle" | "end" = "middle") => (
  <text key={label} x={x} y={y} textAnchor={anchor} className="g-axis">{label}</text>
)

function EcosystemNetwork({ es }: { es: boolean }) {
  const nodes = [
    { id: "core", label: es ? "Núcleo documental" : "Documentary core", x: 360, y: 210, r: 16, hot: true },
    { id: "research", label: es ? "Investigación" : "Research", x: 150, y: 104, r: 9 },
    { id: "architecture", label: es ? "Arquitectura" : "Architecture", x: 232, y: 338, r: 9 },
    { id: "learning", label: es ? "Formación" : "Learning", x: 486, y: 340, r: 9 },
    { id: "community", label: es ? "Comunidad" : "Community", x: 576, y: 112, r: 9 },
    { id: "api", label: es ? "API pública" : "Public API", x: 634, y: 246, r: 9 },
    { id: "federation", label: es ? "Federación" : "Federation", x: 104, y: 246, r: 9 },
  ]
  const edges: [string, string][] = [
    ["core", "research"], ["core", "architecture"], ["core", "learning"], ["core", "community"],
    ["core", "api"], ["core", "federation"], ["community", "api"], ["research", "federation"],
    ["architecture", "api"], ["learning", "community"],
  ]
  const byId = (id: string) => nodes.find((node) => node.id === id)!
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "RED DE RESPONSABILIDADES" : "RESPONSIBILITY NETWORK"}</text>
      {edges.map(([a, b]) => {
        const from = byId(a)
        const to = byId(b)
        return (
          <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="g-edge" />
        )
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          {node.hot && <circle cx={node.x} cy={node.y} r={node.r * 3} className="g-halo" />}
          <circle cx={node.x} cy={node.y} r={node.r} className={node.hot ? "g-node-hot" : "g-node"} />
          <text x={node.x} y={node.y + node.r + 18} textAnchor="middle" className={node.hot ? "g-label-strong" : "g-label"}>
            {node.label}
          </text>
        </g>
      ))}
    </>
  )
}

function MaturityRadar({ es }: { es: boolean }) {
  const axes = [
    { label: es ? "Documentación" : "Documentation", value: 4 },
    { label: es ? "Contrato" : "Contract", value: 3 },
    { label: es ? "Prueba" : "Test", value: 3 },
    { label: es ? "Operación" : "Operation", value: 2 },
    { label: es ? "Exportación" : "Export", value: 3 },
  ]
  const cx = 360
  const cy = 214
  const radius = 132
  const point = (index: number, scale: number) => {
    const angle = (-90 + (index * 360) / axes.length) * (Math.PI / 180)
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale]
  }
  const rings = [1, 0.75, 0.5, 0.25]
  const polygon = axes
    .map((entry, index) => point(index, entry.value / 4).map((value) => value.toFixed(1)).join(","))
    .join(" ")
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "MADUREZ DECLARADA · 1–4" : "DECLARED MATURITY · 1–4"}</text>
      {rings.map((scale) => (
        <polygon
          key={scale}
          points={axes.map((_, index) => point(index, scale).map((value) => value.toFixed(1)).join(",")).join(" ")}
          className="g-ring"
        />
      ))}
      {axes.map((entry, index) => {
        const [x, y] = point(index, 1)
        const [lx, ly] = point(index, 1.16)
        return (
          <g key={entry.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} className="g-axis-line" />
            {axis(entry.label, lx, ly, Math.abs(lx - cx) < 12 ? "middle" : lx > cx ? "start" : "end")}
          </g>
        )
      })}
      <polygon points={polygon} className="g-radar" />
      {axes.map((entry, index) => {
        const [x, y] = point(index, entry.value / 4)
        return <circle key={entry.label} cx={x} cy={y} r="4.5" className="g-node-hot" />
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" className="g-value">{es ? "autoevaluación" : "self-assessment"}</text>
    </>
  )
}

function CapabilityHeatmap({ es }: { es: boolean }) {
  const states = [es ? "Catalogado" : "Catalogued", es ? "Contratado" : "Contracted", es ? "Probado" : "Tested", es ? "Operado" : "Operated"]
  const capabilities: { label: string; marks: number[] }[] = [
    { label: es ? "Identidad" : "Identity", marks: [1, 1, 1, 1] },
    { label: es ? "Investigación" : "Research", marks: [1, 1, 1, 1] },
    { label: "HCU", marks: [1, 1, 1, 0] },
    { label: es ? "Membresía" : "Membership", marks: [1, 1, 1, 1] },
    { label: es ? "Observabilidad" : "Observability", marks: [1, 0, 1, 1] },
    { label: es ? "Federación" : "Federation", marks: [1, 1, 0, 0] },
  ]
  const left = 196
  const top = 104
  const cell = 58
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "MATRIZ DE CAPACIDADES" : "CAPABILITY MATRIX"}</text>
      {states.map((state, index) => (
        <text key={state} x={left + index * cell + 22} y={top - 18} textAnchor="middle" className="g-axis">{state}</text>
      ))}
      {capabilities.map((capability, row) => (
        <g key={capability.label}>
          <text x={left - 18} y={top + row * cell + 30} textAnchor="end" className="g-label">{capability.label}</text>
          {capability.marks.map((mark, column) => (
            <g key={column}>
              <rect
                x={left + column * cell}
                y={top + row * cell}
                width="44"
                height="44"
                rx="4"
                className={mark ? (column === 3 ? "g-cell-hot" : "g-cell-on") : "g-cell-off"}
              />
              <text x={left + column * cell + 22} y={top + row * cell + 28} textAnchor="middle" className="g-cell-mark">
                {mark ? "●" : "·"}
              </text>
            </g>
          ))}
        </g>
      ))}
      <text x={left} y={top + capabilities.length * cell + 26} className="g-note">
        {es ? "● declarado · · no declarado" : "● declared · · not declared"}
      </text>
    </>
  )
}

function ResearchTimeline({ es }: { es: boolean }) {
  const stages = [
    { label: es ? "Pregunta" : "Question", detail: es ? "acotada" : "bounded" },
    { label: es ? "Evidencia" : "Evidence", detail: es ? "versionada" : "versioned" },
    { label: es ? "Revisión" : "Review", detail: es ? "registrada" : "recorded" },
    { label: es ? "Publicación" : "Publication", detail: es ? "declarada" : "declared" },
    { label: es ? "Réplica" : "Replication", detail: es ? "posible" : "possible" },
  ]
  const y = 208
  const startX = 84
  const endX = 636
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "LÍNEA DE TIEMPO DEL MÉTODO" : "METHOD TIMELINE"}</text>
      <line x1={startX} y1={y} x2={endX} y2={y} className="g-track" />
      {stages.map((stage, index) => {
        const x = startX + (index / (stages.length - 1)) * (endX - startX)
        const above = index % 2 === 0
        return (
          <g key={stage.label}>
            <circle cx={x} cy={y} r="22" className="g-halo" />
            <circle cx={x} cy={y} r="7" className="g-node-hot" />
            <line x1={x} y1={y + (above ? -14 : 14)} x2={x} y2={y + (above ? -44 : 44)} className="g-edge" />
            <text x={x} y={y + (above ? -56 : 66)} textAnchor="middle" className="g-label-strong">{stage.label}</text>
            <text x={x} y={y + (above ? -40 : 82)} textAnchor="middle" className="g-note">{stage.detail}</text>
            <text x={x} y={y + 4} textAnchor="middle" className="g-step">{index + 1}</text>
          </g>
        )
      })}
      <text x={startX} y={y + 150} className="g-note">
        {es ? "Secuencia de método, sin volúmenes ni métricas de impacto." : "Method sequence, without volumes or impact metrics."}
      </text>
    </>
  )
}

function ProposalFunnel({ es }: { es: boolean }) {
  const stages = [
    { label: es ? "Recibida" : "Received", detail: es ? "validación" : "validation" },
    { label: es ? "En revisión" : "In review", detail: es ? "pares o moderación" : "peers or moderation" },
    { label: es ? "Aceptada" : "Accepted", detail: es ? "con observaciones" : "with comments" },
    { label: es ? "Publicada" : "Published", detail: es ? "estado visible" : "visible state" },
    { label: es ? "Apelable" : "Appealable", detail: es ? "revisión" : "review" },
  ]
  const top = 92
  const height = 46
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "EMBUDO EDITORIAL · ETAPAS" : "EDITORIAL FUNNEL · STAGES"}</text>
      {stages.map((stage, index) => {
        const inset = index * 34
        const width = 560 - inset * 2
        const x = 360 - width / 2
        return (
          <g key={stage.label}>
            <rect x={x} y={top + index * (height + 14)} width={width} height={height} rx="6" className={index === 4 ? "g-stage-alt" : "g-stage"} />
            <text x={360} y={top + index * (height + 14) + 22} textAnchor="middle" className="g-label-strong">{stage.label}</text>
            <text x={360} y={top + index * (height + 14) + 37} textAnchor="middle" className="g-note">{stage.detail}</text>
          </g>
        )
      })}
      <text x="28" y="396" className="g-note">
        {es ? "Se muestran etapas, no volúmenes: los recuentos viven en la API, no en este esquema." : "Stages are shown, not volumes: counts live in the API, not in this schematic."}
      </text>
    </>
  )
}

function HcuTopology({ es }: { es: boolean }) {
  const layers = [
    { r: 150, label: es ? "Dominios" : "Domains", count: es ? "campo" : "field" },
    { r: 112, label: es ? "Átomos" : "Atoms", count: es ? "unidad" : "unit" },
    { r: 74, label: es ? "Hiperaristas" : "Hyperedges", count: es ? "relación" : "relation" },
    { r: 38, label: es ? "Simulaciones" : "Simulations", count: es ? "semilla" : "seed" },
  ]
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "TOPOLOGÍA HCU" : "HCU TOPOLOGY"}</text>
      <circle cx="300" cy="214" r="176" className="g-halo" />
      {layers.map((layer, index) => (
        <g key={layer.label}>
          <circle cx="300" cy="214" r={layer.r} className={index % 2 === 0 ? "g-ring" : "g-orbit"} />
          <line x1={300 + layer.r} y1="214" x2="536" y2={116 + index * 58} className="g-edge" />
          <circle cx="536" cy={116 + index * 58} r="4" className="g-node-hot" />
          <text x="548" y={112 + index * 58} className="g-label-strong">{layer.label}</text>
          <text x="548" y={128 + index * 58} className="g-note">{layer.count}</text>
        </g>
      ))}
      <circle cx="300" cy="214" r="6" className="g-node-hot" />
      <text x="300" y="218" textAnchor="middle" className="g-step">n</text>
    </>
  )
}

const moduleLabels = [
  { id: COURSE_MODULE_IDS[0], es: "Perfil", en: "Profile" },
  { id: COURSE_MODULE_IDS[1], es: "Portafolio", en: "Portfolio" },
  { id: COURSE_MODULE_IDS[2], es: "Validación", en: "Validation" },
  { id: COURSE_MODULE_IDS[3], es: "Modelo", en: "Model" },
  { id: COURSE_MODULE_IDS[4], es: "Pitch", en: "Pitch" },
]

function CourseFunnel({ es }: { es: boolean }) {
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "RUTA DE MÓDULOS · ACCESO VALIDADO EN SERVIDOR" : "MODULE PATH · SERVER-VALIDATED ACCESS"}</text>
      {moduleLabels.map((module, index) => {
        const x = 74 + index * 124
        const y = 118 + index * 42
        return (
          <g key={module.id}>
            {index > 0 && <path d={`M ${x - 62} ${y - 42 + 46} L ${x - 34} ${y + 10}`} className="g-edge" />}
            <rect x={x - 52} y={y} width="104" height="52" rx="6" className={index === 4 ? "g-stage-alt" : "g-stage"} />
            <text x={x} y={y + 24} textAnchor="middle" className="g-step">{index + 1}</text>
            <text x={x} y={y + 41} textAnchor="middle" className="g-label-strong">{es ? module.es : module.en}</text>
          </g>
        )
      })}
      <text x="28" y="392" className="g-note">
        {es ? "Cinco módulos secuenciales. Completar la ruta no otorga acreditación oficial." : "Five sequential modules. Completing the path grants no official accreditation."}
      </text>
    </>
  )
}

function MembershipBars({ es }: { es: boolean }) {
  const plans = [MEMBERSHIP_PLANS.individual, MEMBERSHIP_PLANS.business]
  const max = Math.max(...plans.map((plan) => plan.amountMxn))
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "PLANES Y PRECIOS DEL CATÁLOGO" : "CATALOGUE PLANS AND PRICES"}</text>
      {plans.map((plan, index) => {
        const width = (plan.amountMxn / max) * 480
        const y = 112 + index * 118
        return (
          <g key={plan.id}>
            <text x="72" y={y - 12} className="g-label-strong">
              {index === 0 ? (es ? "Individual" : "Individual") : es ? "Empresarial" : "Business"}
            </text>
            <rect x="72" y={y} width="480" height="34" rx="4" className="g-bar-track" />
            <rect x="72" y={y} width={width} height="34" rx="4" className={index === 0 ? "g-bar" : "g-bar-hot"} />
            <text x={72 + width + 14} y={y + 23} className="g-value">${plan.amountMxn} MXN</text>
            <text x="72" y={y + 54} className="g-note">{es ? "por mes · suscripción" : "per month · subscription"}</text>
          </g>
        )
      })}
      <text x="72" y="368" className="g-note">
        {es ? "Precios tomados de lib/billing/plans.ts. No incluyen promociones ni impuestos." : "Prices taken from lib/billing/plans.ts. Promotions and taxes not included."}
      </text>
    </>
  )
}

function FederationMap({ es }: { es: boolean }) {
  const nodes = [
    { x: 360, y: 208, label: "TAMV", hot: true },
    { x: 152, y: 118, label: es ? "Nodo académico" : "Academic node" },
    { x: 172, y: 316, label: es ? "Nodo territorial" : "Territorial node" },
    { x: 566, y: 126, label: es ? "Nodo técnico" : "Technical node" },
    { x: 572, y: 312, label: es ? "Nodo editorial" : "Editorial node" },
  ]
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "MAPA DE FEDERACIÓN · ESTADO DECLARADO" : "FEDERATION MAP · DECLARED STATE"}</text>
      {nodes.slice(1).map((node) => (
        <line key={node.label} x1="360" y1="208" x2={node.x} y2={node.y} className="g-edge-dashed" />
      ))}
      {nodes.map((node) => (
        <g key={node.label}>
          {node.hot && <circle cx={node.x} cy={node.y} r="48" className="g-halo" />}
          <circle cx={node.x} cy={node.y} r={node.hot ? 14 : 9} className={node.hot ? "g-node-hot" : "g-node"} />
          <text x={node.x} y={node.y + (node.hot ? 32 : 28)} textAnchor="middle" className={node.hot ? "g-label-strong" : "g-label"}>{node.label}</text>
        </g>
      ))}
      <text x="360" y="372" textAnchor="middle" className="g-note">
        {es ? "La federación no está activa en producción." : "Federation is not active in production."}
      </text>
    </>
  )
}

function ProvenanceChain({ es }: { es: boolean }) {
  const blocks = [
    { title: es ? "Evento" : "Event", detail: es ? "acción registrada" : "recorded action" },
    { title: es ? "Hash anterior" : "Previous hash", detail: es ? "enlace" : "link" },
    { title: es ? "Hash del evento" : "Event hash", detail: es ? "contenido" : "content" },
    { title: es ? "Verificación" : "Verification", detail: es ? "recómputo" : "recompute" },
  ]
  return (
    <>
      <text x="28" y="34" className="g-kicker">{es ? "CADENA DE PROCEDENCIA · ESQUEMA" : "PROVENANCE CHAIN · SCHEMATIC"}</text>
      {blocks.map((block, index) => {
        const x = 52 + index * 164
        return (
          <g key={block.title}>
            {index > 0 && <path d={`M ${x - 22} 206 L ${x - 8} 206`} className="g-arrow" />}
            <rect x={x} y="158" width="128" height="96" rx="6" className={index === 3 ? "g-stage-alt" : "g-stage"} />
            <text x={x + 64} y="190" textAnchor="middle" className="g-label-strong">{block.title}</text>
            <text x={x + 64} y="212" textAnchor="middle" className="g-note">{block.detail}</text>
            <text x={x + 64} y="236" textAnchor="middle" className="g-step">h{index + 1}</text>
          </g>
        )
      })}
      <text x="52" y="330" className="g-note">
        {es
          ? "Los identificadores son posiciones del esquema, no valores reales. La prueba es recomputar la cadena."
          : "Identifiers are schematic positions, not real values. The proof is recomputing the chain."}
      </text>
    </>
  )
}

/**
 * Twelve declared or measured graphs. The two telemetry kinds are rendered by
 * the live TelemetryDeck, because they need a client-side probe.
 */
export function VisualGraph({
  spec,
  locale = "es",
  className = "",
}: {
  spec: GraphSpec
  locale?: Locale
  className?: string
}) {
  const es = locale === "es"
  const index = graphs.findIndex((entry) => entry.id === spec.id) + 1
  if (index === 0) return null

  switch (spec.kind) {
    case "ecosystem-network":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Nodo" : "Node", es ? "Responsabilidad" : "Responsibility"]}
          rows={[
            [es ? "Núcleo documental" : "Documentary core", es ? "Inventario y estados editoriales" : "Inventory and editorial states"],
            [es ? "Investigación" : "Research", es ? "Preguntas, evidencia y revisión" : "Questions, evidence, and review"],
            [es ? "Arquitectura" : "Architecture", es ? "Contratos, pruebas y operación" : "Contracts, tests, and operation"],
            [es ? "Formación" : "Learning", es ? "Ruta de cinco módulos" : "Five-module path"],
            [es ? "Comunidad" : "Community", es ? "Participación y cuidado" : "Participation and care"],
            [es ? "API pública" : "Public API", es ? "Contrato exportable" : "Exportable contract"],
            [es ? "Federación" : "Federation", es ? "Interoperabilidad declarada" : "Declared interoperability"],
          ]}
        >
          <EcosystemNetwork es={es} />
        </GraphFrame>
      )
    case "maturity-radar":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Eje" : "Axis", es ? "Nivel declarado (1–4)" : "Declared level (1–4)"]}
          rows={[
            [es ? "Documentación" : "Documentation", 4],
            [es ? "Contrato" : "Contract", 3],
            [es ? "Prueba" : "Test", 3],
            [es ? "Operación" : "Operation", 2],
            [es ? "Exportación" : "Export", 3],
          ]}
        >
          <MaturityRadar es={es} />
        </GraphFrame>
      )
    case "capability-heatmap":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Capacidad" : "Capability", es ? "Catalogado" : "Catalogued", es ? "Contratado" : "Contracted", es ? "Probado" : "Tested", es ? "Operado" : "Operated"]}
          rows={[
            [es ? "Identidad" : "Identity", "sí", "sí", "sí", "sí"],
            [es ? "Investigación" : "Research", "sí", "sí", "sí", "sí"],
            ["HCU", "sí", "sí", "sí", "no"],
            [es ? "Membresía" : "Membership", "sí", "sí", "sí", "sí"],
            [es ? "Observabilidad" : "Observability", "sí", "no", "sí", "sí"],
            [es ? "Federación" : "Federation", "sí", "sí", "no", "no"],
          ]}
        >
          <CapabilityHeatmap es={es} />
        </GraphFrame>
      )
    case "research-timeline":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Etapa" : "Stage", es ? "Criterio" : "Criterion"]}
          rows={[
            [es ? "Pregunta" : "Question", es ? "Acotada y verificable" : "Bounded and verifiable"],
            [es ? "Evidencia" : "Evidence", es ? "Fuente, versión y licencia" : "Source, version, and licence"],
            [es ? "Revisión" : "Review", es ? "Registrada y fechada" : "Recorded and dated"],
            [es ? "Publicación" : "Publication", es ? "Estado editorial explícito" : "Explicit editorial state"],
            [es ? "Réplica" : "Replication", es ? "Condiciones declaradas" : "Declared conditions"],
          ]}
        >
          <ResearchTimeline es={es} />
        </GraphFrame>
      )
    case "proposal-funnel":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Etapa" : "Stage", es ? "Qué ocurre" : "What happens"]}
          rows={[
            [es ? "Recibida" : "Received", es ? "Validación de forma y consentimiento" : "Shape and consent validation"],
            [es ? "En revisión" : "In review", es ? "Revisión por pares o moderación" : "Peer review or moderation"],
            [es ? "Aceptada" : "Accepted", es ? "Observaciones y condiciones" : "Comments and conditions"],
            [es ? "Publicada" : "Published", es ? "Estado y exportación visibles" : "Visible state and export"],
            [es ? "Apelable" : "Appealable", es ? "Toda decisión admite revisión" : "Every decision allows review"],
          ]}
        >
          <ProposalFunnel es={es} />
        </GraphFrame>
      )
    case "hcu-topology":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Capa" : "Layer", es ? "Función" : "Function"]}
          rows={[
            [es ? "Dominios" : "Domains", es ? "Agrupan preguntas y límites" : "Group questions and limits"],
            [es ? "Átomos" : "Atoms", es ? "Unidad mínima con evidencia" : "Smallest unit with evidence"],
            [es ? "Hiperaristas" : "Hyperedges", es ? "Relación entre varios átomos" : "Relation across atoms"],
            [es ? "Simulaciones" : "Simulations", es ? "Resultado determinista por semilla" : "Deterministic result per seed"],
          ]}
        >
          <HcuTopology es={es} />
        </GraphFrame>
      )
    case "course-funnel":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Módulo" : "Module", "ID"]}
          rows={moduleLabels.map((module) => [es ? module.es : module.en, module.id])}
        >
          <CourseFunnel es={es} />
        </GraphFrame>
      )
    case "membership-bars":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Plan" : "Plan", es ? "Precio" : "Price", es ? "Moneda" : "Currency", es ? "Intervalo" : "Interval"]}
          rows={[
            [es ? "Individual" : "Individual", MEMBERSHIP_PLANS.individual.amountMxn, "MXN", es ? "mes" : "month"],
            [es ? "Empresarial" : "Business", MEMBERSHIP_PLANS.business.amountMxn, "MXN", es ? "mes" : "month"],
          ]}
        >
          <MembershipBars es={es} />
        </GraphFrame>
      )
    case "federation-map":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Nodo" : "Node", es ? "Estado declarado" : "Declared state"]}
          rows={[
            ["TAMV", es ? "Núcleo operativo" : "Operating core"],
            [es ? "Nodo académico" : "Academic node", es ? "Declarado, no activo" : "Declared, not active"],
            [es ? "Nodo territorial" : "Territorial node", es ? "Declarado, no activo" : "Declared, not active"],
            [es ? "Nodo técnico" : "Technical node", es ? "Declarado, no activo" : "Declared, not active"],
            [es ? "Nodo editorial" : "Editorial node", es ? "Declarado, no activo" : "Declared, not active"],
          ]}
        >
          <FederationMap es={es} />
        </GraphFrame>
      )
    case "provenance-chain":
      return (
        <GraphFrame spec={spec} locale={locale} index={index} className={className}
          columns={[es ? "Posición" : "Position", es ? "Contenido" : "Content"]}
          rows={[
            ["h1", es ? "Evento registrado" : "Recorded event"],
            ["h2", es ? "Hash del evento anterior" : "Previous event hash"],
            ["h3", es ? "Hash del contenido actual" : "Current content hash"],
            ["h4", es ? "Recómputo de la cadena" : "Chain recomputation"],
          ]}
        >
          <ProvenanceChain es={es} />
        </GraphFrame>
      )
    default:
      return null
  }
}
