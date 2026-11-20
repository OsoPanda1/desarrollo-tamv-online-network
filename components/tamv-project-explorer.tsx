"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import {
  ecosystemProjects,
  projectFilters,
  type ProjectFilter,
} from "./tamv-data"

export function TamvProjectExplorer() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("Todos")
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLocaleLowerCase("es")
  const visibleProjects = ecosystemProjects.filter((project) => {
    const matchesCategory = activeFilter === "Todos" || project.category === activeFilter
    const searchableText = `${project.title} ${project.subtitle} ${project.description} ${project.status}`.toLocaleLowerCase("es")
    return matchesCategory && searchableText.includes(normalizedQuery)
  })

  return (
    <div className="project-explorer">
      <div className="explorer-controls">
        <label className="search-field" htmlFor="ecosystem-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar en los componentes del ecosistema</span>
          <input
            id="ecosystem-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar proyectos, ideas o capacidades"
          />
        </label>
        <div className="filter-group" role="group" aria-label="Filtrar por área de trabajo">
          {projectFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "filter-button is-active" : "filter-button"}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <p className="results-count" aria-live="polite">
        {visibleProjects.length} {visibleProjects.length === 1 ? "componente" : "componentes"} en esta vista
      </p>
      {visibleProjects.length > 0 ? (
        <div className="project-grid">
          {visibleProjects.map((project, index) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-topline">
                <span className="project-index">0{index + 1}</span>
                <span className="project-category">{project.category}</span>
              </div>
              <p className="project-subtitle">{project.subtitle}</p>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-status">
                <span className="status-dot" aria-hidden="true" />
                <span>{project.status}</span>
              </div>
              <details className="project-limits">
                <summary>Alcance y límites</summary>
                <p>{project.limit}</p>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results" role="status">
          <p>No encontramos componentes con esos criterios.</p>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setQuery("")
              setActiveFilter("Todos")
            }}
          >
            Limpiar búsqueda y filtros
          </button>
        </div>
      )}
    </div>
  )
}
