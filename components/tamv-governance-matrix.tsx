"use client"

import { AlertTriangle, Scale } from "lucide-react"
import type { Locale } from "@/lib/i18n"

const controls = [
  { id: "risk", es: "Gestión de riesgo", en: "Risk management" },
  { id: "human-oversight", es: "Supervisión humana", en: "Human oversight" },
  { id: "transparency", es: "Transparencia", en: "Transparency" },
  { id: "traceability", es: "Trazabilidad", en: "Traceability" },
  { id: "data", es: "Gobernanza de datos", en: "Data governance" },
  { id: "integrity", es: "Integridad de evidencia", en: "Evidence integrity" },
  { id: "bias", es: "Sesgo y equidad", en: "Bias and fairness" },
  { id: "security", es: "Seguridad", en: "Security" },
] as const
const jurisdictions = [
  { id: "eu", es: "EU", en: "EU" },
  { id: "us", es: "US", en: "US" },
  { id: "cn", es: "CN", en: "CN" },
  { id: "latam", es: "LATAM", en: "LATAM" },
] as const

export function TamvGovernanceMatrix({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  return (
    <section className="sovereign-governance-matrix" id="latamv-governance" aria-labelledby="latamv-governance-title">
      <div className="sovereign-panel-topline"><span><Scale aria-hidden="true" /> LATAMV / GOVERNANCE</span><span className="sovereign-demo-label">{english ? "EVIDENCE NOT CONNECTED" : "EVIDENCIA NO CONECTADA"}</span></div>
      <div className="sovereign-governance-heading">
        <div><h3 id="latamv-governance-title">{english ? "Eight universal control areas" : "Ocho áreas de control universal"}</h3><p>{english ? "A structured review matrix, not a legal compliance verdict." : "Una matriz de revisión estructurada, no un dictamen de cumplimiento jurídico."}</p></div>
        <div className="sovereign-governance-count"><span>08</span><small>{english ? "CONTROL AREAS" : "ÁREAS DE CONTROL"}</small></div>
      </div>
      <div className="sovereign-governance-table-wrap" tabIndex={0} role="region" aria-label={english ? "Governance comparison table" : "Tabla comparativa de gobernanza"}>
        <table className="sovereign-governance-table">
          <caption>{english ? "Declared governance domains by jurisdiction. All evidence states are unconnected." : "Dominios declarados de gobernanza por jurisdicción. Todos los estados de evidencia permanecen sin conexión."}</caption>
          <thead><tr><th scope="col">{english ? "Control" : "Control"}</th>{jurisdictions.map((jurisdiction) => <th key={jurisdiction.id} scope="col">{english ? jurisdiction.en : jurisdiction.es}</th>)}</tr></thead>
          <tbody>{controls.map((control) => <tr key={control.id}><th scope="row">{english ? control.en : control.es}</th>{jurisdictions.map((jurisdiction) => <td key={jurisdiction.id}><span className="sovereign-evidence-unlinked"><i aria-hidden="true" />{english ? "Unlinked" : "Sin enlace"}</span></td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="sovereign-governance-caveat"><AlertTriangle aria-hidden="true" />{english ? "No jurisdiction-specific legal sources, control assessments, or BookPI receipts are connected. The matrix intentionally avoids green checks, maturity ratings, and statements of compliance. A future live version needs versioned sources, retrieval dates, jurisdiction mapping, reviewer decisions, and verifiable evidence records." : "No hay fuentes jurídicas por jurisdicción, evaluaciones de controles ni recibos BookPI conectados. La matriz evita deliberadamente marcas verdes, puntuaciones de madurez y afirmaciones de cumplimiento. Una versión en vivo necesita fuentes versionadas, fechas de consulta, mapeo jurisdiccional, decisiones de revisión y registros de evidencia verificables."}</p>
    </section>
  )
}
