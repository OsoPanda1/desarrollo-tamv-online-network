import type { Locale } from "@/lib/i18n"
import { mindMaps, type MindMapSpec } from "@/lib/visuals/catalog"

const CX = 360
const CY = 208
const RX = 252
const RY = 138

function wrapCenter(label: string): string[] {
  const words = label.split(" ")
  if (words.length === 1) return words
  if (words.length === 2) return words
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    if ((line + " " + word).trim().length > 12 && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + " " + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

/**
 * Radial mind map. The SVG is a schematic; the ordered list below carries the
 * full text so the map is readable without seeing the graphic.
 */
export function MindMap({
  mindMap,
  locale = "es",
  className = "",
}: {
  mindMap: MindMapSpec
  locale?: Locale
  className?: string
}) {
  const es = locale === "es"
  const title = es ? mindMap.titleEs : mindMap.titleEn
  const center = es ? mindMap.centerEs : mindMap.centerEn
  const titleId = `${mindMap.id}-title`
  const descId = `${mindMap.id}-desc`
  const lines = wrapCenter(center)

  const branches = mindMap.branches.map((branch, index) => {
    const angle = (-90 + index * (360 / mindMap.branches.length)) * (Math.PI / 180)
    const x = CX + Math.cos(angle) * RX
    const y = CY + Math.sin(angle) * RY
    const mx = CX + Math.cos(angle) * RX * 0.55
    const my = CY + Math.sin(angle) * RY * 0.55
    const px = -Math.sin(angle) * 26
    const py = Math.cos(angle) * 26
    const anchor: "start" | "middle" | "end" = Math.cos(angle) > 0.25 ? "start" : Math.cos(angle) < -0.25 ? "end" : "middle"
    const labelX = x + (anchor === "start" ? 14 : anchor === "end" ? -14 : 0)
    const labelY = y + (Math.sin(angle) < -0.4 ? -12 : Math.sin(angle) > 0.4 ? 24 : 5)
    return { branch, x, y, mx, my, px, py, anchor, labelX, labelY }
  })

  return (
    <figure className={`mindmap-figure ${className}`.trim()} id={mindMap.id}>
      <div className="mindmap-canvas">
        <svg viewBox="0 0 720 416" role="img" aria-labelledby={`${titleId} ${descId}`} preserveAspectRatio="xMidYMid meet">
          <title id={titleId}>{title}</title>
          <desc id={descId}>
            {es
              ? `Esquema radial con ${mindMap.branches.length} ramas alrededor de «${center}». El detalle textual aparece debajo del gráfico.`
              : `Radial schematic with ${mindMap.branches.length} branches around “${center}”. The textual detail appears below the graphic.`}
          </desc>
          <text x="28" y="34" className="mm-kicker">
            {es ? "MAPA MENTAL" : "MIND MAP"}
          </text>
          <circle cx={CX} cy={CY} r="112" className="mm-halo" />
          <circle cx={CX} cy={CY} r="74" className="mm-orbit" />
          <circle cx={CX} cy={CY} r="46" className="mm-core" />
          {lines.map((line, index) => (
            <text
              key={line}
              x={CX}
              y={CY + (index - (lines.length - 1) / 2) * 16 + 4}
              textAnchor="middle"
              className="mm-center"
            >
              {line}
            </text>
          ))}
          {branches.map(({ branch, x, y, mx, my, px, py, anchor, labelX, labelY }, index) => (
            <g key={branch.labelEs}>
              <path
                d={`M ${CX} ${CY} Q ${mx + px} ${my + py} ${x} ${y}`}
                className="mm-link"
                style={{ opacity: 0.32 + (index % 3) * 0.12 }}
              />
              <circle cx={x} cy={y} r="14" className="mm-node-glow" />
              <circle cx={x} cy={y} r="4" className="mm-node" />
              <text x={labelX} y={labelY} textAnchor={anchor} className="mm-label">
                {es ? branch.labelEs : branch.labelEn}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mindmap-caption">
        <div className="mindmap-head">
          <h3>{title}</h3>
          <span>{es ? `${mindMaps.length} mapas en el sitio` : `${mindMaps.length} maps across the site`}</span>
        </div>
        <ol className="mindmap-branches">
          {mindMap.branches.map((branch) => (
            <li key={branch.labelEs}>
              <strong>{es ? branch.labelEs : branch.labelEn}</strong>
              <span>{es ? branch.detailEs : branch.detailEn}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
