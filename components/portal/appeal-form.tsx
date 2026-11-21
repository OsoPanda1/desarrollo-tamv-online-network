"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export function AppealForm({ proposalId }: { proposalId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/research/proposals/${proposalId}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible presentar la apelación.")
      setStatus("Apelación recibida. La revisión debe asignarse a otra persona.")
      setReason("")
      router.refresh()
    } catch (appealError) {
      setError(appealError instanceof Error ? appealError.message : "No fue posible presentar la apelación.")
    } finally {
      setLoading(false)
    }
  }

  return <form className="portal-form" onSubmit={submit}>
    <PortalFieldGroup><PortalField id="appeal-reason" label="Motivo de la apelación" description="Explica el motivo entre 30 y 2,000 caracteres."><Textarea id="appeal-reason" value={reason} onChange={(event) => setReason(event.target.value)} minLength={30} maxLength={2000} rows={5} required /></PortalField></PortalFieldGroup>
    {status && <p className="form-status" role="status">{status}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-outline-light" type="submit" disabled={loading}>{loading ? "Enviando…" : "Presentar apelación"}</button>
  </form>
}
