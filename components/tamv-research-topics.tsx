"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import type { researchTopics } from "@/lib/db/schema"
import { projectCategoryLabel, type Locale } from "@/lib/i18n"

type ParticipationMode = "join" | "cocreate" | "publish"
type TopicFilter = "all" | ParticipationMode
type ResearchTopic = typeof researchTopics.$inferSelect

const filters: { id: TopicFilter; es: string; en: string }[] = [
  { id: "all", es: "Todos", en: "All" },
  { id: "join", es: "Sumarme", en: "Join" },
  { id: "cocreate", es: "Cocrear", en: "Co-create" },
  { id: "publish", es: "Publicar investigación", en: "Publish research" },
]

export function TamvResearchTopics({ topics, locale = "es" }: { topics: ResearchTopic[]; locale?: Locale }) {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>("all")
  const english = locale === "en"
  const visibleTopics = topics.filter((topic) => activeFilter === "all" || topic.modes.includes(activeFilter))

  return (
    <section className="section research-topics-section" id="temas">
      <div className="container">
        <div className="section-heading-row topics-heading">
          <div>
            <p className="eyebrow">{english ? "06 / COMMUNITY RESEARCH THEMES" : "06 / TEMAS PARA INVESTIGAR EN COMUNIDAD"}</p>
            <h2>{english ? <>Open questions, <em>room to contribute.</em></> : <>Preguntas abiertas, <em>espacio para aportar.</em></>}</h2>
          </div>
          <p>{english ? "Explore TAMV editorial themes, read the research question, and register your interest through the portal. Contributions may develop into collaborations, articles, datasets, theses, or reports." : "Explora líneas editoriales de TAMV, conoce su pregunta y registra tu interés desde el portal. Las propuestas pueden crecer como colaboración, artículo, conjunto de datos, tesis o reporte."}</p>
        </div>

        <div className="topics-toolbar">
          <p className="topics-kicker">{english ? "PROPOSED EDITORIAL THEMES" : "LÍNEAS EDITORIALES PROPUESTAS"}</p>
          <div className="topic-filters" role="group" aria-label={english ? "Filter themes by participation type" : "Filtrar temas por forma de participación"}>
            {filters.map((filter) => (
              <button key={filter.id} type="button" className={activeFilter === filter.id ? "topic-filter is-active" : "topic-filter"} aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>
                {english ? filter.en : filter.es}
              </button>
            ))}
          </div>
        </div>

        <p className="topics-results" aria-live="polite">{visibleTopics.length} {english ? (visibleTopics.length === 1 ? "theme" : "themes") : (visibleTopics.length === 1 ? "tema" : "temas")} {english ? "in this view" : "en esta vista"}</p>

        {visibleTopics.length ? <div className="topic-grid">
          {visibleTopics.map((topic, index) => (
            <article className="topic-card" key={topic.id} aria-labelledby={`topic-${topic.id}`}>
              <div className="topic-card-topline"><span className="topic-number">{String(index + 1).padStart(2, "0")}</span><span className="topic-status">{english ? "PROPOSED THEME" : "TEMA PROPUESTO"}</span></div>
              <p className="topic-area">{projectCategoryLabel(topic.area, locale)}</p>
              <h3 id={`topic-${topic.id}`}>{english ? topic.titleEn : topic.titleEs}</h3>
              <p className="topic-question">{english ? topic.questionEn : topic.questionEs}</p>
              <dl className="topic-details">
                <div><dt>{english ? "WHO CAN CONTRIBUTE" : "QUIÉN PUEDE APORTAR"}</dt><dd>{english ? topic.contributorsEn : topic.contributorsEs}</dd></div>
                <div><dt>{english ? "POSSIBLE FORMATS" : "FORMATOS POSIBLES"}</dt><dd>{english ? topic.formatEn : topic.formatEs}</dd></div>
              </dl>
              <div className="topic-modes" aria-label={english ? "Participation types" : "Formas de participación"}>
                {topic.modes.map((mode) => <span className={`topic-mode topic-mode-${mode}`} key={mode}>{mode === "join" ? (english ? "Join" : "Sumarse") : mode === "cocreate" ? (english ? "Co-create" : "Cocrear") : (english ? "Publish" : "Publicar")}</span>)}
              </div>
              <Link className="topic-action" href={`/investigacion/${topic.slug}?lang=${locale}`}>{english ? "View theme and participate" : "Ver tema y participar"} <ArrowUpRight aria-hidden="true" /></Link>
            </article>
          ))}
        </div> : <p className="empty-state">{english ? "No themes are available in this view." : "No hay temas disponibles en esta vista."}</p>}

        <aside className="topics-invitation" aria-labelledby="topics-invitation-title">
          <div>
            <p className="eyebrow eyebrow-light">{english ? "ALREADY WORKING ON RESEARCH?" : "¿YA TIENES UNA INVESTIGACIÓN EN MARCHA?"}</p>
            <h3 id="topics-invitation-title">{english ? "Let’s discuss how to share it." : "Hablemos de cómo compartirla."}</h3>
            <p>{english ? "Submit a summary, material, or dataset. The first contact helps agree on scope, review, and licensing before anything is shared." : "Presenta un resumen, material o conjunto de datos. El primer contacto sirve para acordar alcance, revisión y licencia antes de cualquier difusión."}</p>
          </div>
          <Link className="button button-copper" href="/portal/propuestas/nueva">{english ? "Propose research" : "Proponer una investigación"} <ArrowUpRight aria-hidden="true" /></Link>
        </aside>

        <p className="topics-editorial-note">{english ? "These are proposed editorial themes, not active calls for submissions. Receiving a proposal does not guarantee publication or peer review; the process, criteria, licenses, and any schedule must be agreed and announced separately. The Zenodo record linked above is not a TAMV community repository." : "Estas líneas son propuestas editoriales, no convocatorias activas. Recibir una propuesta no garantiza publicación ni revisión por pares; el proceso, los criterios, las licencias y cualquier calendario deben acordarse y anunciarse por separado. El registro documental de Zenodo enlazado en la sección anterior no equivale a un repositorio comunitario de TAMV."}</p>
      </div>
    </section>
  )
}
