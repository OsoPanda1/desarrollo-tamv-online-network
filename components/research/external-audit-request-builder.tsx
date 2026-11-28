"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Download, Mail } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import {
  buildExternalAuditRequestDraft,
  EMPTY_EXTERNAL_AUDIT_REQUEST,
  EXTERNAL_AUDIT_REQUEST_FIELDS,
  externalAuditMailto,
  type ExternalAuditRequestDraft,
} from "@/lib/governance/external-audit-request"

export function ExternalAuditRequestBuilder({ locale }: { locale: Locale }) {
  const english = locale === "en"
  const [values, setValues] = useState<ExternalAuditRequestDraft>(EMPTY_EXTERNAL_AUDIT_REQUEST)
  const [draft, setDraft] = useState("")
  const [message, setMessage] = useState("")
  const draftText = useMemo(() => draft ? buildExternalAuditRequestDraft(values, locale) : "", [draft, locale, values])

  function update(name: keyof ExternalAuditRequestDraft, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setMessage("")
  }

  function generateDraft() {
    setDraft("generated")
    setMessage(english ? "Draft generated locally. Nothing has been sent." : "Borrador generado localmente. No se ha enviado nada.")
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draftText)
      setMessage(english ? "Draft copied. Review it before sending." : "Borrador copiado. Revíselo antes de enviarlo.")
    } catch {
      setMessage(english ? "Clipboard access was not available. Download the draft instead." : "El portapapeles no está disponible. Descargue el borrador.")
    }
  }

  function downloadDraft() {
    const blob = new Blob([draftText], { type: "text/markdown;charset=utf-8" })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = english ? "tamv-external-audit-request.md" : "tamv-solicitud-auditoria-externa.md"
    anchor.click()
    URL.revokeObjectURL(objectUrl)
    setMessage(english ? "Draft downloaded. It remains unsent." : "Borrador descargado. Sigue sin enviarse.")
  }

  return (
    <div className="sovereignty-audit-builder">
      <div className="governance-notice" id="audit-draft-boundary">
        <strong>{english ? "Request or notice does not grant access." : "Una solicitud o aviso no concede acceso."}</strong>
        <p>{english ? "This tool creates a local draft only. It does not submit data, open a case, assign an auditor or change permissions." : "Esta herramienta crea solo un borrador local. No envía datos, no abre casos, no asigna auditores ni cambia permisos."}</p>
      </div>
      <form
        className="sovereignty-audit-form"
        method="dialog"
        aria-describedby="audit-draft-boundary"
        onSubmit={(event) => { event.preventDefault(); generateDraft() }}
      >
        <div className="sovereignty-audit-fields">
          {EXTERNAL_AUDIT_REQUEST_FIELDS.map((field) => (
            <label key={field.name} className={field.multiline ? "is-wide" : undefined} htmlFor={`audit-${field.name}`}>
              <span>{english ? field.label.en : field.label.es}{field.required && <em aria-hidden="true"> *</em>}</span>
              {field.multiline ? (
                <textarea
                  id={`audit-${field.name}`}
                  name={field.name}
                  rows={4}
                  maxLength={2500}
                  required={field.required}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={english ? field.placeholder.en : field.placeholder.es}
                />
              ) : (
                <input
                  id={`audit-${field.name}`}
                  name={field.name}
                  type={field.type ?? "text"}
                  maxLength={300}
                  required={field.required}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={english ? field.placeholder.en : field.placeholder.es}
                />
              )}
            </label>
          ))}
        </div>
        <div className="sovereignty-audit-actions">
          <button type="submit" className="button button-copper">{english ? "Generate local draft" : "Generar borrador local"}</button>
          <p>{english ? "Required fields are marked with an asterisk. Do not enter credentials or unrelated sensitive data." : "Los campos obligatorios llevan asterisco. No introduzca credenciales ni datos sensibles ajenos a la revisión."}</p>
        </div>
      </form>
      {draftText && (
        <section className="sovereignty-audit-preview" aria-labelledby="audit-draft-title">
          <div className="sovereignty-section-heading">
            <div>
              <span className="eyebrow">{english ? "Local output" : "Resultado local"}</span>
              <h3 id="audit-draft-title">{english ? "Review before any transmission" : "Revise antes de transmitir"}</h3>
            </div>
          </div>
          <pre tabIndex={0}>{draftText}</pre>
          <div className="sovereignty-audit-preview-actions">
            <button type="button" className="button button-outline-dark" onClick={copyDraft}><Copy aria-hidden="true" />{english ? "Copy draft" : "Copiar borrador"}</button>
            <button type="button" className="button button-outline-dark" onClick={downloadDraft}><Download aria-hidden="true" />{english ? "Download .md" : "Descargar .md"}</button>
            <a className="button button-copper" href={externalAuditMailto(locale)}><Mail aria-hidden="true" />{english ? "Open email with subject" : "Abrir correo con asunto"}</a>
          </div>
          <p className="sovereignty-audit-send-note">{english ? "The email action contains only a subject. Attach the downloaded draft manually and send it only when you are ready." : "La acción de correo contiene solo el asunto. Adjunte manualmente el borrador descargado y envíelo únicamente cuando esté listo."}</p>
        </section>
      )}
      <p className="sovereignty-action-status" role="status">{message && <Check aria-hidden="true" />}{message}</p>
    </div>
  )
}
