import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import { graphs, mindMaps, plates, videos } from "@/lib/visuals/catalog"
import { VideoCapsule } from "@/components/visuals/video-capsule"
import { PlateFigure } from "@/components/visuals/plate-figure"
import { VisualGraph } from "@/components/visuals/graphs"
import { MindMap } from "@/components/visuals/mind-map"

const pick = <T extends { id: string }>(list: T[], id: string): T => {
  const found = list.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown visual asset: ${id}`)
  return found
}

/**
 * Home-page visual band. The home route does not use the app shell, so it gets
 * its own composition: one capsule, one plate, one graph, and one mind map.
 */
export function HomeVisualBand({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es"
  return (
    <section className="section visual-layer home-visual-band" aria-labelledby="home-visual-title">
      <div className="container">
        <header className="visual-layer-head">
          <p className="eyebrow">{es ? "ATLAS VISUAL · LECTURA RÁPIDA" : "VISUAL ATLAS · QUICK READING"}</p>
          <h2 id="home-visual-title">
            {es ? "El proyecto también se puede mirar." : "The project can also be looked at."}
          </h2>
          <p>
            {es
              ? "Una cápsula generada localmente, una placa editorial, un grafo de madurez declarada y un mapa del método de investigación. Todo con su fuente y su límite."
              : "A locally generated capsule, an editorial plate, a declared-maturity graph, and a map of the research method. Each with its source and its limit."}
          </p>
          <div className="visual-layer-links">
            <Link href={`/atlas?lang=${locale}`}>
              {es ? "Abrir el atlas completo" : "Open the full atlas"} <span aria-hidden="true">→</span>
            </Link>
            <Link href={`/logros?lang=${locale}`}>
              {es ? "Ver las 20 insignias" : "See the 20 badges"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <div className="visual-layer-hero">
          <VideoCapsule video={pick(videos, "01-memoria")} locale={locale} />
          <PlateFigure plate={pick(plates, "01-memoria-territorial")} locale={locale} />
        </div>

        <div className="graph-grid">
          <VisualGraph spec={pick(graphs, "g02-madurez")} locale={locale} />
          <MindMap mindMap={pick(mindMaps, "m01-investigacion")} locale={locale} />
        </div>
      </div>
    </section>
  )
}
