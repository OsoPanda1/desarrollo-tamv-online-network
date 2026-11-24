"use client"

import { useState, type FormEvent } from "react"
import { ArrowUpRight, Search } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type SearchType = "research" | "organizations"

type ResearchResult = {
  id: string
  provider: string
  title: string
  url: string
  doi: string | null
  year: number | null
  authors: string[]
  venue: string | null
  resourceType: string | null
  citedByCount: number | null
  license: string | null
  openAccess: boolean | null
  evidenceClass: string
  retrievedAt: string
}

type ProviderState = {
  id: string
  name: string
  status: "ok" | "empty" | "unavailable" | "not_configured" | "link_only"
  count: number
  note?: string
}

type SuccessResponse = {
  ok: true
  query: string
  type: SearchType
  retrievedAt: string
  results: ResearchResult[]
  providers: ProviderState[]
  methodology: string
  semantics: string
}

type ErrorResponse = {
  ok: false
  error?: string
  issues?: Array<{ path: string; message: string }>
}

function isResearchResult(value: unknown): value is ResearchResult {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  const safeUrl = typeof item.url === "string" && (item.url === "" || (() => {
    try {
      const url = new URL(item.url)
      return url.protocol === "https:" && !url.username && !url.password
    } catch {
      return false
    }
  })())
  return typeof item.id === "string"
    && typeof item.provider === "string"
    && typeof item.title === "string"
    && safeUrl
    && (typeof item.doi === "string" || item.doi === null)
    && (typeof item.year === "number" || item.year === null)
    && Array.isArray(item.authors) && item.authors.every((author) => typeof author === "string")
    && (typeof item.venue === "string" || item.venue === null)
    && (typeof item.resourceType === "string" || item.resourceType === null)
    && (typeof item.citedByCount === "number" || item.citedByCount === null)
    && (typeof item.license === "string" || item.license === null)
    && (typeof item.openAccess === "boolean" || item.openAccess === null)
    && typeof item.evidenceClass === "string"
    && typeof item.retrievedAt === "string"
}

function isProviderState(value: unknown): value is ProviderState {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  return typeof item.id === "string"
    && typeof item.name === "string"
    && ["ok", "empty", "unavailable", "not_configured", "link_only"].includes(String(item.status))
    && typeof item.count === "number"
    && Number.isInteger(item.count)
    && item.count >= 0
    && (item.note === undefined || typeof item.note === "string")
}

function isSuccessResponse(value: unknown): value is SuccessResponse {
  if (!value || typeof value !== "object") return false
  const body = value as Record<string, unknown>
  return body.ok === true
    && typeof body.query === "string"
    && (body.type === "research" || body.type === "organizations")
    && typeof body.retrievedAt === "string"
    && Array.isArray(body.results) && body.results.every(isResearchResult)
    && Array.isArray(body.providers) && body.providers.every(isProviderState)
    && typeof body.methodology === "string"
    && typeof body.semantics === "string"
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return Boolean(value && typeof value === "object" && (value as Record<string, unknown>).ok === false)
}

const providerLabels: Record<ProviderState["status"], [string, string]> = {
  ok: ["Disponible", "Available"],
  empty: ["Sin resultados", "No results"],
  unavailable: ["No disponible", "Unavailable"],
  not_configured: ["No configurado", "Not configured"],
  link_only: ["Enlace externo", "External link"],
}

export function ResearchFederatedSearch({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [query, setQuery] = useState("")
  const [type, setType] = useState<SearchType>("research")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SuccessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  function messageFor(code: string | undefined, status: number): string {
    if (code === "provider_not_configured" || code === "provider_configuration_invalid") {
      return english
        ? "The institutional search bridge is not configured for this environment yet."
        : "El puente de búsqueda institucional todavía no está configurado para este entorno."
    }
    if (code === "provider_rate_limited") {
      return english
        ? "The institutional provider has temporarily limited requests. Try again later."
        : "El proveedor institucional limitó temporalmente las solicitudes. Inténtalo más tarde."
    }
    if (code === "provider_timeout" || status === 504) {
      return english
        ? "The institutional provider did not respond within the allowed time."
        : "El proveedor institucional no respondió dentro del tiempo permitido."
    }
    if (status === 415) {
      return english ? "The request format was not accepted." : "El formato de la solicitud no fue aceptado."
    }
    if (status === 413) {
      return english ? "The request is larger than the permitted limit." : "La solicitud supera el límite permitido."
    }
    if (status === 422) {
      return english
        ? "Enter a query of 3–180 characters and remove any unsupported fields."
        : "Introduce una consulta de 3–180 caracteres y elimina los campos no admitidos."
    }
    return english
      ? "The federated search could not be completed. The provider may be unavailable or its response may be invalid."
      : "No se pudo completar la búsqueda federada. El proveedor puede no estar disponible o su respuesta puede ser inválida."
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedQuery = query.trim().replace(/\s+/g, " ")
    if (normalizedQuery.length < 3 || normalizedQuery.length > 180) {
      setResults(null)
      setError(english ? "Enter between 3 and 180 characters." : "Introduce entre 3 y 180 caracteres.")
      return
    }

    setLoading(true)
    setResults(null)
    setError(null)
    try {
      const response = await fetch("/api/v1/research/federated", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: normalizedQuery, type }),
        cache: "no-store",
      })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const code = isErrorResponse(body) ? body.error : undefined
        setError(messageFor(code, response.status))
        return
      }
      if (!isSuccessResponse(body)) {
        setError(english ? "The server returned an unexpected response." : "El servidor devolvió una respuesta inesperada.")
        return
      }
      setResults(body)
    } catch {
      setError(english
        ? "The core service could not be reached. Check the deployment and try again."
        : "No fue posible conectar con el servicio central. Comprueba el despliegue e inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="federated-search">
      <form className="federated-search-form" onSubmit={submit}>
        <label className="federated-query-field">
          <span>{english ? "Search terms" : "Términos de búsqueda"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            minLength={3}
            maxLength={180}
            required
            placeholder={english ? "e.g. open science and territorial memory" : "Ej. ciencia abierta y memoria territorial"}
          />
        </label>
        <label className="federated-type-field">
          <span>{english ? "Catalog" : "Catálogo"}</span>
          <select value={type} onChange={(event) => setType(event.target.value as SearchType)}>
            <option value="research">{english ? "Research records" : "Registros de investigación"}</option>
            <option value="organizations">{english ? "Organizations (ROR)" : "Organizaciones (ROR)"}</option>
          </select>
        </label>
        <button className="button button-copper federated-submit" type="submit" disabled={loading}>
          <Search aria-hidden="true" />
          {loading
            ? (english ? "Searching…" : "Buscando…")
            : (english ? "Search public metadata" : "Buscar metadatos públicos")}
        </button>
      </form>

      <p className="federated-search-boundary">
        {english
          ? "Read-only public metadata. Result order is not a quality score; records do not prove authorship, peer review, accreditation, or permission to reuse linked content."
          : "Metadatos públicos de solo lectura. El orden no es una puntuación de calidad; los registros no prueban autoría, revisión por pares, acreditación ni permiso para reutilizar contenido vinculado."}
      </p>

      {error ? <div className="federated-search-state is-error" role="alert">{error}</div> : null}

      {results ? (
        <section className="federated-search-results" aria-label={english ? "Federated search results" : "Resultados de búsqueda federada"}>
          <div className="federated-results-heading">
            <div>
              <p className="eyebrow">{english ? "FEDERATED RESULTS" : "RESULTADOS FEDERADOS"}</p>
              <h3>{results.results.length} {english ? "records" : "registros"}</h3>
              <p>{english ? "Query:" : "Consulta:"} <strong>{results.query}</strong></p>
            </div>
            <span>{new Date(results.retrievedAt).toLocaleString(english ? "en" : "es-MX")}</span>
          </div>

          <div className="federated-provider-list" aria-label={english ? "Provider status" : "Estado de proveedores"}>
            {results.providers.map((provider) => (
              <div className="federated-provider" key={provider.id}>
                <span className={`federated-provider-dot status-${provider.status}`} aria-hidden="true" />
                <strong>{provider.name}</strong>
                <span>{providerLabels[provider.status][english ? 1 : 0]}</span>
                <small>{provider.count}</small>
              </div>
            ))}
          </div>

          {results.results.length ? (
            <div className="federated-record-list">
              {results.results.map((item) => (
                <article className="federated-record" key={`${item.provider}:${item.id}`}>
                  <div className="federated-record-meta">
                    <span>{item.provider}</span>
                    {item.year ? <span>{item.year}</span> : null}
                    {item.openAccess === true ? <span>{english ? "Open access declared" : "Acceso abierto declarado"}</span> : null}
                  </div>
                  <h4>{item.url
                    ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<ArrowUpRight aria-hidden="true" /></a>
                    : item.title}</h4>
                  {item.authors.length ? <p>{item.authors.join(", ")}</p> : null}
                  {item.venue ? <p className="federated-record-venue">{item.venue}{item.resourceType ? ` · ${item.resourceType}` : ""}</p> : null}
                  {item.doi ? <p className="federated-record-doi">DOI: {item.doi}</p> : null}
                  <p className="federated-record-evidence">{item.evidenceClass}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="federated-search-state" role="status">
              {english ? "No records matched this query in the providers that responded." : "Ningún registro coincidió con esta consulta en los proveedores que respondieron."}
            </div>
          )}

          <p className="federated-methodology">{results.methodology}</p>
          <p className="federated-methodology">{results.semantics}</p>
        </section>
      ) : null}
    </div>
  )
}
