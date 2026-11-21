import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Users } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { getPublicResearchTopics } from "@/lib/research/queries"
import { resolveLocale } from "@/lib/i18n"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Research and open themes", description: "Bilingual TAMV editorial topics for collaboration, data, publications, and academic work." }
    : { title: "Investigación y temas abiertos", description: "Líneas editoriales bilingües de TAMV para colaboración, datos, publicaciones y trabajo académico." }
}

export default async function ResearchIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const topics = await getPublicResearchTopics()
  return <TamvAppShell locale={locale}>
    <PageIntro number="01" eyebrow={english ? "RESEARCH & OPEN QUESTIONS" : "INVESTIGACIÓN Y PREGUNTAS ABIERTAS"} title={english ? "Research with room" : "Investigar con espacio"} accent={english ? "to contribute." : "para aportar."} description={english ? "Browse bilingual editorial topics, learn what evidence is needed, and register your interest privately. A topic is not a call for papers or a promise of publication." : "Explora temas editoriales bilingües, identifica qué evidencia se necesita y registra tu interés de forma privada. Un tema no es una convocatoria ni una promesa de publicación."} locale={locale} actions={<LanguageSwitch pathname="/investigacion" locale={locale} />} />
    <section className="section public-list-section"><div className="container">
      <div className="public-list-heading"><div><p className="eyebrow">{english ? "EDITORIAL AGENDA" : "AGENDA EDITORIAL"}</p><h2>{english ? "Six questions, multiple ways in." : "Seis preguntas, varias formas de entrar."}</h2></div><p>{english ? "Each topic includes a question, suggested contributors, and formats. The catalog is maintained as source data and served through a versioned API." : "Cada tema incluye una pregunta, perfiles que pueden aportar y formatos posibles. El catálogo se mantiene como dato fuente y se sirve mediante una API versionada."}</p></div>
      <div className="topic-directory-grid">{topics.map((topic, index) => <article className="directory-card" key={topic.id}>
        <div className="directory-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span className="status-pill">{english ? "Proposed topic" : "Tema propuesto"}</span></div>
        <p className="topic-area">{topic.area}</p>
        <h2><Link href={`/investigacion/${topic.slug}?lang=${locale}`}>{english ? topic.titleEn : topic.titleEs}</Link></h2>
        <p className="directory-question">{english ? topic.questionEn : topic.questionEs}</p>
        <div className="directory-card-bottom"><span><Users aria-hidden="true" /> {english ? "Contributor profiles" : "Perfiles colaboradores"}</span><span><BookOpen aria-hidden="true" /> {topic.modes.length} {english ? "participation modes" : "formas de participar"}</span></div>
        <Link className="text-link" href={`/investigacion/${topic.slug}?lang=${locale}`}>{english ? "Explore this topic" : "Explorar el tema"} <ArrowUpRight aria-hidden="true" /></Link>
      </article>)}</div>
      <div className="api-callout"><div><p className="eyebrow">{english ? "OPEN METADATA" : "METADATOS ABIERTOS"}</p><h3>{english ? "Build with the same catalog." : "Construye sobre el mismo catálogo."}</h3><p>{english ? "Read the topics from the public API or export FAIR-oriented metadata." : "Consulta los temas por API pública o descarga metadatos orientados a FAIR."}</p></div><Link className="button button-outline-light" href="/desarrolladores">{english ? "API documentation" : "Documentación API"} <ArrowUpRight aria-hidden="true" /></Link></div>
    </div></section>
    <section className="section research-cta-section"><div className="container"><div className="research-cta"><div><p className="eyebrow eyebrow-light">{english ? "HAVE YOUR OWN QUESTION?" : "¿TIENES UNA PREGUNTA PROPIA?"}</p><h2>{english ? "Bring a proposal, thesis, dataset, or working prototype." : "Trae una propuesta, tesis, conjunto de datos o prototipo."}</h2><p>{english ? "New submissions remain private by default; authors choose whether an accepted abstract may become public." : "Los envíos nuevos son privados por defecto; la persona autora decide si un resumen aceptado puede hacerse público."}</p></div><Link className="button button-copper" href="/portal/propuestas/nueva">{english ? "Start a submission" : "Iniciar propuesta"} <ArrowUpRight aria-hidden="true" /></Link></div></div></section>
  </TamvAppShell>
}
