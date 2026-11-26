import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HcuExperience } from "@/components/hcu/hcu-experience"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
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
    ? { title: "HCU 3D observatory and exploratory simulator", description: "Interactive perspective-projected HCU field, evidence-bounded graph analytics, documented sources, assumptions and reproducible researcher simulations." }
    : { title: "Observatorio HCU 3D y simulador exploratorio", description: "Campo HCU tridimensional interactivo, analítica descriptiva del grafo, fuentes documentadas, supuestos explícitos y simulaciones reproducibles por investigador." }
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
    <PageIntro number="03" eyebrow={english ? "HCU / SPATIAL KNOWLEDGE OBSERVATORY" : "HCU / OBSERVATORIO ESPACIAL DE CONOCIMIENTO"} title={english ? "A three-dimensional field of" : "Un universo tridimensional de"} accent={english ? "traceable relationships." : "relaciones trazables."} description={english ? "Explore the public graph as a perspective-projected 3D field with orbital groups, dynamic flows, selectable records, evidence-state filters and descriptive analytics. The geometry is a visual encoding of declarations, not a causal or predictive model." : "Explora el grafo público como un campo 3D en perspectiva con grupos orbitales, flujos dinámicos, registros seleccionables, filtros de evidencia y analítica descriptiva. La geometría codifica declaraciones; no constituye un modelo causal ni predictivo."} locale={locale} actions={<LanguageSwitch pathname="/hcu" locale={locale} />} />
    <section className="section hcu-overview-section"><div className="container"><div className="hcu-overview-grid">
      <article><span>{domains.length.toString().padStart(2, "0")}</span><h2>{english ? "registered domains" : "dominios registrados"}</h2><p>{english ? "Current public graph records." : "Registros vigentes del grafo público."}</p></article>
      <article><span>{atoms.length.toString().padStart(2, "0")}</span><h2>{english ? "modeled atoms" : "átomos modelados"}</h2><p>{english ? "Inputs declared for exploratory analysis." : "Entradas declaradas para el análisis exploratorio."}</p></article>
      <article><span>{edges.length.toString().padStart(2, "0")}</span><h2>{english ? "declared relationships" : "relaciones declaradas"}</h2><p>{english ? "Evidence status is visible; edges are not causal findings." : "El estado de evidencia es visible; no son hallazgos causales."}</p></article>
    </div><div className="detail-note hcu-gap-note"><strong>{english ? "Master-document reconciliation" : "Conciliación con el documento maestro"}</strong><span>{english ? "The public graph includes seven reference areas. Economy and participation is a documentary placeholder with no quantified atoms or relationships; it does not enter simulations until reviewed indicators are defined." : "El grafo público incorpora siete ámbitos de referencia. Economía y participación aparece como dominio documental sin átomos ni relaciones cuantificadas; no participa en la simulación hasta definir indicadores revisados."}</span></div></div></section>
    <section className="section"><div className="container"><div className="detail-note hcu-gap-note"><strong>{english ? "Hub seed, declared as hypothesis" : "Semilla del hub, declarada como hipótesis"}</strong><span>{english ? "A declared seed file for the hub HCU graph (6 domains, 26 atoms, 8 hyperedges) is now part of the repository. Values are hypotheses from the author's prototypes, not independent measurements, and the seed is pending application to the database. " : "Un archivo de semilla declarada del grafo HCU del hub (6 dominios, 26 átomos, 8 hiperaristas) forma parte ahora del repositorio. Los valores son hipótesis de los prototipos del autor, no mediciones independientes, y la semilla está pendiente de aplicar a la base de datos. "}<Link className="text-link" href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/main/docs/architecture/hcu-reconciliation.md" target="_blank" rel="noopener noreferrer">{english ? "Read the reconciliation note" : "Leer la nota de reconciliación"} <ArrowUpRight aria-hidden="true" /></Link></span></div></div></section>
    <HcuExperience graph={graph} loggedIn={Boolean(session?.user)} locale={locale} />
    <section className="section hcu-spec-section"><div className="container hcu-spec-card"><div><p className="eyebrow eyebrow-light">{english ? "METHOD REFERENCE" : "REFERENCIA METODOLÓGICA"}</p><h2>{english ? "The instrument is not the full architecture." : "El instrumento no es toda la arquitectura."}</h2><p>{english ? "This version serves the public graph and authenticated simulation only. It does not execute the complete L01–L14 governed pipeline, external actions, digital signatures, or external anchoring described as future requirements." : "Esta versión sirve el grafo público y la simulación autenticada. No ejecuta el pipeline gobernado L01–L14 completo, efectos externos, firmas digitales ni anclajes externos descritos como requisitos futuros."}</p><p>{english ? "The result hash is a local integrity check. It cannot detect a full rewrite without an external anchor and is not a cryptographic certificate." : "El hash de resultado es un control local de integridad. Sin ancla externa no detecta una reescritura completa ni es un certificado criptográfico."}</p></div><div className="hcu-spec-actions"><Link className="button button-copper" href="https://doi.org/10.5281/zenodo.19436662" target="_blank" rel="noopener noreferrer">{english ? "Open master reference" : "Consultar referencia maestra"} <ArrowUpRight aria-hidden="true" /></Link><Link className="text-link" href="/desarrolladores">{english ? "Read API documentation" : "Ver documentación API"} <ArrowUpRight aria-hidden="true" /></Link></div><div className="detail-note hcu-gap-note"><strong>{english ? "Note on the DOI" : "Nota sobre el DOI"}</strong><span>{english ? "DOI 10.5281/zenodo.19436662 carries a triple attribution in the documents: the Atlas (Atlas V4, header), the Conceptual Consistency Evaluation of Isabella V1.0 (Atlas V4, §XV), and the OSF project “TAMV Paradigm & RDM Digital Hub” (OSF, §V); the Master Manual assigns that same Evaluation to DOI 10.5281/zenodo.20606361." : "El DOI 10.5281/zenodo.19436662 tiene triple atribución en los documentos: el Atlas (Atlas V4, encabezado), la Evaluación de Consistencia Conceptual de Isabella V1.0 (Atlas V4, §XV) y el proyecto OSF «TAMV Paradigm & RDM Digital Hub» (OSF, §V); el Manual Maestro asigna esa misma Evaluación al DOI 10.5281/zenodo.20606361."}</span></div></div></section>
  <TamvSectionMedia area="hcu" locale={locale} />
      </TamvAppShell>
}
