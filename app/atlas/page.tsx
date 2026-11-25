import type { Metadata } from "next"
import Link from "next/link"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PageIntro } from "@/components/shared/page-intro"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { VideoCapsule } from "@/components/visuals/video-capsule"
import { PlateFigure } from "@/components/visuals/plate-figure"
import { VisualGraph } from "@/components/visuals/graphs"
import { MindMap } from "@/components/visuals/mind-map"
import { TelemetryDeck } from "@/components/visuals/telemetry"
import { graphs, mindMaps, plates, videos } from "@/lib/visuals/catalog"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Visual atlas",
        description:
          "Eight locally generated capsules, twenty editorial plates, twelve graphs, eight mind maps, and a live observability deck.",
      }
    : {
        title: "Atlas visual",
        description:
          "Ocho cápsulas generadas localmente, veinte placas editoriales, doce grafos, ocho mapas mentales y un panel de observabilidad en vivo.",
      }
}

export default async function AtlasPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const es = locale === "es"
  const declaredGraphs = graphs.filter((graph) => !graph.kind.startsWith("telemetry-"))

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="21"
        eyebrow={es ? "ATLAS VISUAL" : "VISUAL ATLAS"}
        title={es ? "Mirar el sistema" : "Seeing the system"}
        accent={es ? "antes de creerlo." : "before believing it."}
        description={
          es
            ? "Un índice visual del proyecto: movimiento, placas, grafos y mapas. Cada pieza declara si es una metáfora, un esquema o una medición real."
            : "A visual index of the project: motion, plates, graphs, and maps. Each piece declares whether it is a metaphor, a schematic, or a real measurement."
        }
        locale={locale}
        actions={<LanguageSwitch pathname="/atlas" locale={locale} />}
      />

      <section className="section atlas-section" id="observabilidad">
        <div className="container">
          <TelemetryDeck locale={locale} />
        </div>
      </section>

      <section className="section atlas-section" id="capsulas">
        <div className="container">
          <header className="atlas-head">
            <p className="eyebrow">{es ? "08 CÁPSULAS" : "08 CAPSULES"}</p>
            <h2>{es ? "Movimiento generado, no comprado" : "Generated motion, not purchased"}</h2>
            <p>
              {es
                ? "Cada cápsula se renderizó localmente con un codificador H.264 y una semilla fija. No hay metraje de archivo, música ni imágenes de terceros."
                : "Each capsule was rendered locally with an H.264 encoder and a fixed seed. There is no stock footage, music, or third-party imagery."}
            </p>
          </header>
          <div className="cinema-grid">
            {videos.map((video) => (
              <VideoCapsule key={video.id} video={video} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section atlas-section" id="placas">
        <div className="container">
          <header className="atlas-head">
            <p className="eyebrow">{es ? "20 PLACAS" : "20 PLATES"}</p>
            <h2>{es ? "Una placa por sección" : "One plate per section"}</h2>
            <p>
              {es
                ? "Composiciones SVG deterministas, sin fuentes incrustadas ni datos rasterizados. Cada placa corresponde a una sección del sitio."
                : "Deterministic SVG compositions, with no embedded fonts or raster data. Each plate corresponds to a section of the site."}
            </p>
          </header>
          <div className="plate-grid">
            {plates.map((plate) => (
              <PlateFigure key={plate.id} plate={plate} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section atlas-section" id="grafos">
        <div className="container">
          <header className="atlas-head">
            <p className="eyebrow">{es ? "12 GRAFOS" : "12 GRAPHS"}</p>
            <h2>{es ? "Estructura visible" : "Visible structure"}</h2>
            <p>
              {es
                ? "Diez grafos declarados y dos gráficas de telemetría en vivo. Los que no son medición lo dicen en la fuente y en la tabla de datos."
                : "Ten declared graphs and two live telemetry charts. Anything that is not a measurement says so in its source line and data table."}
            </p>
          </header>
          <div className="graph-grid graph-grid-atlas">
            {declaredGraphs.map((graph) => (
              <VisualGraph key={graph.id} spec={graph} locale={locale} />
            ))}
          </div>
          <p className="atlas-footnote">
            {es
              ? "Los grafos 09 y 10 viven en el panel de observabilidad de arriba: son mediciones de esta instancia, no ilustraciones."
              : "Graphs 09 and 10 live in the observability deck above: they are measurements from this instance, not illustrations."}
          </p>
        </div>
      </section>

      <section className="section atlas-section" id="mapas">
        <div className="container">
          <header className="atlas-head">
            <p className="eyebrow">{es ? "08 MAPAS MENTALES" : "08 MIND MAPS"}</p>
            <h2>{es ? "Ocho formas de recorrer el método" : "Eight ways through the method"}</h2>
            <p>
              {es
                ? "Cada mapa resume un dominio y sus límites. La lista textual debajo de cada mapa es la versión accesible y completa."
                : "Each map summarises a domain and its limits. The text list under each map is the accessible, complete version."}
            </p>
          </header>
          <div className="mindmap-grid">
            {mindMaps.map((mindMap) => (
              <MindMap key={mindMap.id} mindMap={mindMap} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section atlas-section atlas-closing">
        <div className="container atlas-closing-inner">
          <div>
            <p className="eyebrow">{es ? "RECONOCIMIENTO" : "RECOGNITION"}</p>
            <h2>{es ? "Veinte insignias por hechos verificables" : "Twenty badges for verifiable facts"}</h2>
            <p>
              {es
                ? "El sistema de logros no premia visitas ni respuestas de modelo: cada insignia se calcula con registros de tu cuenta."
                : "The achievement system does not reward visits or model answers: each badge is computed from records in your account."}
            </p>
          </div>
          <Link className="atlas-cta" href={`/logros?lang=${locale}`}>
            {es ? "Ver logros e insignias" : "See achievements and badges"} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </TamvAppShell>
  )
}
