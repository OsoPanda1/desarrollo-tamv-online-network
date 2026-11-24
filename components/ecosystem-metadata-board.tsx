"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUpRight, RefreshCw } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type MetadataStatus =
  | "metadata_available"
  | "not_found"
  | "rate_limited"
  | "timeout"
  | "upstream_error"
  | "invalid_response"

type RepositoryMetadata = {
  repositoryId: number
  fullName: string
  url: string
  defaultBranch: string
  archived: boolean
  updatedAt: string
  pushedAt: string | null
  primaryLanguage: string | null
  licenseSpdxId: string | null
}

type MetadataEntry = {
  systemId: string
  name: string
  repository: string
  sourceMetadataStatus: MetadataStatus
  checkedAt: string
  metadata: RepositoryMetadata | null
}

type EcosystemMetadataSnapshot = {
  schemaVersion: "1.0.0"
  checkedAt: string
  scope: string
  systems: MetadataEntry[]
}

const statusLabels: Record<MetadataStatus, [string, string]> = {
  metadata_available: ["Metadatos disponibles", "Metadata available"],
  not_found: ["No encontrado o no público", "Not found or not public"],
  rate_limited: ["Límite de GitHub alcanzado", "GitHub rate limited"],
  timeout: ["Tiempo de espera agotado", "Request timed out"],
  upstream_error: ["Error del proveedor", "Upstream error"],
  invalid_response: ["Respuesta inválida", "Invalid response"],
}

function isMetadataStatus(value: unknown): value is MetadataStatus {
  return ["metadata_available", "not_found", "rate_limited", "timeout", "upstream_error", "invalid_response"].includes(String(value))
}

function isPublicRepositoryUrl(value: unknown): value is string {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return url.protocol === "https:"
      && url.hostname === "github.com"
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && url.pathname.split("/").filter(Boolean).length === 2
  } catch {
    return false
  }
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
}

function isMetadataEntry(value: unknown): value is MetadataEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as Record<string, unknown>
  if (
    typeof entry.systemId !== "string"
    || typeof entry.name !== "string"
    || !isPublicRepositoryUrl(entry.repository)
    || !isMetadataStatus(entry.sourceMetadataStatus)
    || !isDateTime(entry.checkedAt)
  ) return false

  if (entry.metadata === null) return entry.sourceMetadataStatus !== "metadata_available"
  if (!entry.metadata || typeof entry.metadata !== "object" || entry.sourceMetadataStatus !== "metadata_available") return false

  const metadata = entry.metadata as Record<string, unknown>
  const repositorySegments = new URL(entry.repository).pathname.split("/").filter(Boolean)
  const expectedFullName = repositorySegments.join("/")
  return typeof metadata.repositoryId === "number"
    && Number.isInteger(metadata.repositoryId)
    && metadata.repositoryId > 0
    && typeof metadata.fullName === "string"
    && metadata.fullName.toLowerCase() === expectedFullName.toLowerCase()
    && metadata.url === entry.repository
    && isPublicRepositoryUrl(metadata.url)
    && typeof metadata.defaultBranch === "string"
    && typeof metadata.archived === "boolean"
    && isDateTime(metadata.updatedAt)
    && (metadata.pushedAt === null || isDateTime(metadata.pushedAt))
    && (typeof metadata.primaryLanguage === "string" || metadata.primaryLanguage === null)
    && (typeof metadata.licenseSpdxId === "string" || metadata.licenseSpdxId === null)
}

function isSnapshot(value: unknown): value is EcosystemMetadataSnapshot {
  if (!value || typeof value !== "object") return false
  const snapshot = value as Record<string, unknown>
  return snapshot.schemaVersion === "1.0.0"
    && typeof snapshot.checkedAt === "string"
    && typeof snapshot.scope === "string"
    && Array.isArray(snapshot.systems)
    && snapshot.systems.every(isMetadataEntry)
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }) : "—"
}

export function EcosystemMetadataBoard({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [snapshot, setSnapshot] = useState<EcosystemMetadataSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/v1/ecosystem/metadata", { cache: "no-store", signal })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        setError(english
          ? `The metadata endpoint returned HTTP ${response.status}.`
          : `El endpoint de metadatos devolvió HTTP ${response.status}.`)
        setSnapshot(null)
        return
      }
      if (!isSnapshot(body)) {
        setError(english ? "The metadata endpoint returned an unexpected response." : "El endpoint de metadatos devolvió una respuesta inesperada.")
        setSnapshot(null)
        return
      }
      setSnapshot(body)
    } catch {
      if (!signal?.aborted) {
        setError(english
          ? "The ecosystem metadata endpoint could not be reached. Check the deployment."
          : "No fue posible conectar con el endpoint de metadatos del ecosistema. Comprueba el despliegue.")
        setSnapshot(null)
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [english])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const available = snapshot?.systems.filter((system) => system.sourceMetadataStatus === "metadata_available").length ?? 0
  const total = snapshot?.systems.length ?? 0

  return (
    <div className="ecosystem-metadata-board">
      <div className="ecosystem-board-toolbar">
        <div>
          <span className="ecosystem-board-kicker">{english ? "SOURCE METADATA" : "METADATOS DE ORIGEN"}</span>
          <p>{snapshot
            ? (english ? `${available} of ${total} repositories returned public metadata.` : `${available} de ${total} repositorios devolvieron metadatos públicos.`)
            : (english ? "Checks the public GitHub repository record for each catalogued system." : "Consulta el registro público de GitHub para cada sistema catalogado.")}</p>
        </div>
        <button className="button button-outline-dark ecosystem-refresh" type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw aria-hidden="true" className={loading ? "is-spinning" : undefined} />
          {loading ? (english ? "Checking…" : "Consultando…") : (english ? "Refresh metadata" : "Actualizar metadatos")}
        </button>
      </div>

      {error ? <div className="ecosystem-board-state is-error" role="alert">{error}</div> : null}
      {loading && !snapshot ? <div className="ecosystem-board-state" role="status">{english ? "Reading public repository metadata…" : "Consultando metadatos públicos de los repositorios…"}</div> : null}

      {snapshot ? (
        <>
          <div className="ecosystem-metadata-grid">
            {snapshot.systems.map((system) => {
              const metadata = system.metadata
              const status = system.sourceMetadataStatus
              return (
                <article className="ecosystem-metadata-card" key={system.systemId}>
                  <div className="ecosystem-card-topline">
                    <span>{system.systemId}</span>
                    <span className={`ecosystem-metadata-status state-${status}`}>
                      <i aria-hidden="true" />
                      {statusLabels[status][english ? 1 : 0]}
                    </span>
                  </div>
                  <h3>{system.name}</h3>
                  <p className="ecosystem-repository-name">{metadata?.fullName ?? system.repository.replace("https://github.com/", "")}</p>
                  {metadata ? (
                    <dl className="ecosystem-metadata-facts">
                      <div><dt>{english ? "Default branch" : "Rama principal"}</dt><dd>{metadata.defaultBranch}</dd></div>
                      <div><dt>{english ? "Language" : "Lenguaje"}</dt><dd>{metadata.primaryLanguage ?? "—"}</dd></div>
                      <div><dt>{english ? "License metadata" : "Metadatos de licencia"}</dt><dd>{metadata.licenseSpdxId ?? (english ? "Not declared" : "Sin declarar")}</dd></div>
                      <div><dt>{english ? "Repository updated" : "Repositorio actualizado"}</dt><dd>{formatDate(metadata.updatedAt, english ? "en" : "es-MX")}</dd></div>
                    </dl>
                  ) : (
                    <p className="ecosystem-metadata-unavailable">
                      {english
                        ? "Public metadata was not confirmed in this check. The source may be unavailable, rate-limited, private, or returning an invalid response."
                        : "No se confirmaron metadatos públicos en esta consulta. La fuente puede estar inaccesible, limitada, ser privada o devolver una respuesta inválida."}
                    </p>
                  )}
                  {metadata?.archived ? <p className="ecosystem-archived-note">{english ? "Repository is archived." : "El repositorio está archivado."}</p> : null}
                  <a className="ecosystem-repository-link" href={system.repository} target="_blank" rel="noopener noreferrer">
                    {english ? "Open repository" : "Abrir repositorio"} <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              )
            })}
          </div>
          <div className="ecosystem-scope-note">
            <strong>{english ? "What this status means" : "Qué significa este estado"}</strong>
            <p>{snapshot.scope}</p>
            <p>{english
              ? "A successful GitHub metadata response is not an application health check, deployment check, integration test, security audit, or license grant. Source metadata may be cached for up to 15 minutes."
              : "Una respuesta correcta de metadatos de GitHub no es una prueba de salud de la aplicación, despliegue, integración, auditoría de seguridad ni concesión de licencia. Los metadatos de origen pueden tener hasta 15 minutos de antigüedad."}</p>
            <span>{english ? "Snapshot generated" : "Instantánea generada"}: {formatDate(snapshot.checkedAt, english ? "en" : "es-MX")}</span>
          </div>
        </>
      ) : null}
    </div>
  )
}
