import type { Locale } from "@/lib/i18n"

type Domain = { id: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; sortOrder: number }
type Atom = { id: string; domainId: string; nameEs: string; nameEn: string; descriptionEs: string; descriptionEn: string; influenceX: number; riskY: number; evidenceZ: number; isProvisional: boolean; isQuarantined: boolean }
type Edge = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; weight: number; sign: number; delayYears: number; tqafLevel: string | null; evidenceStatus: string; sourceTitle: string | null; sourceUrl: string | null }

export function HcuGraph({ graph, locale = "es" }: { graph: { domains: Domain[]; atoms: Atom[]; edges: Edge[] }; locale?: Locale }) {
  const english = locale === "en"
  const atomNames = new Map(graph.atoms.map((atom) => [atom.id, english ? atom.nameEn : atom.nameEs]))
  return (
    <div className="hcu-graph">
      <div className="hcu-domain-grid">
        {graph.domains.map((domain) => {
          const atoms = graph.atoms.filter((atom) => atom.domainId === domain.id)
          return <article className="hcu-domain-card" key={domain.id}>
            <p className="eyebrow">{String(domain.sortOrder).padStart(2, "0")} / {english ? "DOMAIN" : "DOMINIO"}</p>
            <h3>{english ? domain.nameEn : domain.nameEs}</h3>
            <p>{english ? domain.descriptionEn : domain.descriptionEs}</p>
            {atoms.length ? <ul className="hcu-atom-list">
              {atoms.map((atom) => <li key={atom.id}>
                <div><strong>{english ? atom.nameEn : atom.nameEs}</strong><span>{english ? atom.descriptionEn : atom.descriptionEs}</span></div>
                <dl><div><dt>{english ? "Influence" : "Influencia"}</dt><dd>{atom.influenceX}</dd></div><div><dt>{english ? "Risk" : "Riesgo"}</dt><dd>{atom.riskY}</dd></div><div><dt>{english ? "Evidence" : "Evidencia"}</dt><dd>{atom.evidenceZ}</dd></div></dl>
                {atom.isProvisional && <span className="status-pill">{english ? "Provisional" : "Provisional"}</span>}
              </li>)}
            </ul> : <p className="hcu-unmodeled-note">{english ? "Reference domain only; no modeled atoms, indicators, or relationships yet." : "Dominio de referencia; aún no tiene átomos, indicadores ni relaciones modeladas."}</p>}
          </article>
        })}
      </div>
      <section className="hcu-edges" aria-labelledby="hcu-edges-title">
        <div className="hcu-section-heading"><p className="eyebrow">{english ? "RELATIONSHIPS & PROVENANCE" : "RELACIONES Y PROCEDENCIA"}</p><h2 id="hcu-edges-title">{english ? "Signals with explicit assumptions." : "Señales con supuestos explícitos."}</h2></div>
        {graph.edges.length ? <div className="hcu-edge-list">{graph.edges.map((edge) => <article className="hcu-edge-card" key={edge.id}>
          <div className="hcu-edge-flow"><strong>{edge.sourceAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")}</strong><span aria-label={edge.sign > 0 ? "influencia positiva" : "influencia negativa"}>{edge.sign > 0 ? "→" : "⊣"}</span><strong>{edge.targetAtomIds.map((id) => atomNames.get(id) ?? id).join(" + ")}</strong></div>
          <div className="hcu-edge-meta"><span>{english ? "Weight" : "Peso"} {edge.weight}</span><span>{english ? "Delay" : "Rezago"} {edge.delayYears} {english ? "years" : "años"}</span><span>{edge.tqafLevel ?? "TQAF —"}</span><span>{edge.evidenceStatus}</span></div>
          <p>{english ? "Source" : "Fuente"}: {edge.sourceUrl ? <a href={edge.sourceUrl} target="_blank" rel="noopener noreferrer">{edge.sourceTitle ?? edge.sourceUrl}</a> : edge.sourceTitle ?? (english ? "Not specified" : "No especificada")}</p>
        </article>)}</div> : <p className="empty-state">{english ? "No public relationships are available." : "No hay relaciones públicas disponibles."}</p>}
      </section>
    </div>
  )
}
