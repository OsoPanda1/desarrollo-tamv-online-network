"use client"

import { useMemo, useState } from "react"
import { Copy, Download, Mail } from "lucide-react"
import type { Locale } from "@/lib/i18n"

const CANONICAL_EMAIL = "anubiscastillo@visitarealdelmonte.online"

const typeOptions = [
  "N3 · Artículo / preprint",
  "N3 · Data paper / conjunto de datos",
  "N3 · Modelo formal / algoritmo",
  "N2 · White paper / especificación técnica",
  "N2 · Manual / arquitectura de software",
  "N1 · Manifiesto / documento institucional",
  "N1 · Guía operativa",
] as const

const repoOptions = [
  "Zenodo (DOI)",
  "OSF (DOI)",
  "Figshare (DOI)",
  "GitHub + depósito posterior",
  "Por definir con el Comité",
] as const

const replOptions = ["Total", "Parcial", "Condicionada"] as const

const licenseOptions = [
  "CC BY 4.0 (estándar TAMV)",
  "CC BY-SA 4.0",
  "CC0 1.0 (datos)",
  "Por acordar en la revisión",
] as const

function orcidCheck(value: string): { formatted: string; valid: boolean; note: string } | null {
  const digits = value.replace(/[^0-9Xx]/g, "").toUpperCase()
  if (digits.length === 0) return null
  const formatted = digits.replace(/(.{4})(?=.)/g, "$1-")
  if (!/^\d{15}[\dX]$/.test(digits)) {
    return { formatted, valid: false, note: "formato incompleto: se esperan 16 caracteres (15 dígitos + dígito de control)" }
  }
  let total = 0
  for (let i = 0; i < 15; i++) {
    total = (total + Number(digits[i])) * 2
  }
  const remainder = total % 11
  const check = (12 - remainder) % 11
  const expected = check === 10 ? "X" : String(check)
  const valid = digits[15] === expected
  return { formatted, valid, note: valid ? "dígito de control válido (ISO 7064 mod 11-2)" : "dígito de control incorrecto" }
}

export function FairRecordGenerator({ locale }: { locale: Locale }) {
  const english = locale === "en"
  const [title, setTitle] = useState("")
  const [docType, setDocType] = useState<string>(typeOptions[0])
  const [author, setAuthor] = useState("")
  const [orcid, setOrcid] = useState("")
  const [abstract, setAbstract] = useState("")
  const [keywords, setKeywords] = useState("")
  const [repo, setRepo] = useState<string>(repoOptions[0])
  const [replicability, setReplicability] = useState<string>(replOptions[0])
  const [license, setLicense] = useState<string>(licenseOptions[0])
  const [message, setMessage] = useState("")

  const orcidResult = useMemo(() => orcidCheck(orcid), [orcid])

  const recordText = useMemo(() => {
    const lines = [
      "FICHA DOCUMENTAL FAIR — TAMV ONLINE NETWORK / UTAMV",
      "Sistema documental: ciclo TAMV (crear → identificar → revisar TQAF → versionar → depositar → preservar)",
      "",
      `Título: ${title || "— sin título —"}`,
      `Nivel y tipo: ${docType}`,
      `Autoría: ${author || "—"}`,
      `ORCID: ${orcid ? `${orcidResult?.formatted ?? orcid} · ${orcidResult?.note ?? ""}` : "— sin registrar —"}`,
      "Afiliación: TAMV Online Network / UTAMV, Nodo Cero, Real del Monte, Hidalgo, México",
      `Resumen: ${abstract || "—"}`,
      `Palabras clave: ${keywords || "—"}`,
      `Repositorio / depósito previsto: ${repo}`,
      `Replicabilidad declarada (TQAF-10, criterio 5): ${replicability}`,
      `Licencia: ${license}`,
      "Versión inicial: 0.1.0 (borrador) · Estado: en redacción — pendiente de arbitraje (pipeline §5)",
      "Registro BookPI: se abre al tomar la decisión de publicar.",
    ]
    return lines.join("\n")
  }, [title, docType, author, orcid, orcidResult, abstract, keywords, repo, replicability, license])

  const mailto = `mailto:${CANONICAL_EMAIL}?subject=${encodeURIComponent(`Ficha documental FAIR — ${title || "sin título"}`)}&body=${encodeURIComponent(recordText)}`

  async function copyRecord() {
    try {
      await navigator.clipboard.writeText(recordText)
      setMessage(english ? "Documentary record copied. Use it to head your document in docs/." : "Ficha documental copiada. Encabeza con ella tu documento en docs/.")
    } catch {
      setMessage(english ? "Copy failed in this browser; select the preview text manually." : "La copia falló en este navegador; selecciona el texto de la vista previa manualmente.")
    }
  }

  function downloadRecord() {
    const blob = new Blob([`# Ficha documental FAIR\n\n\`\`\`\n${recordText}\n\`\`\`\n`], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ficha-documental-fair.md"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setMessage(english ? "Record downloaded as ficha-documental-fair.md." : "Ficha descargada como ficha-documental-fair.md.")
  }

  return (
    <div className="portal-content-card">
      <div className="content-card-heading">
        <h2>{english ? "Generate your document record" : "Genera la ficha de tu documento"}</h2>
        <span>{english ? "FAIR · LIVE PREVIEW" : "FAIR · VISTA PREVIA EN VIVO"}</span>
      </div>
      <p>{english ? "Complete the metadata for your next output — article, dataset, specification, or manifesto — and get its record-format card, ready to head the document and its deposit." : "Completa los metadatos de tu próximo output — artículo, dataset, especificación o manifiesto — y obtén su ficha en formato de registro, lista para encabezar el documento y su depósito."}</p>
      <div className="portal-form">
        <label className="portal-field"><span>{english ? "Document title" : "Título del documento"}</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={english ? "Working title of the output" : "Título de trabajo del output"} />
        </label>
        <div className="form-two-columns">
          <label className="portal-field"><span>{english ? "Level and type (TQAF §4.1)" : "Nivel y tipo (TQAF §4.1)"}</span>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {typeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="portal-field"><span>{english ? "Planned repository or deposit" : "Repositorio o depósito previsto"}</span>
            <select value={repo} onChange={(e) => setRepo(e.target.value)}>
              {repoOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <div className="form-two-columns">
          <label className="portal-field"><span>{english ? "Authorship (name and TRI code)" : "Autoría (nombre y código TRI)"}</span>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nombre, TRI-TAMV-AAAA-XXXX" />
          </label>
          <label className="portal-field"><span>{english ? "Author ORCID" : "ORCID de la autoría"}</span>
            <input type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" inputMode="numeric" />
            {orcidResult && <small style={{ color: orcidResult.valid ? "#3d5e48" : "#7c3028" }}>{orcidResult.formatted} · {orcidResult.note}</small>}
          </label>
        </div>
        <label className="portal-field"><span>{english ? "Abstract (what problem, what method, what result)" : "Resumen (qué problema, qué método, qué resultado)"}</span>
          <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} />
        </label>
        <label className="portal-field"><span>{english ? "Keywords (comma-separated)" : "Palabras clave (separadas por comas)"}</span>
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </label>
        <div className="form-two-columns">
          <label className="portal-field"><span>{english ? "Declared replicability (criterion 5)" : "Replicabilidad declarada (criterio 5)"}</span>
            <select value={replicability} onChange={(e) => setReplicability(e.target.value)}>
              {replOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="portal-field"><span>{english ? "Licence" : "Licencia"}</span>
            <select value={license} onChange={(e) => setLicense(e.target.value)}>
              {licenseOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>
      </div>

      <h3 style={{ margin: "22px 0 8px", color: "var(--navy)", font: "500 19px/1.25 var(--serif)" }}>{english ? "Live preview" : "Vista previa en vivo"}</h3>
      <pre className="doc-preview" aria-live="polite">{recordText}</pre>

      <div className="doc-form-actions">
        <button type="button" className="button button-copper" onClick={copyRecord}><Copy aria-hidden="true" /> {english ? "Copy documentary record" : "Copiar ficha documental"}</button>
        <button type="button" className="button button-outline-dark" onClick={downloadRecord}><Download aria-hidden="true" /> {english ? "Download record (.md)" : "Descargar ficha (.md)"}</button>
        <a className="button button-outline-dark" href={mailto}><Mail aria-hidden="true" /> {english ? "Send to the canonical channel" : "Enviarla al canal canónico"}</a>
      </div>
      <p className="doc-msg" aria-live="polite">{message}</p>
      <p className="form-note">{english ? "The record publishes nothing by itself: it opens stage 1 of the pipeline (§5). Final classification, arbitration, and DOI assignment happen in review, not in this form. Nothing is stored: the record lives only in this session's memory." : "La ficha no publica nada por sí misma: abre la etapa 1 del pipeline (§5). La clasificación definitiva, el arbitraje y la asignación de DOI ocurren en la revisión, no en este formulario. Nada se guarda: la ficha vive solo en la memoria de esta sesión."}</p>
    </div>
  )
}
