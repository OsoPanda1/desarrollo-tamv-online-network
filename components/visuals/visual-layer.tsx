"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Locale } from "@/lib/i18n"
import { graphs, mindMaps, plates, videos, visualsFor } from "@/lib/visuals/catalog"
import { VideoCapsule } from "@/components/visuals/video-capsule"
import { PlateFigure } from "@/components/visuals/plate-figure"
import { VisualGraph } from "@/components/visuals/graphs"
import { MindMap } from "@/components/visuals/mind-map"

const SKIP = new Set(["/", "/atlas", "/logros"])

/**
 * Injects the section's visual layer at the end of every public page.
 * The mapping lives in `lib/visuals/catalog.ts`, so a page is wired by adding
 * one entry there rather than by editing markup.
 */
export function PageVisualLayer({ locale = "es" }: { locale?: Locale }) {
  const pathname = usePathname()
  if (SKIP.has(pathname)) return null
  const visuals = visualsFor(pathname)
  const hasContent = Boolean(visuals.video || visuals.plate || visuals.graphs?.length || visuals.mindMap)
  if (!hasContent) return null

  const es = locale === "es"

  return (
    <section className="section visual-layer" aria-labelledby="visual-layer-title">
      <div className="container">
        <header className="visual-layer-head">
          <p className="eyebrow">{es ? "CAPA VISUAL · ATLAS TAMV" : "VISUAL LAYER · TAMV ATLAS"}</p>
          <h2 id="visual-layer-title">
            {es ? "La sección, en una lectura visual" : "The section, as a visual reading"}
          </h2>
          <p>
            {es
              ? "Cápsulas generadas localmente, placas editoriales, grafos declarados y mapas mentales. Cada pieza indica su método y su límite."
              : "Locally generated capsules, editorial plates, declared graphs, and mind maps. Every piece states its method and its limit."}
          </p>
          <div className="visual-layer-links">
            <Link href={`/atlas?lang=${locale}`}>
              {es ? "Abrir el atlas completo" : "Open the full atlas"} <span aria-hidden="true">→</span>
            </Link>
            <Link href={`/logros?lang=${locale}`}>
              {es ? "Ver logros e insignias" : "See achievements and badges"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        {(visuals.video || visuals.plate) && (
          <div className="visual-layer-hero">
            {visuals.video && <VideoCapsule video={visuals.video} locale={locale} />}
            {visuals.plate && <PlateFigure plate={visuals.plate} locale={locale} />}
          </div>
        )}

        {visuals.graphs && visuals.graphs.length > 0 && (
          <div className="graph-grid">
            {visuals.graphs.map((graph) => (
              <VisualGraph key={graph.id} spec={graph} locale={locale} />
            ))}
          </div>
        )}

        {visuals.mindMap && <MindMap mindMap={visuals.mindMap} locale={locale} />}

        <footer className="visual-layer-foot">
          <span>
            {es
              ? `${videos.length} cápsulas · ${plates.length} placas · ${graphs.length} grafos · ${mindMaps.length} mapas mentales`
              : `${videos.length} capsules · ${plates.length} plates · ${graphs.length} graphs · ${mindMaps.length} mind maps`}
          </span>
          <span>{es ? "Sin material de terceros · datos declarados etiquetados" : "No third-party material · declared data is labelled"}</span>
        </footer>
      </div>
    </section>
  )
}
