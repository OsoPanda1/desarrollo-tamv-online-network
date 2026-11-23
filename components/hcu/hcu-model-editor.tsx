"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

type DomainOption = { id: string; nameEs: string }
type AtomOption = { id: string; nameEs: string; influenceX: number; riskY: number; evidenceZ: number }
type EdgeRecord = { id: string; sourceAtomIds: string[]; targetAtomIds: string[]; sourceTitle: string | null; sourceUrl: string | null; weight: number; sign: number; delayYears: number; tqafLevel: string | null; evidenceStatus: string }
type ModelRecord = { id: string; domainId: string; nameEs: string; descriptionEs: string; influenceX: number; riskY: number; evidenceZ: number }
type ApiResult = { error?: string; id?: string }

export function HcuModelEditor({ domains, publicAtoms, ownAtoms, ownEdges, identityRegistered }: { domains: DomainOption[]; publicAtoms: AtomOption[]; ownAtoms: ModelRecord[]; ownEdges: EdgeRecord[]; identityRegistered: boolean }) {
  const router = useRouter()
  const atoms = [...publicAtoms, ...ownAtoms]
  const [atom, setAtom] = useState({ domainId: domains[0]?.id ?? "", nameEs: "", nameEn: "", descriptionEs: "", descriptionEn: "", influenceX: 50, riskY: 50, evidenceZ: 10 })
  const [edge, setEdge] = useState({ sourceAtomIds: [] as string[], targetAtomIds: [] as string[], sourceTitle: "", sourceUrl: "", weight: 0.3, sign: 1, delayYears: 2, tqafLevel: "N1" })
  const [atomMessage, setAtomMessage] = useState("")
  const [edgeMessage, setEdgeMessage] = useState("")
  const [atomError, setAtomError] = useState("")
  const [edgeError, setEdgeError] = useState("")
  const [savingAtom, setSavingAtom] = useState(false)
  const [savingEdge, setSavingEdge] = useState(false)

  async function submitAtom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingAtom(true)
    setAtomError("")
    setAtomMessage("")
    try {
      const response = await fetch("/api/v1/hcu/atoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(atom),
      })
      const body = await response.json() as ApiResult
      if (!response.ok) throw new Error(body.error ?? "No fue posible crear el átomo.")
      setAtomMessage("Átomo privado guardado como provisional. No se publicó en el mapa común.")
      setAtom({ domainId: domains[0]?.id ?? "", nameEs: "", nameEn: "", descriptionEs: "", descriptionEn: "", influenceX: 50, riskY: 50, evidenceZ: 10 })
      router.refresh()
    } catch (error) {
      setAtomError(error instanceof Error ? error.message : "No fue posible crear el átomo.")
    } finally {
      setSavingAtom(false)
    }
  }

  async function submitEdge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingEdge(true)
    setEdgeError("")
    setEdgeMessage("")
    try {
      const response = await fetch("/api/v1/hcu/hyperedges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...edge, sourceUrl: edge.sourceUrl || null, tqafLevel: edge.tqafLevel || null, evidenceStatus: "hypothesis" }),
      })
      const body = await response.json() as ApiResult
      if (!response.ok) throw new Error(body.error ?? "No fue posible crear la relación.")
      setEdgeMessage("Hiperarista privada guardada como hipótesis. Requiere revisión antes de difundirse.")
      setEdge({ sourceAtomIds: [], targetAtomIds: [], sourceTitle: "", sourceUrl: "", weight: 0.3, sign: 1, delayYears: 2, tqafLevel: "N1" })
      router.refresh()
    } catch (error) {
      setEdgeError(error instanceof Error ? error.message : "No fue posible crear la relación.")
    } finally {
      setSavingEdge(false)
    }
  }

  function selectedIds(event: React.ChangeEvent<HTMLSelectElement>) {
    return Array.from(event.currentTarget.selectedOptions, (option) => option.value)
  }

  return <section className="hcu-workspace-editor" aria-labelledby="hcu-workspace-title">
    <div className="hcu-editor-intro"><p className="eyebrow">HCU / ESPACIO PRIVADO</p><h2 id="hcu-workspace-title">Construye un modelo de trabajo.</h2><p>Los átomos y relaciones creados aquí quedan vinculados a tu cuenta, marcados como provisionales y fuera del mapa público hasta una revisión editorial independiente.</p>{!identityRegistered && <div className="detail-note"><strong>Identidad TRI pendiente</strong><span>Completa tu perfil de investigación para atribuir nuevos átomos con un código TRI y rol declarados. <Link href="/portal/perfil">Abrir perfil</Link></span></div>}</div>
    <div className="hcu-editor-grid">
      <form className="portal-content-card hcu-editor-form" onSubmit={submitAtom}>
        <p className="eyebrow">01 / ÁTOMO</p><h3>Registrar un átomo cognitivo</h3>
        <PortalFieldGroup>
          <PortalField id="hcu-atom-domain" label="Dominio"><select id="hcu-atom-domain" value={atom.domainId} onChange={(event) => setAtom({ ...atom, domainId: event.target.value })} required>{domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.nameEs}</option>)}</select></PortalField>
          <PortalFieldGroup className="form-two-columns">
            <PortalField id="hcu-atom-name-es" label="Nombre en español"><Input id="hcu-atom-name-es" value={atom.nameEs} onChange={(event) => setAtom({ ...atom, nameEs: event.target.value })} maxLength={80} required /></PortalField>
            <PortalField id="hcu-atom-name-en" label="Nombre en inglés"><Input id="hcu-atom-name-en" value={atom.nameEn} onChange={(event) => setAtom({ ...atom, nameEn: event.target.value })} maxLength={80} /></PortalField>
          </PortalFieldGroup>
          <PortalField id="hcu-atom-description-es" label="Descripción en español"><Textarea id="hcu-atom-description-es" value={atom.descriptionEs} onChange={(event) => setAtom({ ...atom, descriptionEs: event.target.value })} maxLength={500} rows={3} required /></PortalField>
          <PortalField id="hcu-atom-description-en" label="Descripción en inglés"><Textarea id="hcu-atom-description-en" value={atom.descriptionEn} onChange={(event) => setAtom({ ...atom, descriptionEn: event.target.value })} maxLength={500} rows={3} /></PortalField>
          <div className="hcu-editor-metrics">
            <PortalField id="hcu-atom-influence" label="Influencia X (0–100)"><Input id="hcu-atom-influence" type="number" min={0} max={100} value={atom.influenceX} onChange={(event) => setAtom({ ...atom, influenceX: Number(event.target.value) })} required /></PortalField>
            <PortalField id="hcu-atom-risk" label="Riesgo Y (0–100)"><Input id="hcu-atom-risk" type="number" min={0} max={100} value={atom.riskY} onChange={(event) => setAtom({ ...atom, riskY: Number(event.target.value) })} required /></PortalField>
            <PortalField id="hcu-atom-evidence" label="Evidencia Z (0–100)"><Input id="hcu-atom-evidence" type="number" min={0} max={100} value={atom.evidenceZ} onChange={(event) => setAtom({ ...atom, evidenceZ: Number(event.target.value) })} required /></PortalField>
          </div>
        </PortalFieldGroup>
        {atomError && <p className="form-error" role="alert">{atomError}</p>}
        {atomMessage && <p className="form-note" role="status">{atomMessage}</p>}
        <button className="button button-copper" type="submit" disabled={savingAtom || domains.length === 0}>{savingAtom ? "Guardando…" : "Guardar átomo privado"}</button>
      </form>

      <form className="portal-content-card hcu-editor-form" onSubmit={submitEdge}>
        <p className="eyebrow">02 / RELACIÓN</p><h3>Declarar una hiperarista</h3>
        <PortalFieldGroup>
          <PortalField id="hcu-edge-title" label="Etiqueta o título de fuente"><Input id="hcu-edge-title" value={edge.sourceTitle} onChange={(event) => setEdge({ ...edge, sourceTitle: event.target.value })} maxLength={160} required /></PortalField>
          <PortalField id="hcu-edge-url" label="Fuente pública o DOI" description="Se valida el formato de la URL; no se consulta ni verifica automáticamente su contenido."><Input id="hcu-edge-url" type="url" value={edge.sourceUrl} onChange={(event) => setEdge({ ...edge, sourceUrl: event.target.value })} maxLength={2048} placeholder="https://doi.org/…" /></PortalField>
          <PortalFieldGroup className="form-two-columns">
            <PortalField id="hcu-edge-sources" label="Orígenes" description="Puedes seleccionar varios átomos."><select id="hcu-edge-sources" multiple size={6} value={edge.sourceAtomIds} onChange={(event) => setEdge({ ...edge, sourceAtomIds: selectedIds(event) })} required>{atoms.map((atom) => <option key={atom.id} value={atom.id}>{atom.nameEs}</option>)}</select></PortalField>
            <PortalField id="hcu-edge-targets" label="Destinos" description="Puedes seleccionar varios átomos."><select id="hcu-edge-targets" multiple size={6} value={edge.targetAtomIds} onChange={(event) => setEdge({ ...edge, targetAtomIds: selectedIds(event) })} required>{atoms.map((atom) => <option key={atom.id} value={atom.id}>{atom.nameEs}</option>)}</select></PortalField>
          </PortalFieldGroup>
          <PortalFieldGroup className="form-two-columns">
            <PortalField id="hcu-edge-sign" label="Efecto"><select id="hcu-edge-sign" value={edge.sign} onChange={(event) => setEdge({ ...edge, sign: Number(event.target.value) })}><option value={1}>Intensifica (+)</option><option value={-1}>Reduce (−)</option></select></PortalField>
            <PortalField id="hcu-edge-level" label="Nivel TQAF citado"><select id="hcu-edge-level" value={edge.tqafLevel} onChange={(event) => setEdge({ ...edge, tqafLevel: event.target.value })}><option value="N1">N1 · Institucional</option><option value="N2">N2 · Técnico</option><option value="N3">N3 · Científico</option></select></PortalField>
          </PortalFieldGroup>
          <div className="hcu-editor-metrics hcu-editor-edge-metrics">
            <PortalField id="hcu-edge-weight" label="Fuerza (0.05–1)"><Input id="hcu-edge-weight" type="number" min={0.05} max={1} step={0.05} value={edge.weight} onChange={(event) => setEdge({ ...edge, weight: Number(event.target.value) })} required /></PortalField>
            <PortalField id="hcu-edge-delay" label="Rezago (1–15 años)"><Input id="hcu-edge-delay" type="number" min={1} max={15} value={edge.delayYears} onChange={(event) => setEdge({ ...edge, delayYears: Number(event.target.value) })} required /></PortalField>
          </div>
        </PortalFieldGroup>
        {edgeError && <p className="form-error" role="alert">{edgeError}</p>}
        {edgeMessage && <p className="form-note" role="status">{edgeMessage}</p>}
        <button className="button button-copper" type="submit" disabled={savingEdge || atoms.length < 2}>{savingEdge ? "Guardando…" : "Guardar relación privada"}</button>
      </form>
    </div>

    <div className="hcu-private-inventory">
      <div className="content-card-heading"><div><p className="eyebrow">TU GRAFO DE TRABAJO</p><h3>Registros privados</h3></div><span>{ownAtoms.length} átomos · {ownEdges.length} relaciones</span></div>
      {ownAtoms.length ? <ul className="hcu-private-atom-list">{ownAtoms.map((item) => <li key={item.id}><div><strong>{item.nameEs}</strong><span>{domains.find((domain) => domain.id === item.domainId)?.nameEs ?? "Dominio"} · provisional · privado</span><p>{item.descriptionEs}</p></div><dl><div><dt>X</dt><dd>{item.influenceX}</dd></div><div><dt>Y</dt><dd>{item.riskY}</dd></div><div><dt>Z</dt><dd>{item.evidenceZ}</dd></div></dl></li>)}</ul> : <p className="form-note">Aún no has creado átomos privados.</p>}
      {ownEdges.length > 0 && <ul className="hcu-private-edge-list">{ownEdges.map((item) => <li key={item.id}><strong>{item.sourceTitle ?? "Relación"}</strong><span>{item.sourceAtomIds.length} origen(es) → {item.targetAtomIds.length} destino(s) · peso {item.weight} · rezago {item.delayYears} años</span>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Consultar fuente</a>}</li>)}</ul>}
    </div>
  </section>
}
