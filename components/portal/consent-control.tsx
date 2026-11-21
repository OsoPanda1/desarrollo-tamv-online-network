"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PortalCheckboxField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export function ConsentControl({ proposalId, initialValue }: { proposalId: string; initialValue: boolean }) {
  const router = useRouter()
  const [shareConsent, setShareConsent] = useState(initialValue)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function updateConsent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/research/proposals/${proposalId}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareConsent }),
      })
      const result = await response.json() as { error?: string; message?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible actualizar el consentimiento.")
      setMessage(result.message ?? "Consentimiento actualizado.")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible actualizar el consentimiento.")
    } finally {
      setLoading(false)
    }
  }

  return <form className="consent-control" onSubmit={updateConsent}>
    <PortalFieldGroup><PortalCheckboxField id={`share-consent-${proposalId}`} checked={shareConsent} onCheckedChange={setShareConsent} label="Autorizo publicar el resumen únicamente si se acepta y publica editorialmente." /></PortalFieldGroup>
    <button className="text-button" type="submit" disabled={loading}>{loading ? "Guardando…" : "Actualizar consentimiento"}</button>
    {message && <p className="form-status" role="status">{message}</p>}
  </form>
}
