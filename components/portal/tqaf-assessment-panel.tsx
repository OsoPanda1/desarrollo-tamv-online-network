"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"
import { tqafCriteria, tqafStatusLabels, type TqafStatus } from "@/lib/research/tqaf"

type Assessment = {
  criterionCode: string
  status: string
  rationale: string | null
  evidenceUrl: string | null
  isReviewed: boolean
}

const allStatuses: TqafStatus[] = ["verified", "declared", "partial", "pending", "external"]
const authorStatuses: TqafStatus[] = ["declared", "partial", "pending"]

export function TqafAssessmentPanel({ proposalId, assessments, mode }: { proposalId: string; assessments: Assessment[]; mode: "author" | "reviewer" }) {
  const router = useRouter()
  const [savingCode, setSavingCode] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const assessmentByCode = new Map(assessments.map((assessment) => [assessment.criterionCode, assessment]))

  async function submitAssessment(event: React.FormEvent<HTMLFormElement>, criterionCode: string) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const status = String(form.get("status"))
    setSavingCode(criterionCode)
    setErrors((current) => ({ ...current, [criterionCode]: "" }))
    setMessages((current) => ({ ...current, [criterionCode]: "" }))
    try {
      const response = await fetch(`/api/v1/research/proposals/${proposalId}/tqaf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criterionCode,
          status,
          rationale: String(form.get("rationale") ?? ""),
          evidenceUrl: String(form.get("evidenceUrl") ?? "").trim() || null,
        }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible guardar el criterio.")
      setMessages((current) => ({ ...current, [criterionCode]: "Criterio guardado y agregado al historial del expediente." }))
      router.refresh()
    } catch (error) {
      setErrors((current) => ({ ...current, [criterionCode]: error instanceof Error ? error.message : "No fue posible guardar el criterio." }))
    } finally {
      setSavingCode(null)
    }
  }

  return <section className="portal-content-card tqaf-panel" aria-labelledby="tqaf-panel-title">
    <div className="content-card-heading"><div><p className="eyebrow">TQAF-10 · ESTADO DEL EXPEDIENTE</p><h2 id="tqaf-panel-title">Criterios con fundamento visible.</h2></div><span>{assessments.filter((assessment) => assessment.status === "verified").length}/10 revisados</span></div>
    <p className="form-note">Verificado significa que una persona revisora registró fundamento y evidencia; no constituye por sí solo certificación, acreditación, revisión por pares ni validación externa. La autoría solo puede declarar o marcar avances parciales.</p>
    <div className="tqaf-criteria-list">
      {tqafCriteria.map((criterion) => {
        const assessment = assessmentByCode.get(criterion.code)
        const status = (assessment?.status ?? "pending") as TqafStatus
        const canEdit = mode === "reviewer" || !assessment?.isReviewed
        const statuses = mode === "reviewer" ? allStatuses : authorStatuses
        return <details className="tqaf-criterion" key={criterion.code}>
          <summary>
            <span className="tqaf-code">{criterion.code}</span>
            <span className="tqaf-title">{criterion.title}</span>
            <span className={`tqaf-status status-${status}`}>{tqafStatusLabels[status]}</span>
          </summary>
          <div className="tqaf-criterion-body">
            <p>{criterion.detail}</p>
            {assessment?.rationale && <p className="tqaf-rationale"><strong>Fundamento registrado:</strong> {assessment.rationale}</p>}
            {assessment?.evidenceUrl && <p className="tqaf-evidence"><a href={assessment.evidenceUrl} target="_blank" rel="noopener noreferrer">Abrir evidencia en otra pestaña</a></p>}
            {canEdit ? <form className="tqaf-editor" onSubmit={(event) => submitAssessment(event, criterion.code)}>
              <PortalFieldGroup className="tqaf-editor-grid">
                <PortalField id={`tqaf-status-${criterion.code}`} label={mode === "reviewer" ? "Estado de revisión" : "Declaración"}>
                  <select id={`tqaf-status-${criterion.code}`} name="status" defaultValue={statuses.includes(status) ? status : (mode === "reviewer" ? "pending" : "declared")}>
                    {statuses.map((option) => <option key={option} value={option}>{tqafStatusLabels[option]}</option>)}
                  </select>
                </PortalField>
                <PortalField id={`tqaf-evidence-${criterion.code}`} label="Enlace de evidencia (opcional)"><Input id={`tqaf-evidence-${criterion.code}`} name="evidenceUrl" type="url" defaultValue={assessment?.evidenceUrl ?? ""} maxLength={2048} placeholder="https://doi.org/…" /></PortalField>
              </PortalFieldGroup>
              <PortalField id={`tqaf-rationale-${criterion.code}`} label="Fundamento" description={mode === "reviewer" ? "Para verificar un criterio, documenta la decisión y enlaza la evidencia examinada." : "Escribe solo lo que puedas sostener con el expediente."}>
                <Textarea id={`tqaf-rationale-${criterion.code}`} name="rationale" defaultValue={assessment?.rationale ?? ""} maxLength={1200} rows={3} />
              </PortalField>
              {errors[criterion.code] && <p className="form-error" role="alert">{errors[criterion.code]}</p>}
              {messages[criterion.code] && <p className="form-note" role="status">{messages[criterion.code]}</p>}
              <button className="button button-outline-light" type="submit" disabled={savingCode === criterion.code}>{savingCode === criterion.code ? "Guardando…" : "Guardar criterio"}</button>
            </form> : <p className="form-note">Este criterio ya tiene una evaluación editorial registrada. Solicita revisión por los canales publicados para corregirla.</p>}
          </div>
        </details>
      })}
    </div>
  </section>
}
