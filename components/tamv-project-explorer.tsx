"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { useState } from "react"
import { projectFilters, type ProjectFilter } from "./tamv-data"
import { projectCategoryLabel, type Locale } from "@/lib/i18n"
import type { researchProjects } from "@/lib/db/schema"

type ResearchProject = typeof researchProjects.$inferSelect

const maturityLabels: Record<string, [string, string]> = {
  vision: ["Visión documentada", "Documented vision"],
  documented: ["Marco documentado", "Documented framework"],
  design: ["Diseño y especificación", "Design and specification"],
  proposal: ["Propuesta técnica", "Technical proposal"],
  prototype: ["Prototipo", "Prototype"],
  pilot: ["Piloto", "Pilot"],
  deployed: ["Desplegado", "Deployed"],
}

const filterLabels: Record<ProjectFilter, [string, string]> = {
  all: ["Todos", "All"],
  architecture: ["Arquitectura", "Architecture"],
  ai: ["IA", "AI"],
  academia: ["Academia", "Academia"],
  territory: ["Territorio", "Place & community"],
}

export function TamvProjectExplorer({ projects, locale = "es" }: { projects: ResearchProject[]; locale?: Locale }) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all")
  const [query, setQuery] = useState("")
  const english = locale === "en"
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const visibleProjects = projects.filter((project) => {
    const matchesCategory = activeFilter === "all" || project.category === activeFilter
    const searchableText = `${project.titleEs} ${project.titleEn} ${project.subtitleEs} ${project.subtitleEn} ${project.descriptionEs} ${project.descriptionEn} ${project.maturity}`.toLocaleLowerCase(locale)
    return matchesCategory && searchableText.includes(normalizedQuery)
  })

  return (
    <div className="project-explorer">
      <div className="explorer-controls">
        <label className="search-field" htmlFor="ecosystem-search">
          <Search aria-hidden="true" />
          <span className="sr-only">{english ? "Search ecosystem components" : "Buscar en los componentes del ecosistema"}</span>
          <input id="ecosystem-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "Search projects, ideas, or capabilities" : "Buscar proyectos, ideas o capacidades"} />
        </label>
        <div className="filter-group" role="group" aria-label={english ? "Filter by work area" : "Filtrar por área de trabajo"}>
          {projectFilters.map((filter) => (
            <button key={filter} type="button" className={activeFilter === filter ? "filter-button is-active" : "filter-button"} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>
              {filterLabels[filter][english ? 1 : 0]}
            </button>
          ))}
        </div>
      </div>
      <p className="results-count" aria-live="polite">{visibleProjects.length} {english ? (visibleProjects.length === 1 ? "component" : "components") : (visibleProjects.length === 1 ? "componente" : "componentes")} {english ? "in this view" : "en esta vista"}</p>
      {visibleProjects.length > 0 ? (
        <div className="project-grid">
          {visibleProjects.map((project, index) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-topline"><span className="project-index">{String(index + 1).padStart(2, "0")}</span><span className="project-category">{projectCategoryLabel(project.category, locale)}</span></div>
              <p className="project-subtitle">{english ? project.subtitleEn : project.subtitleEs}</p>
              <h3><Link href={`/proyectos/${project.slug}?lang=${locale}`}>{english ? project.titleEn : project.titleEs}</Link></h3>
              <p className="project-description">{english ? project.descriptionEn : project.descriptionEs}</p>
              <div className="project-status"><span className="status-dot" aria-hidden="true" /><span>{maturityLabels[project.maturity]?.[english ? 1 : 0] ?? project.maturity}</span></div>
              <details className="project-limits"><summary>{english ? "Scope & limitations" : "Alcance y límites"}</summary><p>{english ? project.limitsEn : project.limitsEs}</p></details>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results" role="status"><p>{english ? "No components match those criteria." : "No encontramos componentes con esos criterios."}</p><button className="text-button" type="button" onClick={() => { setQuery(""); setActiveFilter("all") }}>{english ? "Clear search and filters" : "Limpiar búsqueda y filtros"}</button></div>
      )}
    </div>
  )
}
