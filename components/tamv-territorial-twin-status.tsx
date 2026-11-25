import { Clock3, Compass, Database, Radar, ShieldCheck } from "lucide-react"
import type { Locale } from "@/lib/i18n"

const layers = [
  {
    id: "spatial", icon: Compass, code: "D1",
    es: "Capa espacial", en: "Spatial layer",
    detailEs: "Mineral del Monte / Real del Monte como ámbito territorial.",
    detailEn: "Mineral del Monte / Real del Monte as the territorial scope.",
    sourceEs: "El territorio de referencia está documentado; no implica un mapa dinámico conectado.",
    sourceEn: "The reference territory is documented; this does not imply a connected dynamic map.",
  },
  {
    id: "time", icon: Clock3, code: "D2",
    es: "Capa temporal", en: "Temporal layer",
    detailEs: "Marcas de tiempo, secuencias y evolución de eventos.",
    detailEn: "Timestamps, sequences, and event evolution.",
    sourceEs: "No hay un feed de eventos territoriales enlazado a esta interfaz.",
    sourceEn: "No territorial event feed is connected to this interface.",
  },
  {
    id: "sensing", icon: Radar, code: "D3",
    es: "Capa de observación", en: "Observation layer",
    detailEs: "Sensores, imágenes y reportes ciudadanos con procedencia.",
    detailEn: "Sensors, imagery, and citizen reports with provenance.",
    sourceEs: "Sensores, cámaras, Vision-Guard y Pulse-Sentinel no tienen una fuente pública integrada aquí.",
    sourceEn: "Sensors, cameras, Vision-Guard, and Pulse-Sentinel have no public source integrated here.",
  },
  {
    id: "evidence", icon: Database, code: "D4",
    es: "Capa de evidencia y política", en: "Evidence and policy layer",
    detailEs: "Política de decisión, límites de autoridad y registros auditables.",
    detailEn: "Decision policy, authority boundaries, and auditable records.",
    sourceEs: "La conexión de incidentes con CROWN / BookPI no está expuesta por un endpoint público verificado.",
    sourceEn: "Incident integration with CROWN / BookPI is not exposed through a verified public endpoint.",
  },
] as const

export function TamvTerritorialTwinStatus({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  return (
    <section className="sovereign-twin-panel" id="territorial-twin" aria-labelledby="territorial-twin-title">
      <div className="sovereign-panel-topline"><span><Compass aria-hidden="true" /> RDM DIGITAL / TERRITORIAL TWIN</span><span className="sovereign-demo-label">{english ? "CONNECTOR READINESS" : "PREPARACIÓN DE CONECTORES"}</span></div>
      <div className="sovereign-twin-heading">
        <div><p className="sovereign-kicker"><span>05</span> {english ? "CANONICAL TERRITORIAL USE CASE" : "CASO DE USO TERRITORIAL CANÓNICO"}</p><h3 id="territorial-twin-title">{english ? "A four-dimensional model, with honest data boundaries." : "Un modelo de cuatro dimensiones con límites de datos explícitos."}</h3></div>
        <div className="sovereign-twin-status"><ShieldCheck aria-hidden="true" /><span>{english ? "Not yet live" : "Aún no está en vivo"}</span></div>
      </div>
      <p className="sovereign-twin-intro">{english ? "The intended twin combines place, time, observation, and evidence governance. The status below shows which public data connectors this homepage can actually rely on; it is not a simulated sensor dashboard." : "El gemelo previsto combina lugar, tiempo, observación y gobernanza de evidencia. El estado indica qué conectores públicos puede usar realmente esta portada; no es un tablero de sensores simulado."}</p>
      <div className="sovereign-twin-layers">{layers.map((layer) => {
        const Icon = layer.icon
        return <article key={layer.id}><div className="sovereign-twin-layer-top"><span>{layer.code}</span><Icon aria-hidden="true" /></div><h4>{english ? layer.en : layer.es}</h4><p>{english ? layer.detailEn : layer.detailEs}</p><div className="sovereign-twin-source-state"><i aria-hidden="true" />{english ? layer.sourceEn : layer.sourceEs}</div></article>
      })}</div>
      <div className="sovereign-twin-footer"><a href="https://github.com/OsoPanda1/visitarealdelmonte" target="_blank" rel="noopener noreferrer">{english ? "RDM Digital source repository" : "Repositorio fuente de RDM Digital"} <span>↗</span></a><small>{english ? "No cameras, sensor feeds, incident dispatch, or personal data are accessed by this panel." : "Este panel no accede a cámaras, sensores, despacho de incidentes ni datos personales."}</small></div>
    </section>
  )
}
