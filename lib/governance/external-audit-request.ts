import type { Locale } from "@/lib/i18n"

export type ExternalAuditRequestDraft = {
  requester: string
  organization: string
  mandate: string
  auditType: string
  subject: string
  versionPeriod: string
  criteria: string
  methodology: string
  conflictsFunding: string
  confidentiality: string
  evidenceAccess: string
  noticeReference: string
  contactEmail: string
  desiredStart: string
  notes: string
}

export const EXTERNAL_AUDIT_REQUEST_FIELDS: Array<{
  name: keyof ExternalAuditRequestDraft
  label: { es: string; en: string }
  type?: "email"
  multiline?: boolean
  required?: boolean
  placeholder: { es: string; en: string }
}> = [
  { name: "requester", label: { es: "Persona solicitante", en: "Requester" }, required: true, placeholder: { es: "Nombre y cargo", en: "Name and role" } },
  { name: "organization", label: { es: "Organización", en: "Organization" }, required: true, placeholder: { es: "Entidad representada", en: "Represented entity" } },
  { name: "contactEmail", label: { es: "Correo de contacto", en: "Contact email" }, type: "email", required: true, placeholder: { es: "correo@dominio", en: "email@domain" } },
  { name: "mandate", label: { es: "Mandato o potestad", en: "Mandate or authority" }, multiline: true, required: true, placeholder: { es: "Documento, resolución o facultad que autoriza la solicitud", en: "Document, resolution or authority supporting the request" } },
  { name: "noticeReference", label: { es: "Referencia del aviso", en: "Notice reference" }, placeholder: { es: "Oficio, número o fecha del aviso previo", en: "Notice letter, number or date" } },
  { name: "auditType", label: { es: "Tipo de revisión", en: "Review type" }, required: true, placeholder: { es: "Gobernanza, IA, datos, seguridad o registros públicos", en: "Governance, AI, data, security or public records" } },
  { name: "subject", label: { es: "Asunto y objetivo", en: "Subject and objective" }, multiline: true, required: true, placeholder: { es: "Qué se pretende revisar y para qué", en: "What will be reviewed and why" } },
  { name: "versionPeriod", label: { es: "Versión y periodo", en: "Version and period" }, placeholder: { es: "Versión, despliegue, fechas o hitos", en: "Version, deployment, dates or milestones" } },
  { name: "criteria", label: { es: "Criterios", en: "Criteria" }, multiline: true, placeholder: { es: "Políticas, normas o controles que servirán de referencia", en: "Policies, standards or controls to be assessed" } },
  { name: "methodology", label: { es: "Metodología propuesta", en: "Proposed methodology" }, multiline: true, placeholder: { es: "Procedimientos, muestras y forma de verificación", en: "Procedures, samples and verification approach" } },
  { name: "conflictsFunding", label: { es: "Independencia, conflictos y financiación", en: "Independence, conflicts and funding" }, multiline: true, placeholder: { es: "Relaciones, conflictos potenciales y quién financia la revisión", en: "Relationships, potential conflicts and who funds the review" } },
  { name: "confidentiality", label: { es: "Confidencialidad", en: "Confidentiality" }, multiline: true, placeholder: { es: "Datos sensibles, restricciones y tratamiento esperado", en: "Sensitive data, restrictions and expected handling" } },
  { name: "evidenceAccess", label: { es: "Evidencia y acceso mínimo", en: "Evidence and minimum access" }, multiline: true, placeholder: { es: "Documentos, sistemas, permisos, duración y revocación", en: "Documents, systems, permissions, duration and revocation" } },
  { name: "desiredStart", label: { es: "Fecha deseada", en: "Desired start date" }, placeholder: { es: "Fecha orientativa, sujeta a admisión", en: "Indicative date, subject to admissibility" } },
  { name: "notes", label: { es: "Notas", en: "Notes" }, multiline: true, placeholder: { es: "Información adicional no confidencial", en: "Additional non-confidential information" } },
]

export const EMPTY_EXTERNAL_AUDIT_REQUEST: ExternalAuditRequestDraft = {
  requester: "",
  organization: "",
  mandate: "",
  auditType: "",
  subject: "",
  versionPeriod: "",
  criteria: "",
  methodology: "",
  conflictsFunding: "",
  confidentiality: "",
  evidenceAccess: "",
  noticeReference: "",
  contactEmail: "",
  desiredStart: "",
  notes: "",
}

export function buildExternalAuditRequestDraft(values: ExternalAuditRequestDraft, locale: Locale) {
  const english = locale === "en"
  const field = (name: keyof ExternalAuditRequestDraft) => {
    const definition = EXTERNAL_AUDIT_REQUEST_FIELDS.find((item) => item.name === name)
    return english ? definition?.label.en ?? name : definition?.label.es ?? name
  }
  const value = (name: keyof ExternalAuditRequestDraft) => values[name].trim() || (english ? "[Not provided]" : "[No indicado]")
  const lines = [
    english ? "# TAMV Online — External audit request / notice" : "# TAMV Online — Solicitud / aviso de auditoría externa",
    "",
    english
      ? "Local draft only. It has not been sent, does not open an audit case and does not grant access. A request or notice is necessary but not sufficient: scope, authority, independence, confidentiality, least privilege, time limits, logging and revocation must be accepted before any access."
      : "Borrador local únicamente. No se ha enviado, no abre un caso de auditoría ni concede acceso. Una solicitud o aviso es necesario pero no suficiente: deben aceptarse alcance, autoridad, independencia, confidencialidad, privilegio mínimo, límites temporales, registro y revocación antes de cualquier acceso.",
    "",
    english ? "Do not include credentials, private keys, personal data unrelated to the review or confidential annexes in this draft." : "No incluya credenciales, claves privadas, datos personales ajenos a la revisión ni anexos confidenciales en este borrador.",
    "",
    english ? "## Framework" : "## Marco de referencia",
    `- ${english ? "Framework" : "Marco"}: TAMV-SD-AI`,
    `- ${english ? "Version" : "Versión"}: 1.0`,
    `- ${english ? "Status" : "Estado"}: ${english ? "public draft, not certification" : "borrador público, no certificación"}`,
    "",
    english ? "## Request" : "## Solicitud",
    ...EXTERNAL_AUDIT_REQUEST_FIELDS.map((definition) => `- ${field(definition.name)}: ${value(definition.name)}`),
    "",
    english ? "## Requester acknowledgment" : "## Declaración de la persona solicitante",
    english
      ? "The information is accurate to the best of my knowledge. I understand that submission does not imply admission, certification, public disclosure or access."
      : "La información es correcta según mi leal saber y entender. Comprendo que el envío no implica admisión, certificación, divulgación pública ni acceso.",
  ]
  return lines.join("\n")
}

export function externalAuditMailto(locale: Locale) {
  const subject = encodeURIComponent(locale === "en" ? "TAMV Online — External audit request / notice" : "TAMV Online — Solicitud / aviso de auditoría externa")
  return `mailto:anubiscastillo@visitarealdelmonte.online?subject=${subject}`
}
