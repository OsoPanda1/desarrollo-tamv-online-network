"use client"

import Link from "next/link"
import { ArrowUpRight, BookOpen, Users } from "lucide-react"
import { useEffect, useState } from "react"
import type { Locale } from "@/lib/i18n"

type LocalizedText = { es: string; en: string }
type TopicRecord = {
  id: string
  slug: string
  area: string
  title: LocalizedText
  question: LocalizedText
  modes: Array<"join" | "cocreate" | "publish" | "funding">
}

function isLocalizedText(value: unknown): value is LocalizedText {
  if (!value || typeof value !== "object") return false
  const text = value as Record<string, unknown>
  return typeof text.es === "string" && text.es.length > 0 && text.es.length <= 2_000
    && typeof text.en === "string" && text.en.length > 0 && text.en.length <= 2_000
}

function isTopicRecord(value: unknown): value is TopicRecord {
  if (!value || typeof value !== "object") return false
  const topic = value as Record<string, unknown>
  return typeof topic.id === "string" && topic.id.length > 0 && topic.id.length <= 120
    && typeof topic.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug) && topic.slug.length <= 160
    && typeof topic.area === "string" && topic.area.length > 0 && topic.area.length <= 160
    && isLocalizedText(topic.title)
    && isLocalizedText(topic.question)
    && Array.isArray(topic.modes)
    && topic.modes.length <= 4
    && new Set(topic.modes).size === topic.modes.length
    && topic.modes.every((mode) => mode === "join" || mode === "cocreate" || mode === "publish" || mode === "funding")
}

export function ResearchTopicCatalog({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [topics, setTopics] = useState<TopicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2_500)
    setLoading(true)
    setUnavailable(false)

    async function loadTopics() {
      try {
        const response = await fetch("/api/v1/research/topics", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        })
        const body: unknown = await response.json().catch(() => null)
        if (!response.ok || !body || typeof body !== "object") throw new Error("catalog_unavailable")
        const payload = body as Record<string, unknown>
        if (payload.version !== "1.0" || !Array.isArray(payload.records) || payload.records.length > 250 || !payload.records.every(isTopicRecord)) {
          throw new Error("catalog_invalid")
        }
        if (active) setTopics(payload.records)
      } catch {
        if (active) {
          setTopics([])
          setUnavailable(true)
        }
      } finally {
        clearTimeout(timer)
        if (active) setLoading(false)
      }
    }

    void loadTopics()
    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [attempt, locale])

  if (loading) {
    return <div className="federated-search-state" role="status">{english ? "Loading the editorial catalog…" : "Cargando el catálogo editorial…"}</div>
  }
  if (unavailable) {
    return <div className="federated-search-state" role="status">
      <p>{english
        ? "The editorial catalog is temporarily unavailable. Public research search below remains available and does not show simulated catalog records."
        : "El catálogo editorial no está disponible temporalmente. La búsqueda pública de investigación sigue disponible y no muestra registros simulados del catálogo."}</p>
      <button className="button button-copper" type="button" onClick={() => setAttempt((value) => value + 1)}>{english ? "Retry catalog" : "Reintentar catálogo"}</button>
    </div>
  }
  if (topics.length === 0) {
    return <div className="federated-search-state" role="status">{english
      ? "There are no open editorial topics published in this catalog yet."
      : "Todavía no hay temas editoriales abiertos publicados en este catálogo."}</div>
  }

  return <div className="topic-directory-grid">{topics.map((topic, index) => {
    const href = `/investigacion/${encodeURIComponent(topic.slug)}?lang=${locale}`
    return <article className="directory-card" key={topic.id}>
      <div className="directory-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span className="status-pill">{english ? "Proposed topic" : "Tema propuesto"}</span></div>
      <p className="topic-area">{topic.area}</p>
      <h2><Link href={href}>{english ? topic.title.en : topic.title.es}</Link></h2>
      <p className="directory-question">{english ? topic.question.en : topic.question.es}</p>
      <div className="directory-card-bottom"><span><Users aria-hidden="true" /> {english ? "Contributor profiles" : "Perfiles colaboradores"}</span><span><BookOpen aria-hidden="true" /> {topic.modes.length} {english ? "participation modes" : "formas de participar"}</span></div>
      <Link className="text-link" href={href}>{english ? "Explore this topic" : "Explorar el tema"} <ArrowUpRight aria-hidden="true" /></Link>
    </article>
  })}</div>
}
