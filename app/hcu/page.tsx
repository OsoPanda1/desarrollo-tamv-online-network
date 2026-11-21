import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HcuGraph } from "@/components/hcu/hcu-graph"
import { HcuSimulator } from "@/components/hcu/hcu-simulator"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { getServerSession } from "@/lib/auth-helpers"
import { resolveLocale } from "@/lib/i18n"
import { getPublicHcuGraph } from "@/lib/research/queries"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "HCU map and exploratory simulator", description: "A public HCU graph with sources, assumptions, and reproducible simulations saved to each researcher's account." }
    : { title: "Mapa HCU y simulador exploratorio", description: "Mapa público HCU con fuentes, supuestos y simulaciones reproducibles almacenadas por investigador." }
}

export default async function HcuPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const [{ domains, atoms, edges }, session] = await Promise.all([getPublicHcuGraph(), getServerSession()])
  const graph = {
    domains: domains.map(({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder }) => ({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder })),
    atoms: atoms.map(({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined }) => ({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined })),
    edges: edges.map(({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl }) => ({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl })),
  }
  return <TamvAppShell locale={locale}>
    <PageIntro number="03" eyebrow={english ? "HCU / HUMAN-CENTRIC UNIFIED MAP" : "HCU / MAPA UNIFICADO CENTRADO EN LAS PERSONAS"} title={english ? "A map of" : "Un mapa de"} accent={english ? "declared relationships." : "relaciones declaradas."} description={english ? "The public graph connects research, governance, identity, learning, AI, and place. Every edge exposes its source and evidence status; the simulator is exploratory, not causal." : "El grafo público conecta investigación, gobernanza, identidad, aprendizaje, IA y territorio. Cada relación expone fuente y estado de evidencia; el simulador es exploratorio, no causal."} locale={locale} actions={<LanguageSwitch pathname="/hcu" locale={locale} />} />
    <section className="section hcu-overview-section"><div className="container"><div className="hcu-overview-grid">
      <article><span>{domains.length.toString().padStart(2, "0")}</span><h2>{english ? "registered domains" : "dominios registrados"}</h2><p>{english ? "Current public graph records." : "Registros vigentes del grafo público."}</p></article>
      <article><span>{atoms.length.toString().padStart(2, "0")}</span><h2>{english ? "provisional atoms" : "átomos provisionales"}</h2><p>{english ? "Inputs for the exploratory model." : "Entradas para el modelo exploratorio."}</p></article>
      <article><span>{edges.length.toString().padStart(2, "0")}</span><h2>{english ? "hypothesized relations" : "relaciones hipotéticas"}</h2><p>{english ? "Not causal claims or evaluated outcomes." : "No son afirmaciones causales ni resultados evaluados."}</p></article>
    </div><div className="detail-note hcu-gap-note"><strong>{english ? "Master-document reconciliation" : "Conciliación con el documento maestro"}</strong><span>{english ? "The public graph includes seven reference areas. Economy and participation is a documentary placeholder with no quantified atoms or relationships; it does not enter simulations until reviewed indicators are defined." : "El grafo público incorpora siete ámbitos de referencia. Economía y participación aparece como dominio documental sin átomos ni relaciones cuantificadas; no participa en la simulación hasta definir indicadores revisados."}</span></div></div></section>
    <section className="section hcu-map-section"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">{english ? "PUBLIC HYPERGRAPH" : "HIPERGRAFO PÚBLICO"}</p><h2>{english ? "Visible inputs. Explicit gaps." : "Entradas visibles. Vacíos explícitos."}</h2></div><p>{english ? "Values are declared by the project and marked provisional. They are not independently measured." : "Los valores se declaran en el proyecto y se marcan provisionales. No son mediciones independientes."}</p></div><HcuGraph graph={graph} locale={locale} /></div></section>
    <section className="section hcu-simulation-section" id="simulador"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">{english ? "REPRODUCIBLE EXPLORATION" : "EXPLORACIÓN REPRODUCIBLE"}</p><h2>{english ? "Test assumptions, not outcomes." : "Explora supuestos, no resultados."}</h2></div><p>{english ? "Each run stores its model version, seed, input digest, output digest, and annual percentile range in your private portal." : "Cada ejecución conserva versión del modelo, semilla, resumen de entrada, resumen de salida y rango anual en tu portal privado."}</p></div><HcuSimulator atoms={graph.atoms.map(({ id, nameEs, nameEn, isQuarantined }) => ({ id, nameEs, nameEn, isQuarantined }))} loggedIn={Boolean(session?.user)} locale={locale} /></div></section>
    <section className="section hcu-spec-section"><div className="container hcu-spec-card"><div><p className="eyebrow eyebrow-light">{english ? "METHOD REFERENCE" : "REFERENCIA METODOLÓGICA"}</p><h2>{english ? "The instrument is not the full architecture." : "El instrumento no es toda la arquitectura."}</h2><p>{english ? "This version serves the public graph and authenticated simulation only. It does not execute the complete L01–L14 governed pipeline, external actions, digital signatures, or external anchoring described as future requirements." : "Esta versión sirve el grafo público y la simulación autenticada. No ejecuta el pipeline gobernado L01–L14 completo, efectos externos, firmas digitales ni anclajes externos descritos como requisitos futuros."}</p><p>{english ? "The result hash is a local integrity check. It cannot detect a full rewrite without an external anchor and is not a cryptographic certificate." : "El hash de resultado es un control local de integridad. Sin ancla externa no detecta una reescritura completa ni es un certificado criptográfico."}</p></div><div className="hcu-spec-actions"><Link className="button button-copper" href="https://doi.org/10.5281/zenodo.19436662" target="_blank" rel="noopener noreferrer">{english ? "Open master reference" : "Consultar referencia maestra"} <ArrowUpRight aria-hidden="true" /></Link><Link className="text-link" href="/desarrolladores">{english ? "Read API documentation" : "Ver documentación API"} <ArrowUpRight aria-hidden="true" /></Link></div></div></section>
  </TamvAppShell>
}
