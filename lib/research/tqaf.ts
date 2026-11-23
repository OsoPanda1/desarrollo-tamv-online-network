export const tqafCriteria = [
  { code: "TQAF-01", title: "Autoría, originalidad e integridad", detail: "Atribución de autoría, declaración de autenticidad y procedencia del trabajo." },
  { code: "TQAF-02", title: "Vacío de conocimiento y justificación", detail: "Problema delimitado y razón explícita para realizar el estudio." },
  { code: "TQAF-03", title: "Método y nivel de evidencia", detail: "Método, alcance y nivel N1, N2 o N3 descritos de forma proporcional." },
  { code: "TQAF-04", title: "Fuentes e integridad de evidencia", detail: "Referencias, datos y artefactos con procedencia identificable." },
  { code: "TQAF-05", title: "Reproducibilidad", detail: "Condiciones, materiales, código o datos necesarios para repetir el trabajo." },
  { code: "TQAF-06", title: "Revisión colegiada e independencia", detail: "Dictamen registrado y conflictos de interés declarados." },
  { code: "TQAF-07", title: "Correcciones y retractación", detail: "Vías publicadas para responder, corregir o retirar un resultado." },
  { code: "TQAF-08", title: "Contribuciones y licencia", detail: "Roles de contribución, atribución y permisos de reutilización declarados." },
  { code: "TQAF-09", title: "Metadatos FAIR e identificadores", detail: "Metadatos estructurados, identificadores y afiliación verificables en su alcance." },
  { code: "TQAF-10", title: "Preservación y depósito", detail: "Registro de preservación o depósito externo comprobable." },
] as const

export type TqafCriterionCode = (typeof tqafCriteria)[number]["code"]
export type TqafStatus = "verified" | "declared" | "partial" | "pending" | "external"

export const tqafStatusLabels: Record<TqafStatus, string> = {
  verified: "Verificado por revisión",
  declared: "Declarado",
  partial: "Parcial",
  pending: "Pendiente",
  external: "Proceso externo",
}
