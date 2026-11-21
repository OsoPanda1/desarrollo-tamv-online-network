import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { InterestForm } from "@/components/research/interest-form"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { getServerSession } from "@/lib/auth-helpers"
import { resolveLocale } from "@/lib/i18n"
import { getPublicResearchTopic } from "@/lib/research/queries"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const topic = await getPublicResearchTopic(slug)
  const english = resolveLocale(query.lang) === "en"
  return topic
    ? { title: english ? topic.titleEn : topic.titleEs, description: english ? topic.questionEn : topic.questionEs }
    : { title: english ? "Research topic" : "Tema de investigación" }
}

export default async function ResearchTopicPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const locale = resolveLocale(query.lang)
  const english = locale === "en"
  const [topic, session] = await Promise.all([getPublicResearchTopic(slug), getServerSession()])
  if (!topic) notFound()
  const title = english ? topic.titleEn : topic.titleEs
  return <TamvAppShell locale={locale}>
    <PageIntro number="01" eyebrow={english ? "RESEARCH TOPIC" : "TEMA DE INVESTIGACIÓN"} title={title} description={english ? topic.questionEn : topic.questionEs} locale={locale} actions={<><LanguageSwitch pathname={`/investigacion/${topic.slug}`} locale={locale} /><Link className="text-link" href={`/investigacion?lang=${locale}`}><ArrowLeft aria-hidden="true" /> {english ? "All research topics" : "Todos los temas"}</Link></>} />
    <section className="section public-detail-section"><div className="container detail-layout">
      <div className="detail-main">
        <p className="eyebrow">{topic.area}</p>
        <h2>{english ? "Research question" : "Pregunta de investigación"}</h2>
        <p className="detail-lead">{english ? topic.questionEn : topic.questionEs}</p>
        <div className="detail-block"><h3>{english ? "Who may contribute" : "Quién puede aportar"}</h3><p>{english ? topic.contributorsEn : topic.contributorsEs}</p></div>
        <div className="detail-block"><h3>{english ? "Possible formats" : "Formatos posibles"}</h3><p>{english ? topic.formatEn : topic.formatEs}</p></div>
        <div className="topic-modes detail-modes">{topic.modes.map((mode) => <span className={`topic-mode topic-mode-${mode}`} key={mode}>{mode === "join" ? (english ? "Join" : "Sumarse") : mode === "cocreate" ? (english ? "Co-create" : "Cocrear") : (english ? "Publish" : "Publicar")}</span>)}</div>
        <div className="detail-note"><strong>{english ? "Editorial status" : "Estado editorial"}</strong><span>{english ? "Proposed topic. This is not an active call, peer review, or guarantee of acceptance." : "Tema propuesto. No es convocatoria activa, revisión por pares ni garantía de aceptación."}</span></div>
        <Link className="button button-outline-light" href={`/portal/propuestas/nueva?topic=${encodeURIComponent(topic.id)}`}>{english ? "Submit work for this topic" : "Proponer un trabajo para este tema"} <ArrowUpRight aria-hidden="true" /></Link>
      </div>
      <InterestForm topicId={topic.id} loggedIn={Boolean(session?.user)} locale={locale} />
    </div></section>
  </TamvAppShell>
}
