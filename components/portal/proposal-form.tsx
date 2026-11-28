"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

type EditableProposal = {
  id: string
  title: string
  abstract: string
  proposalType: string
  topicId: string | null
  sourceUrl: string | null
  license: string | null
  shareConsent: boolean
}

export function ProposalForm({ topics, initialTopicId = "", proposal }: { topics: Array<{ id: string; slug: string; titleEs: string }>; initialTopicId?: string; proposal?: EditableProposal }) {
  const router = useRouter()
  const [title, setTitle] = useState(proposal?.title ?? "")
  const [abstract, setAbstract] = useState(proposal?.abstract ?? "")
  const [proposalType, setProposalType] = useState(proposal?.proposalType ?? "article")
  const [topicId, setTopicId] = useState(proposal?.topicId ?? initialTopicId)
  const [sourceUrl, setSourceUrl] = useState(proposal?.sourceUrl ?? "")
  const [license, setLicense] = useState(proposal?.license ?? "")
  const [shareConsent, setShareConsent] = useState(proposal?.shareConsent ?? false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      const response = await fetch(proposal ? `/api/v1/research/proposals/${proposal.id}/resubmit` : "/api/v1/research/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, abstract, proposalType, topicId: topicId || null, sourceUrl: sourceUrl || null, license: license || null, shareConsent }),
      })
      const result = await response.json() as { id?: string; error?: string }
      if (!response.ok || !result.id) throw new Error(result.error ?? "No fue posible enviar la propuesta.")
      if (proposal) {
        setSuccess(true)
        router.refresh()
      } else {
        router.push(`/portal/propuestas/${result.id}`)
        router.refresh()
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No fue posible enviar la propuesta.")
    } finally {
      setLoading(false)
    }
  }

  if (success && proposal) {
    return <p className="form-status" role="status">La propuesta fue reenviada y queda pendiente de triage editorial.</p>
  }

  return (
    <form className="portal-form proposal-form" onSubmit={submit}>
      <PortalFieldGroup>
        <PortalField id="proposal-title" label="Título de trabajo"><Input id="proposal-title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={8} maxLength={160} required /></PortalField>
        <PortalField id="proposal-type" label="Tipo de propuesta"><select id="proposal-type" value={proposalType} onChange={(event) => setProposalType(event.target.value)}><option value="article">Artículo o investigación</option><option value="dataset">Conjunto de datos</option><option value="thesis">Tesis o trabajo académico</option><option value="report">Reporte o análisis</option><option value="prototype">Prototipo o herramienta</option><option value="course">Curso o secuencia didáctica</option><option value="other">Otro formato</option></select></PortalField>
        <PortalField id="proposal-topic" label="Tema relacionado"><select id="proposal-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="">Sin tema específico</option>{topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.titleEs}</option>)}</select></PortalField>
        <PortalField id="proposal-abstract" label="Resumen" description="Entre 100 y 5,000 caracteres. No incluyas información confidencial que no quieras compartir con el equipo editorial."><Textarea id="proposal-abstract" value={abstract} onChange={(event) => setAbstract(event.target.value)} minLength={100} maxLength={5000} rows={8} required /></PortalField>
        <PortalFieldGroup className="form-two-columns">
          <PortalField id="proposal-source-url" label="Enlace a fuente o material (opcional)"><Input id="proposal-source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} maxLength={2048} placeholder="https://…" /></PortalField>
          <PortalField id="proposal-license" label="Licencia propuesta (opcional)"><Input id="proposal-license" value={license} onChange={(event) => setLicense(event.target.value)} maxLength={80} placeholder="CC BY 4.0, por ejemplo" /></PortalField>
        </PortalFieldGroup>
      </PortalFieldGroup>
      <PortalCheckboxField id="proposal-share-consent" checked={shareConsent} onCheckedChange={setShareConsent} label="Autorizo que el resumen pueda hacerse público si la propuesta llega a publicarse. Esta autorización puede revocarse antes de la publicación." />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-copper" type="submit" disabled={loading}>{loading ? "Enviando…" : proposal ? "Reenviar propuesta corregida" : "Enviar a revisión editorial"}</button><p>{proposal ? "El reenvío registrará una nueva revisión vinculada al historial de la propuesta." : "El envío será privado y quedará como "}<strong>Recibido</strong>. No equivale a aceptación ni revisión por pares.</p></div>
    </form>
  )
}
