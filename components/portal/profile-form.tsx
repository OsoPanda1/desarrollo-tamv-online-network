"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export type ProfileFormValue = {
  publicName: string
  affiliation: string | null
  orcid: string | null
  isni: string | null
  researchLines: string[]
  isPublic: boolean
  tri: string | null
  verificationStatus: string
}

export function ProfileForm({ initial }: { initial: ProfileFormValue }) {
  const [publicName, setPublicName] = useState(initial.publicName)
  const [affiliation, setAffiliation] = useState(initial.affiliation ?? "")
  const [orcid, setOrcid] = useState(initial.orcid ?? "")
  const [isni, setIsni] = useState(initial.isni ?? "")
  const [researchLines, setResearchLines] = useState(initial.researchLines.join("\n"))
  const [isPublic, setIsPublic] = useState(initial.isPublic)
  const [tri, setTri] = useState(initial.tri)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/v1/researcher-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicName, affiliation, orcid, isni, researchLines: researchLines.split("\n").map((line) => line.trim()).filter(Boolean), isPublic }),
      })
      const result = await response.json() as { profile?: { tri?: string }; error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible actualizar el perfil.")
      setTri(result.profile?.tri ?? tri)
      setStatus("Perfil actualizado. Los identificadores externos conservan estado declarado.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No fue posible actualizar el perfil.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="portal-form" onSubmit={submit}>
      {tri && <div className="identity-chip"><span>IDENTIDAD TAMV</span><strong>{tri}</strong><small>Identificador interno; no sustituye ORCID ni verifica afiliación.</small></div>}
      <PortalFieldGroup>
        <PortalField id="profile-public-name" label="Nombre público"><Input id="profile-public-name" value={publicName} onChange={(event) => setPublicName(event.target.value)} minLength={2} maxLength={100} required /></PortalField>
        <PortalField id="profile-affiliation" label="Afiliación (opcional)"><Input id="profile-affiliation" value={affiliation} onChange={(event) => setAffiliation(event.target.value)} maxLength={180} /></PortalField>
        <PortalFieldGroup className="form-two-columns">
          <PortalField id="profile-orcid" label="ORCID (opcional)" description="Se valida el dígito de control; no se consulta ORCID."><Input id="profile-orcid" value={orcid} onChange={(event) => setOrcid(event.target.value)} maxLength={19} placeholder="0000-0000-0000-0000" /></PortalField>
          <PortalField id="profile-isni" label="ISNI (opcional)" description="Solo se revisa el formato, no el registro externo."><Input id="profile-isni" value={isni} onChange={(event) => setIsni(event.target.value)} maxLength={19} placeholder="0000-0000-0000-0000" /></PortalField>
        </PortalFieldGroup>
        <PortalField id="profile-research-lines" label="Líneas de investigación" description="Hasta 12 líneas. Evita incluir información personal sensible."><Textarea id="profile-research-lines" value={researchLines} onChange={(event) => setResearchLines(event.target.value)} rows={5} maxLength={1000} placeholder="Una línea por renglón" /></PortalField>
      </PortalFieldGroup>
      <PortalCheckboxField id="profile-public" checked={isPublic} onCheckedChange={setIsPublic} label="Publicar mi nombre, afiliación, identificadores declarados y líneas de investigación en el directorio. El correo y los datos de acceso no se publican." />
      {status && <p className="form-status" role="status">{status}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-copper" type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar perfil"}</button>
    </form>
  )
}
