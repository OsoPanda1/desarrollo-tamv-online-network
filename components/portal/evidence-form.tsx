"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export function EvidenceForm({ proposalId }: { proposalId: string }) {
  const router = useRouter()
  const [label, setLabel] = useState("")
  const [kind, setKind] = useState("article")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [license, setLicense] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/research/proposals/${proposalId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, kind, url, description, license }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible guardar la referencia.")
      setSaved(true)
      setLabel("")
      setUrl("")
      setDescription("")
      setLicense("")
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No fue posible guardar la referencia.")
    } finally {
      setLoading(false)
    }
  }

  return <form className="portal-form evidence-form" onSubmit={submit}>
    <PortalFieldGroup>
      <PortalField id="evidence-label" label="Etiqueta"><Input id="evidence-label" value={label} onChange={(event) => setLabel(event.target.value)} minLength={2} maxLength={120} required /></PortalField>
      <PortalField id="evidence-kind" label="Tipo de fuente"><select id="evidence-kind" value={kind} onChange={(event) => setKind(event.target.value)}><option value="article">Artículo</option><option value="dataset">Datos</option><option value="repository">Repositorio</option><option value="thesis">Tesis</option><option value="report">Reporte</option><option value="other">Otro</option></select></PortalField>
      <PortalField id="evidence-url" label="URL pública o DOI"><Input id="evidence-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} maxLength={2048} placeholder="https://doi.org/…" required /></PortalField>
      <PortalField id="evidence-description" label="Descripción (opcional)"><Textarea id="evidence-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={600} /></PortalField>
      <PortalField id="evidence-license" label="Licencia conocida (opcional)"><Input id="evidence-license" value={license} onChange={(event) => setLicense(event.target.value)} maxLength={80} /></PortalField>
    </PortalFieldGroup>
    {saved && <p className="form-status" role="status">Referencia guardada en privado.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-outline-light" type="submit" disabled={loading}>{loading ? "Guardando…" : "Añadir referencia"}</button>
    <p className="form-note">TAMV solo registra el enlace. No descarga el archivo, verifica el DOI ni emite un checksum del contenido.</p>
  </form>
}
