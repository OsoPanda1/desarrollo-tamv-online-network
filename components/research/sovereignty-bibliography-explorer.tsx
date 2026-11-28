"use client"

import { useDeferredValue, useId, useMemo, useState } from "react"
import { ArrowUpRight, Search } from "lucide-react"
import type { Locale } from "@/lib/i18n"

export type SovereigntyBibliographyRecord = {
  key: string
  title: string
  authors: string
  journal: string
  year: number | null
  doi: string
  url: string | null
  themes: string[]
  line: number
  metadataFlags: string[]
}

const THEME_LABELS: Record<string, { es: string; en: string }> = {
  "sovereignty-concepts": { es: "Conceptos de soberanía", en: "Sovereignty concepts" },
  infrastructure: { es: "Infraestructura y cómputo", en: "Infrastructure and compute" },
  "platforms-power": { es: "Plataformas y poder", en: "Platforms and power" },
  "ai-governance": { es: "Gobernanza de IA", en: "AI governance" },
  "policy-institutions": { es: "Política e instituciones", en: "Policy and institutions" },
  "data-justice": { es: "Justicia de datos y dependencia", en: "Data justice and dependency" },
  "rights-ethics": { es: "Derechos y ética", en: "Rights and ethics" },
  participation: { es: "Participación y comunidad", en: "Participation and community" },
  "security-geopolitics": { es: "Seguridad y geopolítica", en: "Security and geopolitics" },
  "methods-evaluation": { es: "Métodos y evaluación", en: "Methods and evaluation" },
  "indigenous-data": { es: "Gobernanza indígena de datos", en: "Indigenous data governance" },
  unclassified: { es: "Por clasificar", en: "Unclassified" },
}

const FLAG_LABELS: Record<string, { es: string; en: string }> = {
  missing_year: { es: "Año ausente en la fuente", en: "Year missing from source" },
  missing_journal: { es: "Revista ausente en la fuente", en: "Journal missing from source" },
  missing_doi: { es: "DOI ausente en la fuente", en: "DOI missing from source" },
  unsafe_or_invalid_url: { es: "URL no proyectada por seguridad", en: "URL not projected for safety" },
  possibly_incomplete_title: { es: "Título posiblemente incompleto", en: "Possibly incomplete title" },
  source_quote_delimiters: { es: "Delimitadores conservados de la fuente", en: "Source quote delimiters preserved" },
  duplicated_title_phrase: { es: "Frase repetida en el título fuente", en: "Repeated phrase in source title" },
  duplicate_title_different_work: { es: "Título idéntico a otra obra distinta", en: "Title identical to another distinct work" },
}

const PAGE_SIZE = 12

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function SovereigntyBibliographyExplorer({
  records,
  locale,
}: {
  records: SovereigntyBibliographyRecord[]
  locale: Locale
}) {
  const english = locale === "en"
  const searchId = useId()
  const themeId = useId()
  const yearId = useId()
  const sortId = useId()
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [theme, setTheme] = useState("all")
  const [year, setYear] = useState("all")
  const [sort, setSort] = useState("source")
  const [page, setPage] = useState(1)

  const years = useMemo(
    () => [...new Set(records.map((record) => record.year).filter((value): value is number => value !== null))].sort((left, right) => right - left),
    [records],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(deferredQuery.trim())
    const result = records.filter((record) => {
      if (theme !== "all" && !record.themes.includes(theme)) return false
      if (year !== "all" && String(record.year ?? "") !== year) return false
      if (!normalizedQuery) return true
      return normalize(`${record.title} ${record.authors} ${record.journal} ${record.key} ${record.doi}`).includes(normalizedQuery)
    })
    if (sort === "newest") result.sort((left, right) => (right.year ?? 0) - (left.year ?? 0) || left.title.localeCompare(right.title))
    if (sort === "oldest") result.sort((left, right) => (left.year ?? 9999) - (right.year ?? 9999) || left.title.localeCompare(right.title))
    if (sort === "title") result.sort((left, right) => left.title.localeCompare(right.title))
    return result
  }, [deferredQuery, records, sort, theme, year])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function resetFilters() {
    setQuery("")
    setTheme("all")
    setYear("all")
    setSort("source")
    setPage(1)
  }

  return (
    <div className="sovereignty-bibliography">
      <div className="sovereignty-bibliography-toolbar">
        <label className="sovereignty-search" htmlFor={searchId}>
          <Search aria-hidden="true" />
          <span className="sr-only">{english ? "Search the bibliography" : "Buscar en la bibliografía"}</span>
          <input
            id={searchId}
            type="search"
            value={query}
            maxLength={180}
            onChange={(event) => { setQuery(event.target.value); setPage(1) }}
            placeholder={english ? "Title, author, journal, key or DOI" : "Título, autoría, revista, clave o DOI"}
          />
        </label>
        <div className="sovereignty-bibliography-selects">
          <label htmlFor={themeId}>
            <span>{english ? "Theme" : "Tema"}</span>
            <select id={themeId} value={theme} onChange={(event) => { setTheme(event.target.value); setPage(1) }}>
              <option value="all">{english ? "All themes" : "Todos los temas"}</option>
              {Object.entries(THEME_LABELS).map(([id, label]) => <option value={id} key={id}>{english ? label.en : label.es}</option>)}
            </select>
          </label>
          <label htmlFor={yearId}>
            <span>{english ? "Year" : "Año"}</span>
            <select id={yearId} value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }}>
              <option value="all">{english ? "All years" : "Todos los años"}</option>
              {years.map((value) => <option value={value} key={value}>{value}</option>)}
            </select>
          </label>
          <label htmlFor={sortId}>
            <span>{english ? "Order" : "Orden"}</span>
            <select id={sortId} value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}>
              <option value="source">{english ? "Source order" : "Orden de la fuente"}</option>
              <option value="newest">{english ? "Newest first" : "Más recientes"}</option>
              <option value="oldest">{english ? "Oldest first" : "Más antiguas"}</option>
              <option value="title">{english ? "Title A–Z" : "Título A–Z"}</option>
            </select>
          </label>
        </div>
      </div>
      <div className="sovereignty-bibliography-status">
        <p aria-live="polite">
          {english
            ? `${filtered.length} of ${records.length} records · page ${currentPage} of ${pageCount}`
            : `${filtered.length} de ${records.length} registros · página ${currentPage} de ${pageCount}`}
        </p>
        <button type="button" className="text-button" onClick={resetFilters}>{english ? "Reset filters" : "Restablecer filtros"}</button>
      </div>
      {visible.length > 0 ? (
        <ol className="sovereignty-bibliography-list" start={(currentPage - 1) * PAGE_SIZE + 1}>
          {visible.map((record) => (
            <li key={record.key} className="sovereignty-reference">
              <div className="sovereignty-reference-topline">
                <span className="sovereignty-reference-key">{record.key}</span>
                <span>{record.year ?? (english ? "Year not declared" : "Año no declarado")}</span>
              </div>
              <h3>{record.title}</h3>
              <p className="sovereignty-reference-authors">{record.authors || (english ? "Authorship not declared" : "Autoría no declarada")}</p>
              {record.journal && <p className="sovereignty-reference-journal">{record.journal}</p>}
              <div className="sovereignty-reference-themes" aria-label={english ? "Inferred themes" : "Temas inferidos"}>
                {record.themes.map((id) => <span key={id}>{english ? THEME_LABELS[id]?.en ?? id : THEME_LABELS[id]?.es ?? id}</span>)}
              </div>
              {record.metadataFlags.length > 0 && (
                <details className="sovereignty-reference-flags">
                  <summary>{english ? "Source metadata warnings" : "Advertencias de metadatos"}</summary>
                  <ul>{record.metadataFlags.map((flag) => <li key={flag}>{english ? FLAG_LABELS[flag]?.en ?? flag : FLAG_LABELS[flag]?.es ?? flag}</li>)}</ul>
                </details>
              )}
              <div className="sovereignty-reference-links">
                {record.doi && <a href={`https://doi.org/${encodeURIComponent(record.doi)}`} target="_blank" rel="noopener noreferrer">DOI <ArrowUpRight aria-hidden="true" /></a>}
                {record.url && <a href={record.url} target="_blank" rel="noopener noreferrer">{english ? "Declared URL" : "URL declarada"} <ArrowUpRight aria-hidden="true" /></a>}
                <span>{english ? `Source line ${record.line}` : `Línea ${record.line} de la fuente`}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-results">
          <p>{english ? "No records match these filters." : "Ningún registro coincide con estos filtros."}</p>
          <button type="button" className="text-button" onClick={resetFilters}>{english ? "Clear search" : "Limpiar búsqueda"}</button>
        </div>
      )}
      {pageCount > 1 && (
        <nav className="sovereignty-bibliography-pagination" aria-label={english ? "Bibliography pages" : "Páginas de la bibliografía"}>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>{english ? "Previous" : "Anterior"}</button>
          <span>{currentPage} / {pageCount}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>{english ? "Next" : "Siguiente"}</button>
        </nav>
      )}
    </div>
  )
}
