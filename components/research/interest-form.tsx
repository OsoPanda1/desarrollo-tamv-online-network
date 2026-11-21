"use client"

import Link from "next/link"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export function InterestForm({ topicId, loggedIn, locale = "es" }: { topicId: string; loggedIn: boolean; locale?: "es" | "en" }) {
  const [interestType, setInterestType] = useState("join")
  const [message, setMessage] = useState("")
  const [consentToShare, setConsentToShare] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const english = locale === "en"

  if (!loggedIn) {
    return <aside className="interest-panel"><h2>{english ? "Interested in taking part?" : "¿Te interesa participar?"}</h2><p>{english ? "Sign in to save your interest privately." : "Inicia sesión para guardar tu interés de forma privada."}</p><Link className="button button-copper" href="/sign-in">{english ? "Open the portal" : "Entrar al portal"}</Link></aside>
  }

  async function submitInterest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      const response = await fetch("/api/v1/research/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, interestType, message, consentToShare }),
      })
      const result = await response.json() as { message?: string; error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible guardar el interés.")
      setStatus(result.message ?? (english ? "Interest saved to your portal." : "Interés guardado en tu portal."))
      setMessage("")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible guardar el interés.")
    } finally {
      setLoading(false)
    }
  }

  return <aside className="interest-panel" aria-labelledby="interest-title">
    <h2 id="interest-title">{english ? "Interested in taking part?" : "¿Te interesa participar?"}</h2>
    <p>{english ? "Your message stays in the TAMV portal. Consent to share it with third parties is optional." : "Tu mensaje queda en el portal TAMV. El consentimiento para compartirlo con terceros es opcional."}</p>
    <p className="form-note">{english ? "TAMV does not offer, guarantee, or broker investments. Introductions are reviewed manually and happen only with your consent." : "TAMV no ofrece, garantiza ni intermedia inversiones. Las introducciones se revisan manualmente y solo ocurren con tu consentimiento."}</p>
    <form className="portal-form" onSubmit={submitInterest}>
      <PortalFieldGroup>
        <PortalField id="interest-mode" label={english ? "Contribution mode" : "Forma de colaboración"}><select id="interest-mode" value={interestType} onChange={(event) => setInterestType(event.target.value)}><option value="join">{english ? "Join the conversation" : "Sumarme a la conversación"}</option><option value="cocreate">{english ? "Co-create work" : "Cocrear un trabajo"}</option><option value="publish">{english ? "Share research" : "Compartir una investigación"}</option><option value="funding">{english ? "Request an introduction to potential partners or funders" : "Solicitar una introducción a posibles aliados o financiadores"}</option></select></PortalField>
        <PortalField id="interest-message" label={english ? "Tell us about your interest" : "Cuéntanos tu interés"}><Textarea id="interest-message" value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={1200} rows={4} required /></PortalField>
      </PortalFieldGroup>
      <PortalCheckboxField id="interest-share-consent" checked={consentToShare} onCheckedChange={setConsentToShare} label={english ? "I consent to share this message with a potential collaborator or funder after human review. This is not an offer or promise of investment." : "Autorizo compartir este mensaje con posibles colaboradores o financiadores tras una revisión humana. No implica oferta ni promesa de inversión."} />
      {status && <p className="form-status" role="status">{status}</p>}
      <button className="button button-copper" type="submit" disabled={loading}>{loading ? (english ? "Saving…" : "Guardando…") : english ? "Save interest" : "Guardar interés"}</button>
    </form>
  </aside>
}
