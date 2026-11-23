"use client"

import { useState } from "react"
import { CheckCircle2, Circle, LoaderCircle } from "lucide-react"

type ModuleProgress = { id: string; title: string }
export function MemberCourseProgress({
  modules,
  initialCompleted,
  locale = "es",
}: {
  modules: ModuleProgress[]
  initialCompleted: string[]
  locale?: "es" | "en"
}) {
  const english = locale === "en"
  const [completed, setCompleted] = useState(() => new Set(initialCompleted))
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function toggle(moduleId: string) {
    if (busyId) return
    const nextValue = !completed.has(moduleId)
    const previous = new Set(completed)
    const next = new Set(completed)
    if (nextValue) next.add(moduleId)
    else next.delete(moduleId)
    setCompleted(next)
    setBusyId(moduleId)
    setError("")

    try {
      const response = await fetch("/api/memberships/course-progress", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ moduleId, completed: nextValue }),
      })
      const payload = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar el progreso.")
    } catch (cause) {
      setCompleted(previous)
      setError(cause instanceof Error ? cause.message : "Error de conexión. Inténtalo de nuevo.")
    } finally {
      setBusyId(null)
    }
  }

  const done = modules.filter((item) => completed.has(item.id)).length
  return (
    <section className="course-progress" aria-labelledby="course-progress-title">
      <div className="course-progress-header">
        <div>
          <p className="eyebrow">{english ? "LEARNING PROGRESS" : "PROGRESO FORMATIVO"}</p>
          <h2 id="course-progress-title">{english ? "Your course checklist" : "Tu checklist del curso"}</h2>
        </div>
        <strong>{done}/{modules.length}</strong>
      </div>
      <div className="course-progress-bar" aria-hidden="true"><span style={{ width: `${modules.length ? (done / modules.length) * 100 : 0}%` }} /></div>
      <ul className="course-progress-list">
        {modules.map((item) => {
          const isDone = completed.has(item.id)
          return (
            <li key={item.id}>
              <button type="button" className={`course-progress-item${isDone ? " is-complete" : ""}`} onClick={() => void toggle(item.id)} disabled={busyId !== null} aria-pressed={isDone}>
                {busyId === item.id ? <LoaderCircle className="billing-spinner" aria-hidden="true" /> : isDone ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
                <span>{item.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {error && <p className="billing-error" role="alert">{error}</p>}
      <p className="billing-hint">{english ? "Progress is stored on your authenticated TAMV account; it does not certify skill, admission to a project, or investment readiness." : "El progreso se guarda en tu cuenta TAMV autenticada; no certifica habilidades, aceptación en un proyecto ni preparación para inversión."}</p>
    </section>
  )
}
