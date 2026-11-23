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
import { getPublicHcuGraph, getUserHcuModel } from "@/lib/research/queries"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "HCU map and exploratory simulator", description: "An interactive HCU graph with sources, private drafts, and reproducible researcher simulations." }
    : { title: "Mapa HCU y simulador exploratorio", description: "Mapa HCU interactivo con fuentes, borradores privados y simulaciones reproducibles." }
}

export default async function HcuPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const [{ domains, atoms, edges }, session] = await Promise.all([getPublicHcuGraph(), getServerSession()])
  const privateModel = session?.user ? await getUserHcuModel(session.user.id) : { atoms: [], edges: [] }
  const simulationAtoms = [...atoms, ...privateModel.atoms]
  const graph = {
    domains: domains.map(({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder }) => ({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder })),
    atoms: atoms.map(({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined }) => ({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined })),
    edges: edges.map(({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl }) => ({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl })),
  }
  return <TamvAppShell locale={locale}>
    <PageIntro number="03" eyebrow={english ? "HCU / HUMAN-CENTRIC UNIFIED MAP" : "HCU / MAPA UNIFICADO CENTRADO EN LAS PERSONAS"} title={english ? "A map of" : "Un mapa de"} accent={english ? "declared relationships." : "relaciones declaradas."} description={english ? "The public graph connects research, governance, identity, learning, AI, and place. Every edge exposes its source and evidence status; the simulator is exploratory, not causal." : "El grafo público conecta investigación, gobernanza, identidad, aprendizaje, IA y territorio. Cada relación expone fuente y estado de evidencia; el simulador es exploratorio, no causal."} locale={locale} actions={<div className="hcu-page-actions"><LanguageSwitch pathname="/hcu" locale={locale} />{session?.user && <Link className="button button-outline-light" href="/portal/hcu">{english ? "Private model" : "Modelo privado"} <ArrowUpRight aria-hidden="true" /></Link>}</div>} />
    <section className="section hcu-overview-section"><div className="container"><div className="hcu-overview-grid">
      <article><span>{domains.length.toString().padStart(2, "0")}</span><h2>{english ? "registered domains" : "dominios registrados"}</h2><p>{english ? "Current public graph records." : "Registros vigentes del grafo público."}</p></article>
      <article><span>{atoms.length.toString().padStart(2, "0")}</span><h2>{english ? "provisional atoms" : "átomos provisionales"}</h2><p>{english ? "Inputs for the exploratory model." : "Entradas para el modelo exploratorio."}</p></article>
      <article><span>{edges.length.toString().padStart(2, "0")}</span><h2>{english ? "hypothesized relations" : "relaciones hipotéticas"}</h2><p>{english ? "Not causal claims or evaluated outcomes." : "No son afirmaciones causales ni resultados evaluados."}</p></article>
    </div><div className="detail-note hcu-gap-note"><strong>{english ? "Master-document reconciliation" : "Conciliación con el documento maestro"}</strong><span>{english ? "The public graph includes seven reference areas. Economy and participation is a documentary placeholder with no quantified atoms or relationships; it does not enter simulations until reviewed indicators are defined. The public graph endpoint publishes a SHA3-512 snapshot digest without a signature or external anchor." : "El grafo público incorpora siete ámbitos de referencia. Economía y participación aparece como dominio documental sin átomos ni relaciones cuantificadas; no participa en la simulación hasta definir indicadores revisados. La API pública publica una huella SHA3-512 del snapshot, sin firma ni anclaje externo."}</span></div></div></section>
    <section className="section hcu-map-section"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">{english ? "PUBLIC HYPERGRAPH" : "HIPERGRAFO PÚBLICO"}</p><h2>{english ? "Visible inputs. Explicit gaps." : "Entradas visibles. Vacíos explícitos."}</h2></div><p>{english ? "Values are declared by the project and marked provisional. They are not independently measured." : "Los valores se declaran en el proyecto y se marcan provisionales. No son mediciones independientes."}</p></div><HcuGraph graph={graph} locale={locale} /><p className="hcu-integrity-link">{english ? "Current public graph digest:" : "Huella del grafo público actual:"} <Link href="/api/v1/hcu/graph" target="_blank" rel="noopener noreferrer">{english ? "Open the snapshot and SHA3-512 metadata" : "Consultar snapshot y metadatos SHA3-512"} <ArrowUpRight aria-hidden="true" /></Link></p></div></section>
    <section className="section hcu-simulation-section" id="simulador"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">{english ? "REPRODUCIBLE EXPLORATION" : "EXPLORACIÓN REPRODUCIBLE"}</p><h2>{english ? "Test assumptions, not outcomes." : "Explora supuestos, no resultados."}</h2></div><p>{english ? "Each run stores its model version, seed, input digest, output digest, and annual percentile range in your private portal." : "Cada ejecución conserva versión del modelo, semilla, resumen de entrada, resumen de salida y rango anual en tu portal privado."}</p></div><HcuSimulator atoms={simulationAtoms.map(({ id, nameEs, nameEn, isQuarantined }) => ({ id, nameEs, nameEn, isQuarantined }))} loggedIn={Boolean(session?.user)} locale={locale} /></div></section>
    <section className="section hcu-spec-section"><div className="container hcu-spec-card"><div><p className="eyebrow eyebrow-light">{english ? "METHOD REFERENCE" : "REFERENCIA METODOLÓGICA"}</p><h2>{english ? "The instrument is not the full architecture." : "El instrumento no es toda la arquitectura."}</h2><p>{english ? "This version includes the public graph, private researcher drafts, TQAF review records, and authenticated simulations. It does not execute the complete L01–L14 agent runtime, external actions, digital signatures, or external anchoring described in the supplied architecture documents." : "Esta versión incluye el grafo público, borradores privados de investigación, evaluaciones TQAF y simulaciones autenticadas. No ejecuta el runtime de agentes L01–L14 completo, efectos externos, firmas digitales ni anclajes externos descritos en los documentos de arquitectura."}</p><p>{english ? "Runs include the source-graph SHA3-512 digest, normalized inputs, a model version, and an output SHA-256 digest. These local checks cannot detect a complete rewrite without an external anchor and are not cryptographic certificates." : "Cada corrida incluye huella SHA3-512 del grafo fuente, entradas normalizadas, versión del modelo y hash SHA-256 de salida. Son controles locales: sin un ancla externa no detectan una reescritura completa ni constituyen certificados criptográficos."}</p></div><div className="hcu-spec-actions"><Link className="button button-copper" href="https://doi.org/10.5281/zenodo.19436662" target="_blank" rel="noopener noreferrer">{english ? "Open master reference" : "Consultar referencia maestra"} <ArrowUpRight aria-hidden="true" /></Link><Link className="text-link" href="/desarrolladores">{english ? "Read API documentation" : "Ver documentación API"} <ArrowUpRight aria-hidden="true" /></Link></div></div></section>
  </TamvAppShell>
}
