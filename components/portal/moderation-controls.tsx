"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

const transitions: Record<string, Array<{ value: string; label: string }>> = {
  received: [{ value: "triage", label: "Enviar a triage" }],
  triage: [{ value: "review", label: "Iniciar revisión" }, { value: "changes_requested", label: "Solicitar cambios" }, { value: "rejected", label: "No aceptar" }],
  in_review: [{ value: "changes_requested", label: "Solicitar cambios" }, { value: "accepted", label: "Aceptar editorialmente" }, { value: "rejected", label: "No aceptar" }],
  changes_requested: [],
  accepted: [{ value: "published", label: "Publicar (requiere consentimiento)" }, { value: "changes_requested", label: "Solicitar cambios" }],
  appealed: [{ value: "review", label: "Revisión de apelación" }, { value: "rejected", label: "Confirmar decisión" }],
}

export function ModerationControls({ proposalId, status: currentStatus }: { proposalId: string; status: string }) {
  const router = useRouter()
  const [outcome, setOutcome] = useState(transitions[currentStatus]?.[0]?.value ?? "recusal")
  const [feedback, setFeedback] = useState("")
  const [conflictOfInterest, setConflictOfInterest] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const options = transitions[currentStatus] ?? []
  const selectedOutcome = options.some((option) => option.value === outcome) ? outcome : options[0]?.value ?? "recusal"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/moderation/proposals/${proposalId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: conflictOfInterest ? "recusal" : selectedOutcome, feedback, conflictOfInterest }),
      })
      const result = await response.json() as { status?: string; error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible guardar la revisión.")
      setSuccess(`Revisión guardada. Estado: ${result.status ?? currentStatus}.`)
      setFeedback("")
      router.refresh()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "No fue posible guardar la revisión.")
    } finally {
      setLoading(false)
    }
  }

  if (!options.length && currentStatus !== "published" && currentStatus !== "withdrawn") return null

  return <form className="portal-form moderation-form" onSubmit={submit}>
    <PortalFieldGroup>
      {!conflictOfInterest && options.length > 0 && <PortalField id={`review-outcome-${proposalId}`} label="Decisión editorial"><select id={`review-outcome-${proposalId}`} value={selectedOutcome} onChange={(event) => setOutcome(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></PortalField>}
      <PortalField id={`review-feedback-${proposalId}`} label="Retroalimentación para la persona autora"><Textarea id={`review-feedback-${proposalId}`} value={feedback} onChange={(event) => setFeedback(event.target.value)} minLength={10} maxLength={3000} rows={5} required /></PortalField>
    </PortalFieldGroup>
    <PortalCheckboxField id={`review-conflict-${proposalId}`} checked={conflictOfInterest} onCheckedChange={setConflictOfInterest} label="Declaro un conflicto de interés; guardaré una recusación sin recomendar un resultado." />
    {success && <p className="form-status" role="status">{success}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-copper" type="submit" disabled={loading}>{loading ? "Guardando…" : conflictOfInterest ? "Registrar recusación" : "Guardar revisión"}</button>
  </form>
}
