/**
 * Estándar TAMV de Integridad Abierta (ETIA) / TAMV Open Integrity Standard.
 *
 * Controlled vocabularies, identifier rules and the public semantics of the
 * standard. This module is deliberately free of network calls and of any claim
 * that an identifier, a repository or a certification is true. It defines the
 * vocabulary that the evaluator and the public API use.
 *
 * The standard is a public draft. It is not an ISO standard, not an
 * accreditation scheme and not legal advice.
 */

import { hasIsniFormat, isValidOrcid, normalizeIsni, normalizeOrcid } from "../identifiers.ts"

export const STANDARD_ID = "tamv.open_integrity.v1" as const
export const STANDARD_VERSION = "1.0.0" as const
export const STANDARD_STATUS = "public-draft" as const
export const STANDARD_NAME_ES = "Estándar TAMV de Integridad Abierta" as const
export const STANDARD_NAME_EN = "TAMV Open Integrity Standard" as const
export const STANDARD_SHORT_ES = "ETIA" as const
export const STANDARD_SHORT_EN = "TOIS" as const
export const STANDARD_URL = "https://tamv.online/estandar" as const

export const STANDARD_SEMANTICS_ES =
  "Este estándar evalúa la estructura y la coherencia de una declaración pública. No verifica la verdad de los datos, no resuelve identificadores, no descarga evidencias, no emite certificaciones, no acredita organismos y no sustituye asesoría legal. Un resultado «completo» significa que la declaración está estructuralmente completa, no que sea verdadera."

export const STANDARD_SEMANTICS_EN =
  "This standard evaluates the structure and internal consistency of a public declaration. It does not verify the truth of the data, resolve identifiers, download evidence, issue certifications, accredit bodies or replace legal advice. A «complete» result means the declaration is structurally complete, not that it is true."

export const STANDARD_LIMITATIONS_ES = [
  "No existe una autoridad mundial única de certificación de ciencia abierta, código abierto o recaudación.",
  "ISNI, ROR, ORCID y DOI identifican entidades u objetos; no certifican calidad, autoría ni veracidad.",
  "El Foro Económico Mundial (WEF) publica principios e informes; no es un organismo de normalización ni de certificación.",
  "OSF, Zenodo y CERN son infraestructuras de publicación y preservación; no son certificadores de investigación.",
  "Las normas ISO suelen ser de pago y su certificación requiere organismos acreditados; una autodeclaración no es una certificación.",
  "La figura del patrocinio fiscal, la solicitud caritativa, las sanciones y la protección de datos dependen de la jurisdicción.",
  "La revisión por pares, la indexación y la posesión de un DOI no equivalen a certificación de calidad.",
  "La certificación de un repositorio (CoreTrustSeal, ISO 16363) cubre al repositorio, no la verdad de cada dataset.",
  "FAIR sin CARE puede ser insuficiente para datos indígenas o comunitarios.",
  "Una certificación puede caducar, suspenderse o revocarse; sin registro y evidencia, la afirmación queda «no verificada».",
] as const

export const STANDARD_LIMITATIONS_EN = [
  "There is no single global certification authority for open science, open source or fundraising.",
  "ISNI, ROR, ORCID and DOI identify entities or objects; they do not certify quality, authorship or truth.",
  "The World Economic Forum (WEF) publishes principles and reports; it is not a standards body or a certifier.",
  "OSF, Zenodo and CERN are publication and preservation infrastructures; they are not research certifiers.",
  "ISO standards are often paywalled and certification requires accredited bodies; self-declaration is not certification.",
  "Fiscal sponsorship, charitable solicitation, sanctions and data protection depend on the jurisdiction.",
  "Peer review, indexing and holding a DOI are not quality certification.",
  "Repository certification (CoreTrustSeal, ISO 16363) covers the repository, not the truth of every dataset.",
  "FAIR without CARE can be insufficient for Indigenous or community data.",
  "A certification can expire, be suspended or be revoked; without a registry and evidence, the claim stays «unverified».",
] as const

export type PillarId = "classification" | "funding" | "publication" | "certification" | "cross_cutting"

export type Pillar = {
  id: PillarId
  nameEs: string
  nameEn: string
  purposeEs: string
  purposeEn: string
}

export const PILLARS: readonly Pillar[] = [
  {
    id: "classification",
    nameEs: "Clasificación",
    nameEn: "Classification",
    purposeEs: "Define qué es el sujeto, qué identificadores lo distinguen y qué licencia y madurez declara.",
    purposeEn: "Defines what the subject is, which identifiers distinguish it, and which license and maturity it declares.",
  },
  {
    id: "funding",
    nameEs: "Recaudación",
    nameEn: "Funding",
    purposeEs: "Hace explícito el modelo de ingresos, el vehículo legal, las políticas de donación y los controles de cumplimiento.",
    purposeEn: "Makes the revenue model, legal vehicle, donation policies and compliance controls explicit.",
  },
  {
    id: "publication",
    nameEs: "Publicación",
    nameEn: "Publication",
    purposeEs: "Exige repositorio, identificador persistente, metadatos, versión, licencia, revisión y preservación.",
    purposeEn: "Requires a repository, persistent identifier, metadata, version, license, review and preservation.",
  },
  {
    id: "certification",
    nameEs: "Certificación",
    nameEn: "Certification",
    purposeEs: "Obliga a que toda afirmación de certificación nombre emisor, esquema, alcance, evidencia, vigencia y revocación.",
    purposeEn: "Requires every certification claim to name issuer, scheme, scope, evidence, validity and revocation.",
  },
  {
    id: "cross_cutting",
    nameEs: "Transversales",
    nameEn: "Cross-cutting",
    purposeEs: "Cubre identidad, transparencia, protección de datos, ética, seguridad, accesibilidad y recursos de corrección.",
    purposeEn: "Covers identity, transparency, data protection, ethics, security, accessibility and redress.",
  },
] as const

export const SUBJECT_TYPES = ["project", "organization", "person", "output", "infrastructure", "event"] as const
export type SubjectType = (typeof SUBJECT_TYPES)[number]

export const MATURITY_LEVELS = ["idea", "prototype", "pilot", "production", "archived"] as const
export type MaturityLevel = (typeof MATURITY_LEVELS)[number]

export const DOMAINS = [
  "knowledge",
  "technology",
  "identity",
  "governance",
  "territory",
  "culture",
  "health",
  "education",
  "environment",
  "economy",
  "other",
] as const
export type Domain = (typeof DOMAINS)[number]

export const FUNDING_MODELS = [
  "donations",
  "grants",
  "membership",
  "sponsorship",
  "services",
  "sales",
  "fiscal_sponsorship",
  "crowdfunding",
  "mixed",
  "none",
] as const
export type FundingModel = (typeof FUNDING_MODELS)[number]

export const LEGAL_VEHICLES = [
  "nonprofit",
  "fiscal_sponsor",
  "cooperative",
  "company",
  "public_institution",
  "informal",
  "none",
] as const
export type LegalVehicle = (typeof LEGAL_VEHICLES)[number]

export const PAYMENT_PCI_SCOPES = ["hosted", "merchant", "not_applicable"] as const
export type PaymentPciScope = (typeof PAYMENT_PCI_SCOPES)[number]

export const OUTPUT_TYPES = [
  "article",
  "preprint",
  "dataset",
  "software",
  "hardware",
  "protocol",
  "report",
  "thesis",
  "course",
  "event",
  "other",
] as const
export type OutputType = (typeof OUTPUT_TYPES)[number]

export const ACCESS_MODES = ["open", "embargoed", "restricted", "closed"] as const
export type AccessMode = (typeof ACCESS_MODES)[number]

export const REVIEW_MODELS = ["none", "editorial", "community", "peer", "post_publication"] as const
export type ReviewModel = (typeof REVIEW_MODELS)[number]

export const METADATA_SCHEMAS = [
  "DataCite",
  "Dublin Core",
  "schema.org",
  "JATS",
  "CodeMeta",
  "RO-Crate",
  "other",
] as const
export type MetadataSchema = (typeof METADATA_SCHEMAS)[number]

export const PID_SCHEMES = ["doi", "handle", "ark", "other"] as const
export type PidScheme = (typeof PID_SCHEMES)[number]

export const CERTIFICATION_CLAIM_TYPES = [
  "self_declaration",
  "third_party_certification",
  "accreditation",
  "registration",
  "indexing",
  "badge",
  "award",
] as const
export type CertificationClaimType = (typeof CERTIFICATION_CLAIM_TYPES)[number]

export const CERTIFICATION_STATUSES = ["active", "suspended", "revoked", "expired", "unknown"] as const
export type CertificationStatus = (typeof CERTIFICATION_STATUSES)[number]

export const CREDIT_ROLES = [
  "conceptualization",
  "data_curation",
  "formal_analysis",
  "funding_acquisition",
  "investigation",
  "methodology",
  "project_administration",
  "resources",
  "software",
  "supervision",
  "validation",
  "visualization",
  "writing_original_draft",
  "writing_review_editing",
] as const
export type CreditRole = (typeof CREDIT_ROLES)[number]

export type LicenseInfo = {
  id: string
  osiApproved: boolean
  kind: "software" | "content" | "data" | "hardware" | "mixed"
  url: string
  noteEs: string
  noteEn: string
}

function license(
  id: string,
  osiApproved: boolean,
  kind: LicenseInfo["kind"],
  url: string,
  noteEs: string,
  noteEn: string,
): LicenseInfo {
  return { id, osiApproved, kind, url, noteEs, noteEn }
}

/**
 * A deliberately small, auditable subset of SPDX identifiers. Unknown SPDX
 * identifiers are accepted as "unverified" rather than silently treated as
 * open source. The evaluator never downloads the SPDX license list.
 */
export const LICENSE_CATALOG: Readonly<Record<string, LicenseInfo>> = {
  "MIT": license("MIT", true, "software", "https://spdx.org/licenses/MIT.html", "Licencia permisiva de software.", "Permissive software license."),
  "Apache-2.0": license("Apache-2.0", true, "software", "https://spdx.org/licenses/Apache-2.0.html", "Licencia permisiva con concesión de patentes.", "Permissive license with a patent grant."),
  "BSD-2-Clause": license("BSD-2-Clause", true, "software", "https://spdx.org/licenses/BSD-2-Clause.html", "Licencia BSD de dos cláusulas.", "Two-clause BSD license."),
  "BSD-3-Clause": license("BSD-3-Clause", true, "software", "https://spdx.org/licenses/BSD-3-Clause.html", "Licencia BSD de tres cláusulas.", "Three-clause BSD license."),
  "ISC": license("ISC", true, "software", "https://spdx.org/licenses/ISC.html", "Licencia permisiva tipo ISC.", "ISC-style permissive license."),
  "MPL-2.0": license("MPL-2.0", true, "software", "https://spdx.org/licenses/MPL-2.0.html", "Licencia débil de copyleft por archivo.", "File-level weak copyleft license."),
  "LGPL-2.1-only": license("LGPL-2.1-only", true, "software", "https://spdx.org/licenses/LGPL-2.1-only.html", "Copyleft débil para bibliotecas.", "Weak copyleft for libraries."),
  "LGPL-3.0-only": license("LGPL-3.0-only", true, "software", "https://spdx.org/licenses/LGPL-3.0-only.html", "Copyleft débil para bibliotecas.", "Weak copyleft for libraries."),
  "GPL-2.0-only": license("GPL-2.0-only", true, "software", "https://spdx.org/licenses/GPL-2.0-only.html", "Copyleft fuerte.", "Strong copyleft."),
  "GPL-3.0-only": license("GPL-3.0-only", true, "software", "https://spdx.org/licenses/GPL-3.0-only.html", "Copyleft fuerte.", "Strong copyleft."),
  "AGPL-3.0-only": license("AGPL-3.0-only", true, "software", "https://spdx.org/licenses/AGPL-3.0-only.html", "Copyleft fuerte con cláusula de red.", "Strong copyleft with a network clause."),
  "EUPL-1.2": license("EUPL-1.2", true, "software", "https://spdx.org/licenses/EUPL-1.2.html", "Licencia pública de la Unión Europea.", "European Union Public License."),
  "Zlib": license("Zlib", true, "software", "https://spdx.org/licenses/Zlib.html", "Licencia permisiva tipo zlib.", "zlib-style permissive license."),
  "BSL-1.0": license("BSL-1.0", true, "software", "https://spdx.org/licenses/BSL-1.0.html", "Boost Software License.", "Boost Software License."),
  "Python-2.0": license("Python-2.0", true, "software", "https://spdx.org/licenses/Python-2.0.html", "Licencia de Python 2.0.", "Python 2.0 license."),
  "Unlicense": license("Unlicense", true, "software", "https://spdx.org/licenses/Unlicense.html", "Dedicación al dominio público.", "Public-domain dedication."),
  "CC0-1.0": license("CC0-1.0", false, "data", "https://creativecommons.org/publicdomain/zero/1.0/", "Dedicación al dominio público; no es una licencia OSI.", "Public-domain dedication; not an OSI license."),
  "CC-BY-4.0": license("CC-BY-4.0", false, "content", "https://creativecommons.org/licenses/by/4.0/", "Atribución; no es una licencia OSI.", "Attribution; not an OSI license."),
  "CC-BY-SA-4.0": license("CC-BY-SA-4.0", false, "content", "https://creativecommons.org/licenses/by-sa/4.0/", "Atribución y compartir igual; no es una licencia OSI.", "Attribution and share-alike; not an OSI license."),
  "CC-BY-ND-4.0": license("CC-BY-ND-4.0", false, "content", "https://creativecommons.org/licenses/by-nd/4.0/", "Atribución sin obras derivadas; no es una licencia OSI.", "Attribution, no derivatives; not an OSI license."),
  "CC-BY-NC-4.0": license("CC-BY-NC-4.0", false, "content", "https://creativecommons.org/licenses/by-nc/4.0/", "Atribución no comercial; no es una licencia OSI.", "Non-commercial attribution; not an OSI license."),
  "CC-BY-NC-SA-4.0": license("CC-BY-NC-SA-4.0", false, "content", "https://creativecommons.org/licenses/by-nc-sa/4.0/", "Atribución no comercial y compartir igual; no es una licencia OSI.", "Non-commercial attribution and share-alike; not an OSI license."),
  "CC-BY-NC-ND-4.0": license("CC-BY-NC-ND-4.0", false, "content", "https://creativecommons.org/licenses/by-nc-nd/4.0/", "Atribución no comercial sin derivadas; no es una licencia OSI.", "Non-commercial attribution, no derivatives; not an OSI license."),
  "ODbL-1.0": license("ODbL-1.0", false, "data", "https://opendatacommons.org/licenses/odbl/1-0/", "Licencia de bases de datos abiertas.", "Open Database License."),
  "PDDL-1.0": license("PDDL-1.0", false, "data", "https://opendatacommons.org/licenses/pddl/1-0/", "Dedicación de bases de datos al dominio público.", "Public Domain Dedication and License for databases."),
  "CERN-OHL-P-2.0": license("CERN-OHL-P-2.0", false, "hardware", "https://ohwr.org/cern_ohl_p_v2.txt", "Licencia de hardware abierto CERN, variante permisiva.", "CERN Open Hardware Licence, permissive variant."),
  "CERN-OHL-S-2.0": license("CERN-OHL-S-2.0", false, "hardware", "https://ohwr.org/cern_ohl_s_v2.txt", "Licencia de hardware abierto CERN, variante fuerte.", "CERN Open Hardware Licence, strongly reciprocal variant."),
  "CERN-OHL-W-2.0": license("CERN-OHL-W-2.0", false, "hardware", "https://ohwr.org/cern_ohl_w_v2.txt", "Licencia de hardware abierto CERN, variante débil.", "CERN Open Hardware Licence, weakly reciprocal variant."),
  "TAPR-OHL-1.0": license("TAPR-OHL-1.0", false, "hardware", "https://www.tapr.org/TAPR_Open_Hardware_License_v1.txt", "Licencia de hardware abierto TAPR.", "TAPR Open Hardware License."),
  "Solderpad-0.51": license("Solderpad-0.51", false, "hardware", "https://solderpad.org/licenses/SHL-0.51/", "Licencia de hardware Solderpad.", "Solderpad Hardware License."),
}

export function getLicenseInfo(identifier: string | undefined | null): LicenseInfo | null {
  if (!identifier) return null
  return LICENSE_CATALOG[identifier] ?? null
}

export function isOsiApprovedLicense(identifier: string | undefined | null): boolean {
  return Boolean(getLicenseInfo(identifier)?.osiApproved)
}

export function isHardwareLicense(identifier: string | undefined | null): boolean {
  return getLicenseInfo(identifier)?.kind === "hardware"
}

export const IDENTIFIER_RULES = {
  ror: {
    label: "ROR",
    pattern: /^0[a-hj-km-np-tv-z0-9]{8}$/,
    hintEs: "ROR usa 9 caracteres: 0 + 8 caracteres base32 en minúsculas.",
    hintEn: "ROR uses 9 characters: 0 + 8 lowercase base32 characters.",
    normalize(value: string) {
      return value.trim().replace(/^https?:\/\/(www\.)?ror\.org\//i, "").replace(/\/+$/, "").toLowerCase()
    },
  },
  orcid: {
    label: "ORCID",
    pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
    hintEs: "ORCID usa 16 dígitos con guiones y dígito de control.",
    hintEn: "ORCID uses 16 digits with hyphens and a check digit.",
    normalize: normalizeOrcid,
    validate: isValidOrcid,
  },
  isni: {
    label: "ISNI",
    pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
    hintEs: "ISNI usa 16 dígitos; este estándar valida formato, no resolución.",
    hintEn: "ISNI uses 16 digits; this standard validates format, not resolution.",
    normalize: normalizeIsni,
    validate: hasIsniFormat,
  },
  doi: {
    label: "DOI",
    pattern: /^10\.\d{4,9}\/\S+$/,
    hintEs: "Un DOI empieza por 10. y un prefijo registrado.",
    hintEn: "A DOI starts with 10. and a registered prefix.",
    normalize(value: string) {
      return value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    },
  },
  handle: {
    label: "Handle",
    pattern: /^\d+(?:\.\d+)*\/\S+$/,
    hintEs: "Un Handle usa un prefijo numérico y un sufijo.",
    hintEn: "A Handle uses a numeric prefix and a suffix.",
    normalize(value: string) {
      return value.trim().replace(/^https?:\/\/hdl\.handle\.net\//i, "")
    },
  },
  ark: {
    label: "ARK",
    pattern: /^(?:ark:\/|https?:\/\/\S+\/ark:\/)\d{5,9}\/\S+$/i,
    hintEs: "Un ARK identifica un objeto y su compromiso de persistencia.",
    hintEn: "An ARK identifies an object and its persistence commitment.",
    normalize(value: string) {
      return value.trim()
    },
  },
  spdx: {
    label: "SPDX",
    pattern: /^[A-Za-z0-9.+-]+$/,
    hintEs: "Usa un identificador SPDX; el catálogo local solo reconoce un subconjunto.",
    hintEn: "Use an SPDX identifier; the local catalog only recognizes a subset.",
    normalize(value: string) {
      return value.trim()
    },
  },
  jurisdiction: {
    label: "ISO 3166-1 alpha-2",
    pattern: /^[A-Z]{2}$/,
    hintEs: "Código de país de dos letras; no se resuelve el régimen legal.",
    hintEn: "Two-letter country code; the legal regime is not resolved.",
    normalize(value: string) {
      return value.trim().toUpperCase()
    },
  },
  currency: {
    label: "ISO 4217",
    pattern: /^[A-Z]{3}$/,
    hintEs: "Código de moneda de tres letras; no se convierte ni se valida su tasa.",
    hintEn: "Three-letter currency code; no conversion or rate validation.",
    normalize(value: string) {
      return value.trim().toUpperCase()
    },
  },
  language: {
    label: "BCP 47",
    pattern: /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/,
    hintEs: "Etiqueta de idioma; no se evalúa la calidad de la traducción.",
    hintEn: "Language tag; translation quality is not evaluated.",
    normalize(value: string) {
      return value.trim()
    },
  },
} as const

export function isValidRor(value: string): boolean {
  return IDENTIFIER_RULES.ror.pattern.test(IDENTIFIER_RULES.ror.normalize(value))
}

export function isValidDoi(value: string): boolean {
  return IDENTIFIER_RULES.doi.pattern.test(IDENTIFIER_RULES.doi.normalize(value))
}

export function isValidHandle(value: string): boolean {
  return IDENTIFIER_RULES.handle.pattern.test(IDENTIFIER_RULES.handle.normalize(value))
}

export function isValidArk(value: string): boolean {
  return IDENTIFIER_RULES.ark.pattern.test(IDENTIFIER_RULES.ark.normalize(value))
}

export function isIsoCountryCode(value: string): boolean {
  return IDENTIFIER_RULES.jurisdiction.pattern.test(IDENTIFIER_RULES.jurisdiction.normalize(value))
}

export function isIsoCurrencyCode(value: string): boolean {
  return IDENTIFIER_RULES.currency.pattern.test(IDENTIFIER_RULES.currency.normalize(value))
}

export function isBcp47LanguageTag(value: string): boolean {
  return IDENTIFIER_RULES.language.pattern.test(IDENTIFIER_RULES.language.normalize(value))
}

/**
 * Issuers that can, in principle, issue intergovernmental or international
 * standards. Presence in this list does not validate any specific claim.
 */
export const RECOGNIZED_INTERNATIONAL_ISSUERS = [
  "iso.org",
  "iec.ch",
  "itu.int",
  "unesco.org",
  "oecd.org",
  "un.org",
  "europa.eu",
] as const

export function isRecognizedInternationalIssuer(url: string | undefined | null): boolean {
  if (!url) return false
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return RECOGNIZED_INTERNATIONAL_ISSUERS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}
