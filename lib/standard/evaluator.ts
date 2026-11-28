/**
 * Deterministic evaluator for the TAMV Open Integrity Standard (ETIA/TOIS).
 *
 * The evaluator reads a validated declaration and produces a stable report.
 * It never fetches URLs, resolves identifiers, checks registries, contacts
 * certifiers or reads dates from the system clock. Time-based checks only run
 * when the caller supplies an explicit `referenceDate`, which is recorded in
 * the report and therefore covered by the digest.
 *
 * The report never asserts verification. `verification` is always
 * "unverified"; `evidence` per check is at most "attested". A "complete"
 * outcome means structural completeness, not truth.
 */

import type {
  CertificationClaim,
  Declaration,
  Funding,
  Publication,
  Subject,
} from "./schema.ts"
import {
  getLicenseInfo,
  isBcp47LanguageTag,
  isHardwareLicense,
  isIsoCountryCode,
  isIsoCurrencyCode,
  isOsiApprovedLicense,
  isValidArk,
  isValidDoi,
  isValidHandle,
  isValidRor,
  STANDARD_ID,
  STANDARD_LIMITATIONS_EN,
  STANDARD_LIMITATIONS_ES,
  STANDARD_NAME_EN,
  STANDARD_NAME_ES,
  STANDARD_SEMANTICS_EN,
  STANDARD_SEMANTICS_ES,
  STANDARD_SHORT_EN,
  STANDARD_SHORT_ES,
  STANDARD_STATUS,
  STANDARD_VERSION,
  type PillarId,
} from "./taxonomy.ts"
import { hasIsniFormat, isValidOrcid } from "../identifiers.ts"
import { digestReport, REPORT_CANONICALIZATION } from "./canonical.ts"

export const REPORT_SCHEMA = "tamv.open_integrity.report.v1" as const

export type CheckStatus = "pass" | "warn" | "fail" | "not_applicable"

/**
 * Declared evidence levels. "verified" exists only to document the reserved
 * level; this module never emits it.
 */
export const EVIDENCE_LEVELS = ["declared", "documented", "attested", "verified"] as const
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]
export type IssuedEvidenceLevel = Exclude<EvidenceLevel, "verified">

const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  declared: 0,
  documented: 1,
  attested: 2,
  verified: 3,
}

export type Check = {
  id: string
  pillar: PillarId
  titleEs: string
  titleEn: string
  status: CheckStatus
  evidence: IssuedEvidenceLevel
  detailEs: string
  detailEn: string
  remediationEs?: string
  remediationEn?: string
}

export type PillarStatus = "complete" | "conditional" | "blocked"

export type PillarSummary = {
  pillar: PillarId
  status: PillarStatus
  total: number
  passed: number
  warnings: number
  failed: number
  notApplicable: number
}

export type ClaimAssessment = {
  id: string
  claimType: CertificationClaim["claimType"]
  declaredStatus: CertificationClaim["status"]
  issuerType: CertificationClaim["issuer"]["type"]
  expiresAt: string | null
  expiresInDays: number | null
  expired: boolean | null
  evidence: IssuedEvidenceLevel
  verification: "unverified"
  noteEs: string
  noteEn: string
}

export type RemediationItem = {
  checkId: string
  pillar: PillarId
  severity: "warning" | "blocker"
  actionEs: string
  actionEn: string
}

export type EvaluationOutcome = "complete" | "conditional" | "blocked"

export type EvaluationReport = {
  schema: typeof REPORT_SCHEMA
  standard: {
    id: typeof STANDARD_ID
    version: typeof STANDARD_VERSION
    status: typeof STANDARD_STATUS
    nameEs: string
    nameEn: string
    shortEs: string
    shortEn: string
  }
  subject: {
    id: string
    name: string
    type: Subject["type"]
  }
  outcome: EvaluationOutcome
  outcomeMeaningEs: string
  outcomeMeaningEn: string
  verification: "unverified"
  evidenceCeiling: IssuedEvidenceLevel
  referenceDate: string | null
  pillars: PillarSummary[]
  checks: Check[]
  claimAssessments: ClaimAssessment[]
  limitationsEs: readonly string[]
  limitationsEn: readonly string[]
  remediation: RemediationItem[]
  semanticsEs: string
  semanticsEn: string
  canonicalization: typeof REPORT_CANONICALIZATION
  digestScope: string
  digest: string
}

export type EvaluateOptions = {
  /** Explicit clock for expiry and staleness checks. Never read from the system. */
  referenceDate?: string
}

const DAY_MS = 86_400_000

type CheckInput = Omit<Check, "remediationEs" | "remediationEn"> & {
  remediationEs?: string
  remediationEn?: string
}

function check(input: CheckInput): Check {
  const output: Check = {
    id: input.id,
    pillar: input.pillar,
    titleEs: input.titleEs,
    titleEn: input.titleEn,
    status: input.status,
    evidence: input.evidence,
    detailEs: input.detailEs,
    detailEn: input.detailEn,
  }
  if ((input.status === "warn" || input.status === "fail") && input.remediationEs && input.remediationEn) {
    output.remediationEs = input.remediationEs
    output.remediationEn = input.remediationEn
  }
  return output
}

function daysUntil(referenceDate: string | undefined, value: string | undefined): number | null {
  if (!referenceDate || !value) return null
  const reference = Date.parse(referenceDate)
  const target = Date.parse(value)
  if (!Number.isFinite(reference) || !Number.isFinite(target)) return null
  return Math.round((target - reference) / DAY_MS)
}

function isPast(referenceDate: string | undefined, value: string | undefined): boolean {
  const days = daysUntil(referenceDate, value)
  return days !== null && days < 0
}

function isFuture(referenceDate: string | undefined, value: string | undefined): boolean {
  const days = daysUntil(referenceDate, value)
  return days !== null && days > 0
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

function classificationChecks(decl: Declaration): Check[] {
  const subject = decl.subject
  const pillar = "classification" as const
  const checks: Check[] = []

  checks.push(
    check({
      id: "classification.identity",
      pillar,
      titleEs: "Identidad declarada",
      titleEn: "Declared identity",
      status: subject.description ? "pass" : "warn",
      evidence: "declared",
      detailEs: subject.description
        ? "El sujeto tiene identificador, nombre, tipo y descripción."
        : "El sujeto tiene identificador, nombre y tipo, pero no una descripción que permita distinguirlo.",
      detailEn: subject.description
        ? "The subject has an identifier, name, type and description."
        : "The subject has an identifier, name and type, but no description that distinguishes it.",
      remediationEs: "Añade una descripción breve y verificable del sujeto.",
      remediationEn: "Add a short, checkable description of the subject.",
    }),
  )

  checks.push(
    check({
      id: "classification.locator",
      pillar,
      titleEs: "Localizador público",
      titleEn: "Public locator",
      status: subject.url ? "pass" : "warn",
      evidence: subject.url ? "documented" : "declared",
      detailEs: subject.url
        ? "Existe una URL pública declarada para el sujeto."
        : "No se declara una URL pública; un tercero no puede localizar el sujeto desde la declaración.",
      detailEn: subject.url
        ? "A public URL is declared for the subject."
        : "No public URL is declared; a third party cannot locate the subject from the declaration.",
      remediationEs: "Declara una URL pública estable (sitio, repositorio o registro).",
      remediationEn: "Declare a stable public URL (site, repository or registry record).",
    }),
  )

  checks.push(
    check({
      id: "classification.jurisdiction",
      pillar,
      titleEs: "Jurisdicción",
      titleEn: "Jurisdiction",
      status: isIsoCountryCode(subject.jurisdiction) ? "pass" : "fail",
      evidence: "declared",
      detailEs: isIsoCountryCode(subject.jurisdiction)
        ? `El código de país ${subject.jurisdiction.toUpperCase()} tiene formato ISO 3166-1 alpha-2. El régimen legal no se resuelve.`
        : `El valor «${subject.jurisdiction}» no es un código ISO 3166-1 alpha-2.`,
      detailEn: isIsoCountryCode(subject.jurisdiction)
        ? `Country code ${subject.jurisdiction.toUpperCase()} has ISO 3166-1 alpha-2 format. The legal regime is not resolved.`
        : `The value «${subject.jurisdiction}» is not an ISO 3166-1 alpha-2 code.`,
      remediationEs: "Usa un código de país ISO 3166-1 alpha-2 de dos letras.",
      remediationEn: "Use a two-letter ISO 3166-1 alpha-2 country code.",
    }),
  )

  const present: Array<{ label: string; valid: boolean }> = []
  const identifiers = subject.identifiers
  if (identifiers.ror) present.push({ label: "ROR", valid: isValidRor(identifiers.ror) })
  if (identifiers.isni) present.push({ label: "ISNI", valid: hasIsniFormat(identifiers.isni) })
  if (identifiers.orcid) present.push({ label: "ORCID", valid: isValidOrcid(identifiers.orcid) })
  if (identifiers.doi) present.push({ label: "DOI", valid: isValidDoi(identifiers.doi) })
  if (identifiers.handle) present.push({ label: "Handle", valid: isValidHandle(identifiers.handle) })
  if (identifiers.ark) present.push({ label: "ARK", valid: isValidArk(identifiers.ark) })

  if (present.length === 0) {
    checks.push(
      check({
        id: "classification.identifiers",
        pillar,
        titleEs: "Identificadores persistentes",
        titleEn: "Persistent identifiers",
        status: "warn",
        evidence: "declared",
        detailEs: "No se declara ningún identificador persistente (ROR, ISNI, ORCID, DOI, Handle o ARK).",
        detailEn: "No persistent identifier is declared (ROR, ISNI, ORCID, DOI, Handle or ARK).",
        remediationEs: "Declara al menos un identificador con el formato correcto, sin afirmar que ya fue resuelto.",
        remediationEn: "Declare at least one correctly formatted identifier without claiming it has been resolved.",
      }),
    )
  } else {
    const invalid = present.filter((entry) => !entry.valid).map((entry) => entry.label)
    checks.push(
      check({
        id: "classification.identifiers",
        pillar,
        titleEs: "Identificadores persistentes",
        titleEn: "Persistent identifiers",
        status: invalid.length === 0 ? "pass" : "fail",
        evidence: "declared",
        detailEs:
          invalid.length === 0
            ? `Formato válido para ${present.map((entry) => entry.label).join(", ")}. El formato no prueba registro, titularidad ni vigencia.`
            : `Formato inválido para ${invalid.join(", ")}.`,
        detailEn:
          invalid.length === 0
            ? `Valid format for ${present.map((entry) => entry.label).join(", ")}. Format does not prove registration, ownership or currency.`
            : `Invalid format for ${invalid.join(", ")}.`,
        remediationEs: "Corrige los identificadores con formato inválido o retíralos hasta confirmarlos.",
        remediationEn: "Correct the malformed identifiers or remove them until confirmed.",
      }),
    )
  }

  const licenseInfo = getLicenseInfo(subject.license)
  checks.push(
    check({
      id: "classification.license",
      pillar,
      titleEs: "Licencia declarada",
      titleEn: "Declared license",
      status: !subject.license ? "warn" : licenseInfo ? "pass" : "warn",
      evidence: "declared",
      detailEs: !subject.license
        ? "El sujeto no declara licencia."
        : licenseInfo
          ? `Licencia reconocida en el catálogo local: ${licenseInfo.id}. El catálogo es un subconjunto de SPDX y no una aprobación legal.`
          : `La licencia «${subject.license}» no está en el catálogo local; puede ser válida, pero queda sin clasificar.`,
      detailEn: !subject.license
        ? "The subject declares no license."
        : licenseInfo
          ? `License recognized in the local catalog: ${licenseInfo.id}. The catalog is a subset of SPDX, not a legal approval.`
          : `License «${subject.license}» is not in the local catalog; it may be valid but remains unclassified.`,
      remediationEs: "Declara un identificador SPDX o una licencia Creative Commons / hardware reconocida.",
      remediationEn: "Declare an SPDX identifier or a recognized Creative Commons / hardware license.",
    }),
  )

  const claimsOpen = subject.claims.openSource || subject.claims.openScience || subject.claims.openHardware
  let opennessStatus: CheckStatus = "not_applicable"
  let opennessDetailEs = "No se declara apertura (código, ciencia o hardware)."
  let opennessDetailEn = "No openness claim is declared (source, science or hardware)."
  if (subject.claims.openSource) {
    if (isOsiApprovedLicense(subject.license)) {
      opennessStatus = "pass"
      opennessDetailEs = "La licencia figura como aprobada por OSI en el catálogo local; esto no audita el cumplimiento."
      opennessDetailEn = "The license is listed as OSI-approved in the local catalog; this does not audit compliance."
    } else {
      opennessStatus = "fail"
      opennessDetailEs = "Se declara código abierto, pero la licencia no figura como aprobada por OSI en el catálogo local."
      opennessDetailEn = "Open source is claimed, but the license is not listed as OSI-approved in the local catalog."
    }
  } else if (subject.claims.openHardware) {
    if (isHardwareLicense(subject.license)) {
      opennessStatus = "pass"
      opennessDetailEs = "La licencia figura como licencia de hardware abierto en el catálogo local."
      opennessDetailEn = "The license is listed as an open hardware license in the local catalog."
    } else {
      opennessStatus = "fail"
      opennessDetailEs = "Se declara hardware abierto, pero la licencia no figura como licencia de hardware."
      opennessDetailEn = "Open hardware is claimed, but the license is not listed as a hardware license."
    }
  } else if (subject.claims.openScience) {
    if (!subject.license) {
      opennessStatus = "fail"
      opennessDetailEs = "Se declara ciencia abierta sin licencia declarada."
      opennessDetailEn = "Open science is claimed without a declared license."
    } else {
      opennessStatus = "pass"
      opennessDetailEs = "Se declara ciencia abierta con licencia; la adecuación de la licencia al tipo de obra no se resuelve."
      opennessDetailEn = "Open science is claimed with a license; whether the license fits the work type is not resolved."
    }
  }
  checks.push(
    check({
      id: "classification.openness",
      pillar,
      titleEs: "Coherencia de apertura",
      titleEn: "Openness consistency",
      status: opennessStatus,
      evidence: "declared",
      detailEs: opennessDetailEs,
      detailEn: opennessDetailEn,
      remediationEs: "Alinea la afirmación de apertura con una licencia compatible o retira la afirmación.",
      remediationEn: "Align the openness claim with a compatible license or withdraw the claim.",
    }),
  )

  if (subject.roles.length === 0) {
    checks.push(
      check({
        id: "classification.roles",
        pillar,
        titleEs: "Roles de contribución",
        titleEn: "Contribution roles",
        status: subject.type === "person" || subject.type === "event" ? "not_applicable" : "warn",
        evidence: "declared",
        detailEs:
          subject.type === "person" || subject.type === "event"
            ? "Los roles CRediT no aplican a este tipo de sujeto."
            : "No se declaran roles de contribución para el sujeto.",
        detailEn:
          subject.type === "person" || subject.type === "event"
            ? "CRediT roles do not apply to this subject type."
            : "No contribution roles are declared for the subject.",
        remediationEs: "Declara quién hizo qué con roles CRediT y, cuando exista, su ORCID.",
        remediationEn: "Declare who did what using CRediT roles and, where available, their ORCID.",
      }),
    )
  } else {
    const invalidOrcids = subject.roles.filter((role) => role.orcid && !isValidOrcid(role.orcid))
    const withoutCredit = subject.roles.filter((role) => role.credit.length === 0)
    checks.push(
      check({
        id: "classification.roles",
        pillar,
        titleEs: "Roles de contribución",
        titleEn: "Contribution roles",
        status: invalidOrcids.length > 0 ? "fail" : withoutCredit.length > 0 ? "warn" : "pass",
        evidence: "declared",
        detailEs:
          invalidOrcids.length > 0
            ? `ORCID con formato inválido en ${invalidOrcids.map((role) => role.name).join(", ")}.`
            : withoutCredit.length > 0
              ? `${withoutCredit.length} rol(es) sin rol CRediT asignado.`
              : "Todos los roles declaran al menos un rol CRediT y sus ORCID tienen formato válido.",
        detailEn:
          invalidOrcids.length > 0
            ? `Malformed ORCID in ${invalidOrcids.map((role) => role.name).join(", ")}.`
            : withoutCredit.length > 0
              ? `${withoutCredit.length} role(s) have no CRediT role assigned.`
              : "Every role declares at least one CRediT role and valid ORCID formatting.",
        remediationEs: "Corrige los ORCID y asigna al menos un rol CRediT por persona.",
        remediationEn: "Fix the ORCID values and assign at least one CRediT role per person.",
      }),
    )
  }

  return checks
}

/* ------------------------------------------------------------------ */
/* Funding                                                             */
/* ------------------------------------------------------------------ */

function fundingChecks(decl: Declaration): Check[] {
  const funding: Funding = decl.funding
  const pillar = "funding" as const
  const checks: Check[] = []
  const active = funding.active

  checks.push(
    check({
      id: "funding.model",
      pillar,
      titleEs: "Modelo de recaudación",
      titleEn: "Funding model",
      status: !active ? "not_applicable" : funding.model.length > 0 ? "pass" : "fail",
      evidence: "declared",
      detailEs: !active
        ? "El sujeto declara no recaudar fondos."
        : funding.model.length > 0
          ? `Modelos declarados: ${funding.model.join(", ")}.`
          : "Se declara recaudación activa sin modelo de ingresos.",
      detailEn: !active
        ? "The subject declares that it does not raise funds."
        : funding.model.length > 0
          ? `Declared models: ${funding.model.join(", ")}.`
          : "Active fundraising is declared without a revenue model.",
      remediationEs: "Declara al menos un modelo de ingresos y el vehículo legal correspondiente.",
      remediationEn: "Declare at least one revenue model and the corresponding legal vehicle.",
    }),
  )

  checks.push(
    check({
      id: "funding.legal_vehicle",
      pillar,
      titleEs: "Vehículo legal",
      titleEn: "Legal vehicle",
      status: !active
        ? "not_applicable"
        : !funding.legalVehicle
          ? "fail"
          : funding.legalVehicle === "none" || funding.legalVehicle === "informal"
            ? "warn"
            : "pass",
      evidence: "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : !funding.legalVehicle
          ? "Se recaudan fondos sin declarar el vehículo legal que los recibe."
          : funding.legalVehicle === "none" || funding.legalVehicle === "informal"
            ? "El vehículo es informal o inexistente; la capacidad contractual, fiscal y de rendición de cuentas es limitada."
            : `Vehículo declarado: ${funding.legalVehicle}. La personalidad jurídica y el régimen fiscal no se verifican.`,
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : !funding.legalVehicle
          ? "Funds are raised without declaring the legal vehicle that receives them."
          : funding.legalVehicle === "none" || funding.legalVehicle === "informal"
            ? "The vehicle is informal or absent; contractual, tax and accountability capacity is limited."
            : `Declared vehicle: ${funding.legalVehicle}. Legal personality and tax regime are not verified.`,
      remediationEs: "Declara el vehículo legal (organización sin fines de lucro, patrocinador fiscal, cooperativa, empresa o institución pública) y su jurisdicción.",
      remediationEn: "Declare the legal vehicle (nonprofit, fiscal sponsor, cooperative, company or public institution) and its jurisdiction.",
    }),
  )

  const needsFiscalHost = funding.legalVehicle === "fiscal_sponsor" || funding.model.includes("fiscal_sponsorship")
  checks.push(
    check({
      id: "funding.fiscal_host",
      pillar,
      titleEs: "Patrocinio fiscal",
      titleEn: "Fiscal sponsorship",
      status: !needsFiscalHost ? "not_applicable" : !funding.fiscalHost ? "fail" : funding.fiscalHost.agreementUrl ? "pass" : "warn",
      evidence: funding.fiscalHost?.agreementUrl ? "documented" : "declared",
      detailEs: !needsFiscalHost
        ? "No se declara patrocinio fiscal."
        : !funding.fiscalHost
          ? "Se declara patrocinio fiscal sin identificar al patrocinador."
          : funding.fiscalHost.agreementUrl
            ? `Patrocinador declarado: ${funding.fiscalHost.name}, con URL de acuerdo publicada.`
            : `Patrocinador declarado: ${funding.fiscalHost.name}, sin URL de acuerdo que delimite el alcance.`,
      detailEn: !needsFiscalHost
        ? "No fiscal sponsorship is declared."
        : !funding.fiscalHost
          ? "Fiscal sponsorship is declared without naming the sponsor."
          : funding.fiscalHost.agreementUrl
            ? `Declared sponsor: ${funding.fiscalHost.name}, with a published agreement URL.`
            : `Declared sponsor: ${funding.fiscalHost.name}, without an agreement URL delimiting scope.`,
      remediationEs: "Identifica al patrocinador fiscal y publica el acuerdo o sus términos esenciales.",
      remediationEn: "Name the fiscal sponsor and publish the agreement or its essential terms.",
    }),
  )

  checks.push(
    check({
      id: "funding.tax_status",
      pillar,
      titleEs: "Estado fiscal",
      titleEn: "Tax status",
      status: !active || !funding.taxStatus ? "not_applicable" : funding.taxStatus.evidenceUrl ? "pass" : "warn",
      evidence: funding.taxStatus?.evidenceUrl ? "documented" : "declared",
      detailEs:
        !active || !funding.taxStatus
          ? "No se declara estado fiscal."
          : funding.taxStatus.evidenceUrl
            ? `Estado fiscal declarado: ${funding.taxStatus.status}, con evidencia enlazada.`
            : `Estado fiscal declarado: ${funding.taxStatus.status}, sin evidencia enlazada.`,
      detailEn:
        !active || !funding.taxStatus
          ? "No tax status is declared."
          : funding.taxStatus.evidenceUrl
            ? `Declared tax status: ${funding.taxStatus.status}, with linked evidence.`
            : `Declared tax status: ${funding.taxStatus.status}, with no linked evidence.`,
      remediationEs: "Enlaza el registro fiscal o retira la afirmación de deducibilidad.",
      remediationEn: "Link the tax record or withdraw the deductibility claim.",
    }),
  )

  const policies = funding.policies
  checks.push(
    check({
      id: "funding.gift_policy",
      pillar,
      titleEs: "Política de aceptación de donaciones",
      titleEn: "Gift acceptance policy",
      status: !active ? "not_applicable" : policies.giftAcceptanceUrl ? "pass" : "fail",
      evidence: policies.giftAcceptanceUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : policies.giftAcceptanceUrl
          ? "Existe una política publicada de aceptación de donaciones."
          : "Se recaudan fondos sin política publicada de aceptación de donaciones.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : policies.giftAcceptanceUrl
          ? "A published gift acceptance policy exists."
          : "Funds are raised without a published gift acceptance policy.",
      remediationEs: "Publica la política de aceptación, rechazo y devolución de donaciones.",
      remediationEn: "Publish the policy for accepting, refusing and returning donations.",
    }),
  )

  checks.push(
    check({
      id: "funding.donor_privacy",
      pillar,
      titleEs: "Privacidad de donantes",
      titleEn: "Donor privacy",
      status: !active ? "not_applicable" : policies.donorPrivacyUrl ? "pass" : "fail",
      evidence: policies.donorPrivacyUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : policies.donorPrivacyUrl
          ? "Existe una política publicada sobre datos de donantes."
          : "Se recaudan fondos sin política publicada sobre datos personales de donantes.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : policies.donorPrivacyUrl
          ? "A published policy on donor data exists."
          : "Funds are raised without a published policy on donors' personal data.",
      remediationEs: "Publica la base legal, retención y derechos aplicables a datos de donantes.",
      remediationEn: "Publish the lawful basis, retention and rights applicable to donor data.",
    }),
  )

  checks.push(
    check({
      id: "funding.sanctions",
      pillar,
      titleEs: "Cribado de sanciones",
      titleEn: "Sanctions screening",
      status: !active ? "not_applicable" : funding.crossBorder ? (policies.sanctionsUrl ? "pass" : "fail") : "not_applicable",
      evidence: policies.sanctionsUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : !funding.crossBorder
          ? "No se declara recaudación transfronteriza."
          : policies.sanctionsUrl
            ? "Se declara recaudación transfronteriza con política de sanciones publicada."
            : "Se declara recaudación transfronteriza sin política de sanciones publicada.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : !funding.crossBorder
          ? "No cross-border fundraising is declared."
          : policies.sanctionsUrl
            ? "Cross-border fundraising is declared with a published sanctions policy."
            : "Cross-border fundraising is declared without a published sanctions policy.",
      remediationEs: "Publica el procedimiento de cribado de sanciones aplicable a la jurisdicción y a la del donante.",
      remediationEn: "Publish the sanctions screening procedure applicable to your jurisdiction and the donor's.",
    }),
  )

  checks.push(
    check({
      id: "funding.conflict_of_interest",
      pillar,
      titleEs: "Conflicto de interés",
      titleEn: "Conflict of interest",
      status: !active ? "not_applicable" : policies.conflictOfInterestUrl ? "pass" : "warn",
      evidence: policies.conflictOfInterestUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : policies.conflictOfInterestUrl
          ? "Existe una política publicada de conflicto de interés."
          : "No se publica política de conflicto de interés para donantes, patrocinadores o proveedores.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : policies.conflictOfInterestUrl
          ? "A published conflict-of-interest policy exists."
          : "No conflict-of-interest policy is published for donors, sponsors or vendors.",
      remediationEs: "Publica cómo se identifican, declaran y gestionan los conflictos de interés.",
      remediationEn: "Publish how conflicts of interest are identified, disclosed and managed.",
    }),
  )

  checks.push(
    check({
      id: "funding.complaints",
      pillar,
      titleEs: "Canal de quejas",
      titleEn: "Complaints channel",
      status: !active ? "not_applicable" : policies.complaintsUrl ? "pass" : "warn",
      evidence: policies.complaintsUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : policies.complaintsUrl
          ? "Existe un canal publicado para quejas o apelaciones."
          : "No se publica un canal para quejas o apelaciones sobre la recaudación.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : policies.complaintsUrl
          ? "A published complaints or appeals channel exists."
          : "No complaints or appeals channel for fundraising is published.",
      remediationEs: "Publica un canal con plazo de respuesta y responsable.",
      remediationEn: "Publish a channel with a response window and an accountable owner.",
    }),
  )

  checks.push(
    check({
      id: "funding.transparency",
      pillar,
      titleEs: "Transparencia financiera",
      titleEn: "Financial transparency",
      status: !active
        ? "not_applicable"
        : policies.transparencyReportUrl || policies.auditUrl
          ? "pass"
          : "warn",
      evidence: policies.auditUrl ? "documented" : policies.transparencyReportUrl ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : policies.transparencyReportUrl || policies.auditUrl
          ? "Se publica un informe de transparencia o una auditoría."
          : "No se publica informe de transparencia ni auditoría.",
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : policies.transparencyReportUrl || policies.auditUrl
          ? "A transparency report or audit is published."
          : "No transparency report or audit is published.",
      remediationEs: "Publica un informe periódico de ingresos, gastos y saldos, idealmente auditado.",
      remediationEn: "Publish a periodic report of income, expenses and balances, ideally audited.",
    }),
  )

  checks.push(
    check({
      id: "funding.payment",
      pillar,
      titleEs: "Procesamiento de pagos",
      titleEn: "Payment processing",
      status: !active
        ? "not_applicable"
        : !funding.paymentProcessor
          ? "warn"
          : funding.paymentProcessor.pciScope === "hosted"
            ? "pass"
            : "warn",
      evidence: funding.paymentProcessor ? "documented" : "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : !funding.paymentProcessor
          ? "No se identifica el procesador de pagos."
          : funding.paymentProcessor.pciScope === "hosted"
            ? `Procesador declarado: ${funding.paymentProcessor.name}, con alcance PCI de página alojada.`
            : `Procesador declarado: ${funding.paymentProcessor.name}, con alcance PCI «${funding.paymentProcessor.pciScope}»; el alcance amplía obligaciones.`,
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : !funding.paymentProcessor
          ? "The payment processor is not identified."
          : funding.paymentProcessor.pciScope === "hosted"
            ? `Declared processor: ${funding.paymentProcessor.name}, with hosted-page PCI scope.`
            : `Declared processor: ${funding.paymentProcessor.name}, with PCI scope «${funding.paymentProcessor.pciScope}»; the scope expands obligations.`,
      remediationEs: "Identifica al procesador y usa el alcance PCI mínimo; no afirmes cumplimiento PCI sin evidencia.",
      remediationEn: "Name the processor and use the smallest PCI scope; do not claim PCI compliance without evidence.",
    }),
  )

  checks.push(
    check({
      id: "funding.restricted_funds",
      pillar,
      titleEs: "Fondos restringidos",
      titleEn: "Restricted funds",
      status: !active || !funding.model.includes("grants") ? "not_applicable" : policies.restrictedFundsUrl ? "pass" : "fail",
      evidence: policies.restrictedFundsUrl ? "documented" : "declared",
      detailEs: !active || !funding.model.includes("grants")
        ? "No se declaran subvenciones."
        : policies.restrictedFundsUrl
          ? "Se declara una política para fondos restringidos."
          : "Se declaran subvenciones sin política de fondos restringidos.",
      detailEn: !active || !funding.model.includes("grants")
        ? "No grants are declared."
        : policies.restrictedFundsUrl
          ? "A restricted-funds policy is declared."
          : "Grants are declared without a restricted-funds policy.",
      remediationEs: "Publica cómo se separan, contabilizan y reportan los fondos restringidos.",
      remediationEn: "Publish how restricted funds are segregated, accounted for and reported.",
    }),
  )

  checks.push(
    check({
      id: "funding.currency",
      pillar,
      titleEs: "Moneda",
      titleEn: "Currency",
      status: !active ? "not_applicable" : !funding.currency ? "warn" : isIsoCurrencyCode(funding.currency) ? "pass" : "fail",
      evidence: "declared",
      detailEs: !active
        ? "No aplica: no hay recaudación activa."
        : !funding.currency
          ? "No se declara la moneda de recaudación."
          : isIsoCurrencyCode(funding.currency)
            ? `Moneda declarada: ${funding.currency.toUpperCase()} (formato ISO 4217).`
            : `La moneda «${funding.currency}» no tiene formato ISO 4217.`,
      detailEn: !active
        ? "Not applicable: no active fundraising."
        : !funding.currency
          ? "The fundraising currency is not declared."
          : isIsoCurrencyCode(funding.currency)
            ? `Declared currency: ${funding.currency.toUpperCase()} (ISO 4217 format).`
            : `Currency «${funding.currency}» has no ISO 4217 format.`,
      remediationEs: "Declara la moneda principal con un código ISO 4217.",
      remediationEn: "Declare the main currency with an ISO 4217 code.",
    }),
  )

  return checks
}

/* ------------------------------------------------------------------ */
/* Publication                                                         */
/* ------------------------------------------------------------------ */

function publicationChecks(decl: Declaration): Check[] {
  const publication: Publication = decl.publication
  const pillar = "publication" as const
  const checks: Check[] = []

  checks.push(
    check({
      id: "publication.repository",
      pillar,
      titleEs: "Repositorio",
      titleEn: "Repository",
      status: publication.repository.preservationPolicyUrl ? "pass" : "warn",
      evidence: publication.repository.preservationPolicyUrl ? "documented" : "declared",
      detailEs: publication.repository.preservationPolicyUrl
        ? `Repositorio declarado: ${publication.repository.name}, con política de preservación enlazada.`
        : `Repositorio declarado: ${publication.repository.name}, sin política de preservación enlazada.`,
      detailEn: publication.repository.preservationPolicyUrl
        ? `Declared repository: ${publication.repository.name}, with a linked preservation policy.`
        : `Declared repository: ${publication.repository.name}, with no linked preservation policy.`,
      remediationEs: "Enlaza la política de preservación y el compromiso de persistencia del repositorio.",
      remediationEn: "Link the repository's preservation policy and persistence commitment.",
    }),
  )

  const cert = publication.repository.certification
  checks.push(
    check({
      id: "publication.repository_certification",
      pillar,
      titleEs: "Certificación del repositorio",
      titleEn: "Repository certification",
      status: !cert ? "not_applicable" : cert.evidenceUrl || cert.registryUrl ? "pass" : "warn",
      evidence: cert?.evidenceUrl && cert?.registryUrl ? "attested" : cert ? "documented" : "declared",
      detailEs: !cert
        ? "No se declara certificación del repositorio."
        : cert.evidenceUrl || cert.registryUrl
          ? `Certificación declarada: ${cert.scheme} por ${cert.issuer}, con evidencia o registro enlazado.`
          : `Certificación declarada: ${cert.scheme} por ${cert.issuer}, sin evidencia ni registro.`,
      detailEn: !cert
        ? "No repository certification is declared."
        : cert.evidenceUrl || cert.registryUrl
          ? `Declared certification: ${cert.scheme} by ${cert.issuer}, with linked evidence or registry.`
          : `Declared certification: ${cert.scheme} by ${cert.issuer}, without evidence or registry.`,
      remediationEs: "Enlaza el certificado y el registro público del esquema; recuerda que certifica al repositorio, no al dataset.",
      remediationEn: "Link the certificate and the scheme's public registry; remember it certifies the repository, not the dataset.",
    }),
  )

  const pid = publication.persistentId
  let pidValid = false
  let pidDetailEs: string
  let pidDetailEn: string
  if (pid.scheme === "doi") {
    pidValid = isValidDoi(pid.value)
    pidDetailEs = pidValid ? "El DOI tiene formato válido; no se resuelve." : "El valor no tiene formato de DOI."
    pidDetailEn = pidValid ? "The DOI has valid format; it is not resolved." : "The value is not DOI-formatted."
  } else if (pid.scheme === "handle") {
    pidValid = isValidHandle(pid.value)
    pidDetailEs = pidValid ? "El Handle tiene formato válido; no se resuelve." : "El valor no tiene formato de Handle."
    pidDetailEn = pidValid ? "The Handle has valid format; it is not resolved." : "The value is not Handle-formatted."
  } else if (pid.scheme === "ark") {
    pidValid = isValidArk(pid.value)
    pidDetailEs = pidValid ? "El ARK tiene formato válido; no se resuelve." : "El valor no tiene formato de ARK."
    pidDetailEn = pidValid ? "The ARK has valid format; it is not resolved." : "The value is not ARK-formatted."
  } else {
    pidDetailEs = "Se declara un identificador persistente de esquema «other»; el formato no se puede validar."
    pidDetailEn = "A persistent identifier with scheme «other» is declared; the format cannot be validated."
  }
  checks.push(
    check({
      id: "publication.persistent_id",
      pillar,
      titleEs: "Identificador persistente de la obra",
      titleEn: "Output persistent identifier",
      status: pid.scheme === "other" ? "warn" : pidValid ? "pass" : "fail",
      evidence: "declared",
      detailEs: pidDetailEs,
      detailEn: pidDetailEn,
      remediationEs: "Usa un DOI, Handle o ARK con formato válido y declara su agencia de registro.",
      remediationEn: "Use a valid DOI, Handle or ARK and name its registration agency.",
    }),
  )

  checks.push(
    check({
      id: "publication.metadata",
      pillar,
      titleEs: "Esquema de metadatos",
      titleEn: "Metadata schema",
      status: "pass",
      evidence: "declared",
      detailEs: `Esquema declarado: ${publication.metadataSchema}. La validación del documento de metadatos queda fuera de este evaluador.`,
      detailEn: `Declared schema: ${publication.metadataSchema}. Validating the metadata document is outside this evaluator.`,
    }),
  )

  checks.push(
    check({
      id: "publication.versioning",
      pillar,
      titleEs: "Versionado",
      titleEn: "Versioning",
      status: publication.versioningPolicyUrl ? "pass" : "warn",
      evidence: publication.versioningPolicyUrl ? "documented" : "declared",
      detailEs: publication.versioningPolicyUrl
        ? `Versión declarada: ${publication.version}, con política de versionado enlazada.`
        : `Versión declarada: ${publication.version}, sin política de versionado enlazada.`,
      detailEn: publication.versioningPolicyUrl
        ? `Declared version: ${publication.version}, with a linked versioning policy.`
        : `Declared version: ${publication.version}, with no linked versioning policy.`,
      remediationEs: "Publica cómo se crean, identifican y preservan las versiones.",
      remediationEn: "Publish how versions are created, identified and preserved.",
    }),
  )

  const review = publication.review
  checks.push(
    check({
      id: "publication.review",
      pillar,
      titleEs: "Revisión",
      titleEn: "Review",
      status:
        review.model === "none"
          ? "warn"
          : review.evidenceUrl
            ? "pass"
            : "warn",
      evidence: review.evidenceUrl ? "documented" : "declared",
      detailEs:
        review.model === "none"
          ? "No se declara modelo de revisión. La publicación no equivale a revisión por pares."
          : review.evidenceUrl
            ? `Modelo de revisión declarado: ${review.model}, con evidencia enlazada. La evidencia no prueba calidad científica.`
            : `Modelo de revisión declarado: ${review.model}, sin evidencia enlazada.`,
      detailEn:
        review.model === "none"
          ? "No review model is declared. Publication is not peer review."
          : review.evidenceUrl
            ? `Declared review model: ${review.model}, with linked evidence. Evidence does not prove scientific quality.`
            : `Declared review model: ${review.model}, with no linked evidence.`,
      remediationEs: "Declara el modelo de revisión y enlaza la política o el registro público correspondiente.",
      remediationEn: "Declare the review model and link the corresponding policy or public record.",
    }),
  )

  const pubLicense = getLicenseInfo(publication.license)
  checks.push(
    check({
      id: "publication.license",
      pillar,
      titleEs: "Licencia de la obra",
      titleEn: "Output license",
      status: pubLicense ? "pass" : publication.license ? "warn" : "fail",
      evidence: "declared",
      detailEs: pubLicense
        ? `Licencia reconocida: ${pubLicense.id}.`
        : publication.license
          ? `La licencia «${publication.license}» no está en el catálogo local; puede ser válida, pero queda sin clasificar.`
          : "La obra no declara licencia.",
      detailEn: pubLicense
        ? `Recognized license: ${pubLicense.id}.`
        : publication.license
          ? `License «${publication.license}» is not in the local catalog; it may be valid but remains unclassified.`
          : "The output declares no license.",
      remediationEs: "Declara una licencia SPDX, Creative Commons u ODbL adecuada al tipo de obra.",
      remediationEn: "Declare an SPDX, Creative Commons or ODbL license appropriate to the output type.",
    }),
  )

  const invalidContributorOrcids = publication.contributors.filter(
    (person) => person.orcid && !isValidOrcid(person.orcid),
  )
  const contributorsWithoutCredit = publication.contributors.filter((person) => person.credit.length === 0)
  checks.push(
    check({
      id: "publication.contributors",
      pillar,
      titleEs: "Contribuyentes y roles",
      titleEn: "Contributors and roles",
      status:
        invalidContributorOrcids.length > 0
          ? "fail"
          : contributorsWithoutCredit.length > 0
            ? "warn"
            : "pass",
      evidence: "declared",
      detailEs:
        invalidContributorOrcids.length > 0
          ? `ORCID con formato inválido en ${invalidContributorOrcids.map((person) => person.name).join(", ")}.`
          : contributorsWithoutCredit.length > 0
            ? `${contributorsWithoutCredit.length} contribuyente(s) sin rol CRediT asignado.`
            : `Todos los contribuyentes declaran roles CRediT y ORCID con formato válido.`,
      detailEn:
        invalidContributorOrcids.length > 0
          ? `Malformed ORCID in ${invalidContributorOrcids.map((person) => person.name).join(", ")}.`
          : contributorsWithoutCredit.length > 0
            ? `${contributorsWithoutCredit.length} contributor(s) have no CRediT role.`
            : "Every contributor declares CRediT roles and valid ORCID formatting.",
      remediationEs: "Corrige los ORCID y asigna roles CRediT a cada contribuyente.",
      remediationEn: "Fix the ORCID values and assign CRediT roles to every contributor.",
    }),
  )

  checks.push(
    check({
      id: "publication.funding_acknowledgement",
      pillar,
      titleEs: "Agradecimiento de financiación",
      titleEn: "Funding acknowledgement",
      status: !decl.funding.active
        ? "not_applicable"
        : publication.fundingAcknowledgement.length > 0
          ? "pass"
          : "warn",
      evidence: "declared",
      detailEs: !decl.funding.active
        ? "No aplica: no se declara financiación."
        : publication.fundingAcknowledgement.length > 0
          ? `Se reconocen ${publication.fundingAcknowledgement.length} fuente(s) de financiación.`
          : "Se declara financiación, pero la obra no reconoce fuentes ni adjudicaciones.",
      detailEn: !decl.funding.active
        ? "Not applicable: no funding is declared."
        : publication.fundingAcknowledgement.length > 0
          ? `${publication.fundingAcknowledgement.length} funding source(s) are acknowledged.`
          : "Funding is declared, but the output acknowledges no sources or awards.",
      remediationEs: "Reconoce cada fuente con su identificador de financiador y número de adjudicación cuando existan.",
      remediationEn: "Acknowledge each source with its funder identifier and award number where available.",
    }),
  )

  const needsAvailability =
    publication.outputType === "dataset" ||
    publication.outputType === "software" ||
    publication.outputType === "protocol" ||
    publication.outputType === "hardware"
  checks.push(
    check({
      id: "publication.data_availability",
      pillar,
      titleEs: "Disponibilidad de datos y código",
      titleEn: "Data and code availability",
      status: needsAvailability
        ? publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "pass"
          : "fail"
        : publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "pass"
          : "not_applicable",
      evidence: publication.dataAvailabilityUrl || publication.codeAvailabilityUrl ? "documented" : "declared",
      detailEs: needsAvailability
        ? publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "Se declara disponibilidad para un resultado que la requiere."
          : "El tipo de resultado requiere disponibilidad de datos o código, pero no se declara."
        : publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "Se declara disponibilidad adicional de datos o código."
          : "No se declara disponibilidad adicional.",
      detailEn: needsAvailability
        ? publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "Availability is declared for an output that requires it."
          : "The output type requires data or code availability, but none is declared."
        : publication.dataAvailabilityUrl || publication.codeAvailabilityUrl
          ? "Additional data or code availability is declared."
          : "No additional availability is declared.",
      remediationEs: "Declara dónde están los datos o el código, bajo qué licencia y con qué restricciones.",
      remediationEn: "Declare where the data or code is, under which license and with which restrictions.",
    }),
  )

  const ethics = publication.ethics
  let ethicsStatus: CheckStatus = "not_applicable"
  let ethicsDetailEs = "No aplica: el tipo de resultado no exige declaración ética."
  let ethicsDetailEn = "Not applicable: the output type does not require an ethics statement."
  if (ethics) {
    const missingApproval =
      (ethics.humanSubjects || ethics.animalWelfare || ethics.biologicalMaterials) && !ethics.approvalUrl
    const missingConsent = ethics.humanSubjects && !ethics.consentUrl && !ethics.approvalUrl
    ethicsStatus = missingApproval || missingConsent ? "fail" : "pass"
    ethicsDetailEs =
      ethicsStatus === "fail"
        ? "Se declaran sujetos humanos, bienestar animal o materiales biológicos sin aprobación ética enlazada."
        : "La declaración ética está presente para los elementos declarados."
    ethicsDetailEn =
      ethicsStatus === "fail"
        ? "Human subjects, animal welfare or biological materials are declared without a linked ethics approval."
        : "The ethics statement is present for the declared elements."
  } else if (publication.outputType === "article" || publication.outputType === "report" || publication.outputType === "thesis") {
    ethicsStatus = "warn"
    ethicsDetailEs = "El tipo de resultado suele requerir declaración ética, pero no se incluye."
    ethicsDetailEn = "The output type usually requires an ethics statement, but none is included."
  }
  checks.push(
    check({
      id: "publication.ethics",
      pillar,
      titleEs: "Declaración ética",
      titleEn: "Ethics statement",
      status: ethicsStatus,
      evidence: ethics?.approvalUrl || ethics?.consentUrl ? "documented" : "declared",
      detailEs: ethicsDetailEs,
      detailEn: ethicsDetailEn,
      remediationEs: "Enlaza la aprobación del comité y el consentimiento informado cuando correspondan.",
      remediationEn: "Link the committee approval and informed consent where applicable.",
    }),
  )

  const indigenous = publication.indigenousData
  checks.push(
    check({
      id: "publication.indigenous_data",
      pillar,
      titleEs: "Datos indígenas o comunitarios",
      titleEn: "Indigenous or community data",
      status: !indigenous ? "not_applicable" : !indigenous.involved ? "pass" : indigenous.careStatementUrl ? "pass" : "fail",
      evidence: indigenous?.careStatementUrl ? "documented" : "declared",
      detailEs: !indigenous
        ? "No se declara tratamiento de datos indígenas o comunitarios."
        : !indigenous.involved
          ? "Se declara que no hay datos indígenas o comunitarios involucrados."
          : indigenous.careStatementUrl
            ? "Se declara una declaración CARE enlazada para datos indígenas o comunitarios."
            : "Se declaran datos indígenas o comunitarios sin declaración CARE ni autoridad comunitaria.",
      detailEn: !indigenous
        ? "No Indigenous or community data processing is declared."
        : !indigenous.involved
          ? "No Indigenous or community data is declared involved."
          : indigenous.careStatementUrl
            ? "A linked CARE statement is declared for Indigenous or community data."
            : "Indigenous or community data is declared without a CARE statement or community authority.",
      remediationEs: "Documenta consentimiento libre, previo e informado, autoridad comunitaria y beneficios colectivos.",
      remediationEn: "Document free, prior and informed consent, community authority and collective benefit.",
    }),
  )

  checks.push(
    check({
      id: "publication.accessibility",
      pillar,
      titleEs: "Accesibilidad del contenido",
      titleEn: "Content accessibility",
      status: publication.accessibilityUrl ? "pass" : "warn",
      evidence: publication.accessibilityUrl ? "documented" : "declared",
      detailEs: publication.accessibilityUrl
        ? "Se enlaza una declaración de accesibilidad del contenido."
        : "No se enlaza una declaración de accesibilidad del contenido.",
      detailEn: publication.accessibilityUrl
        ? "A content accessibility statement is linked."
        : "No content accessibility statement is linked.",
      remediationEs: "Publica una declaración de accesibilidad con criterios y fecha de revisión.",
      remediationEn: "Publish an accessibility statement with criteria and a review date.",
    }),
  )

  checks.push(
    check({
      id: "publication.language",
      pillar,
      titleEs: "Idioma",
      titleEn: "Language",
      status: isBcp47LanguageTag(publication.language) ? "pass" : "fail",
      evidence: "declared",
      detailEs: isBcp47LanguageTag(publication.language)
        ? `Etiqueta de idioma válida: ${publication.language}. No se evalúa la calidad de la traducción.`
        : `La etiqueta «${publication.language}» no tiene formato BCP 47.`,
      detailEn: isBcp47LanguageTag(publication.language)
        ? `Valid language tag: ${publication.language}. Translation quality is not evaluated.`
        : `The tag «${publication.language}» is not BCP 47-formatted.`,
      remediationEs: "Usa una etiqueta BCP 47, por ejemplo es-MX o en.",
      remediationEn: "Use a BCP 47 tag, for example es-MX or en.",
    }),
  )

  return checks
}

/* ------------------------------------------------------------------ */
/* Certification                                                       */
/* ------------------------------------------------------------------ */

const OVERCLAIM_PATTERN = /\bcertific\w*|\bacredit\w*|\bapproved by\b|\baprobad[oa] por\b/i
const NEGATED_CLAIM_PATTERN =
  /\bno\s+(?:es|implica|constituye|sustituye|representa|equivale)\b|\bnot\s+(?:a|an|the)?\s*(?:certification|accreditation)\b|\bdoes\s+not\b|\bis\s+not\b|\bwithout\b|\bsin\b/i

function isIndependentClaim(claim: CertificationClaim): boolean {
  return claim.claimType === "third_party_certification" || claim.claimType === "accreditation"
}

/**
 * Detect affirmative overclaiming. A sentence that explicitly negates
 * certification ("no es una certificación") is not an overclaim.
 */
function hasOverclaim(text: string): boolean {
  const sentences = text.split(/[.;\n]+/)
  for (const sentence of sentences) {
    if (!OVERCLAIM_PATTERN.test(sentence)) continue
    if (NEGATED_CLAIM_PATTERN.test(sentence)) continue
    return true
  }
  return false
}

function certificationChecks(decl: Declaration, referenceDate: string | undefined): {
  checks: Check[]
  assessments: ClaimAssessment[]
} {
  const pillar = "certification" as const
  const checks: Check[] = []
  const assessments: ClaimAssessment[] = []

  if (decl.certificationClaims.length === 0) {
    checks.push(
      check({
        id: "certification.claims_absent",
        pillar,
        titleEs: "Afirmaciones de certificación",
        titleEn: "Certification claims",
        status: "not_applicable",
        evidence: "declared",
        detailEs: "No se declara ninguna certificación, acreditación, registro, indexación, insignia o premio. Ausencia de afirmación no es certificación.",
        detailEn: "No certification, accreditation, registration, indexing, badge or award is declared. Absence of a claim is not certification.",
      }),
    )
    return { checks, assessments }
  }

  for (const claim of decl.certificationClaims) {
    const prefix = `certification.${claim.id}`

    checks.push(
      check({
        id: `${prefix}.issuer`,
        pillar,
        titleEs: "Emisor e independencia",
        titleEn: "Issuer and independence",
        status:
          isIndependentClaim(claim) && claim.issuer.type === "self"
            ? "fail"
            : claim.issuer.type === "unknown"
              ? "warn"
              : "pass",
        evidence: "declared",
        detailEs:
          isIndependentClaim(claim) && claim.issuer.type === "self"
            ? "Se declara certificación o acreditación de tercero, pero el emisor es el propio sujeto."
            : claim.issuer.type === "unknown"
              ? "El tipo de emisor no se declara; la independencia no puede evaluarse."
              : `Emisor declarado como «${claim.issuer.type}». La independencia real no se verifica.`,
        detailEn:
          isIndependentClaim(claim) && claim.issuer.type === "self"
            ? "Third-party certification or accreditation is claimed, but the issuer is the subject itself."
            : claim.issuer.type === "unknown"
              ? "The issuer type is not declared; independence cannot be assessed."
              : `Issuer declared as «${claim.issuer.type}». Actual independence is not verified.`,
        remediationEs: "Nombra al emisor independiente o reclasifica la afirmación como autodeclaración, registro o indexación.",
        remediationEn: "Name the independent issuer or reclassify the claim as self-declaration, registration or indexing.",
      }),
    )

    checks.push(
      check({
        id: `${prefix}.wording`,
        pillar,
        titleEs: "Precisión del enunciado",
        titleEn: "Claim wording",
        status:
          !isIndependentClaim(claim) && hasOverclaim(claim.claimText)
            ? "fail"
            : "pass",
        evidence: "declared",
        detailEs:
          !isIndependentClaim(claim) && hasOverclaim(claim.claimText)
            ? "El enunciado usa lenguaje de certificación o acreditación para un registro, indexación, insignia o autodeclaración."
            : "El tipo de afirmación es coherente con el lenguaje usado en el enunciado.",
        detailEn:
          !isIndependentClaim(claim) && hasOverclaim(claim.claimText)
            ? "The statement uses certification or accreditation language for a registration, indexing, badge or self-declaration."
            : "The claim type is consistent with the language used in the statement.",
        remediationEs: "Describe el hecho exacto: «indexado en», «registrado en» o «autodeclarado», sin implicar certificación.",
        remediationEn: "Describe the exact fact: «indexed in», «registered in» or «self-declared», without implying certification.",
      }),
    )

    const expired = isPast(referenceDate, claim.evidence.expiresAt)
    const expiresInDays = daysUntil(referenceDate, claim.evidence.expiresAt)
    const issuedInFuture = isFuture(referenceDate, claim.evidence.issuedAt)

    checks.push(
      check({
        id: `${prefix}.evidence`,
        pillar,
        titleEs: "Evidencia y vigencia",
        titleEn: "Evidence and validity",
        status:
          expired || issuedInFuture
            ? "fail"
            : !claim.evidence.expiresAt && isIndependentClaim(claim)
              ? "warn"
              : !claim.evidence.digest && isIndependentClaim(claim)
                ? "warn"
                : "pass",
        evidence: claim.registryUrl ? "attested" : "documented",
        detailEs:
          expired
            ? "La fecha de expiración declarada es anterior a la fecha de referencia."
            : issuedInFuture
              ? "La fecha de emisión declarada es posterior a la fecha de referencia."
              : !claim.evidence.expiresAt && isIndependentClaim(claim)
                ? "No se declara ventana de vigencia para una certificación de tercero."
                : !claim.evidence.digest && isIndependentClaim(claim)
                  ? "No se declara digest de la evidencia de certificación."
                  : "La evidencia declarada incluye fecha y, cuando aplica, digest y vigencia.",
        detailEn:
          expired
            ? "The declared expiry date is earlier than the reference date."
            : issuedInFuture
              ? "The declared issue date is later than the reference date."
              : !claim.evidence.expiresAt && isIndependentClaim(claim)
                ? "No validity window is declared for third-party certification."
                : !claim.evidence.digest && isIndependentClaim(claim)
                  ? "No digest is declared for the certification evidence."
                  : "Declared evidence includes dates and, where applicable, a digest and validity window.",
        remediationEs: "Enlaza el certificado, su digest, fecha de emisión, expiración y estado actual en el registro del emisor.",
        remediationEn: "Link the certificate, its digest, issue date, expiry and current status in the issuer's registry.",
      }),
    )

    checks.push(
      check({
        id: `${prefix}.status`,
        pillar,
        titleEs: "Estado declarado",
        titleEn: "Declared status",
        status:
          claim.status === "active"
            ? "pass"
            : claim.status === "unknown"
              ? "warn"
              : "fail",
        evidence: "declared",
        detailEs:
          claim.status === "active"
            ? "El estado declarado es activo. El estado no se consulta en el registro."
            : claim.status === "unknown"
              ? "El estado es desconocido; una certificación sin estado verificable queda no verificada."
              : `El estado declarado es «${claim.status}»; no debe presentarse como vigente.`,
        detailEn:
          claim.status === "active"
            ? "The declared status is active. The status is not checked against the registry."
            : claim.status === "unknown"
              ? "The status is unknown; a certification without a checkable status remains unverified."
              : `The declared status is «${claim.status}»; it must not be presented as current.`,
        remediationEs: "Actualiza el estado desde el registro del emisor y retira la afirmación si está suspendida, revocada o expirada.",
        remediationEn: "Update the status from the issuer's registry and withdraw the claim if suspended, revoked or expired.",
      }),
    )

    checks.push(
      check({
        id: `${prefix}.scope`,
        pillar,
        titleEs: "Alcance",
        titleEn: "Scope",
        status:
          isIndependentClaim(claim) && claim.scope.excluded.length === 0 ? "warn" : "pass",
        evidence: "declared",
        detailEs:
          isIndependentClaim(claim) && claim.scope.excluded.length === 0
            ? "El alcance incluye elementos, pero no excluye ninguno; una certificación sin exclusiones suele sobreafirmar."
            : `El alcance declara ${claim.scope.included.length} elemento(s) incluido(s) y ${claim.scope.excluded.length} excluido(s).`,
        detailEn:
          isIndependentClaim(claim) && claim.scope.excluded.length === 0
            ? "The scope includes items but excludes none; a certification without exclusions often overclaims."
            : `The scope declares ${claim.scope.included.length} included and ${claim.scope.excluded.length} excluded item(s).`,
        remediationEs: "Explicita qué queda fuera, por ejemplo datasets individuales, sedes o periodos.",
        remediationEn: "State what is excluded, for example individual datasets, sites or periods.",
      }),
    )

    checks.push(
      check({
        id: `${prefix}.registry`,
        pillar,
        titleEs: "Registro público",
        titleEn: "Public registry",
        status:
          isIndependentClaim(claim) || claim.claimType === "registration" || claim.claimType === "indexing"
            ? claim.registryUrl
              ? "pass"
              : "warn"
            : "not_applicable",
        evidence: claim.registryUrl ? "attested" : "declared",
        detailEs: claim.registryUrl
          ? "Se enlaza un registro público donde el estado puede consultarse."
          : "No se enlaza un registro público; el estado no puede consultarse.",
        detailEn: claim.registryUrl
          ? "A public registry is linked where status can be checked."
          : "No public registry is linked; status cannot be checked.",
        remediationEs: "Enlaza la ficha del registro del emisor, no solo una copia local del certificado.",
        remediationEn: "Link the issuer's registry entry, not only a local copy of the certificate.",
      }),
    )

    checks.push(
      check({
        id: `${prefix}.redress`,
        pillar,
        titleEs: "Revocación y apelación",
        titleEn: "Revocation and appeal",
        status:
          isIndependentClaim(claim) && !claim.revocationPolicyUrl && !claim.appealUrl
            ? "warn"
            : "pass",
        evidence: claim.revocationPolicyUrl || claim.appealUrl ? "documented" : "declared",
        detailEs:
          isIndependentClaim(claim) && !claim.revocationPolicyUrl && !claim.appealUrl
            ? "No se enlaza política de revocación ni canal de apelación."
            : "Se declara política de revocación o canal de apelación, o no aplica.",
        detailEn:
          isIndependentClaim(claim) && !claim.revocationPolicyUrl && !claim.appealUrl
            ? "No revocation policy or appeal channel is linked."
            : "A revocation policy or appeal channel is declared, or it does not apply.",
        remediationEs: "Enlaza la política de revocación y el canal de apelación del emisor.",
        remediationEn: "Link the issuer's revocation policy and appeal channel.",
      }),
    )

    assessments.push({
      id: claim.id,
      claimType: claim.claimType,
      declaredStatus: claim.status,
      issuerType: claim.issuer.type,
      expiresAt: claim.evidence.expiresAt ?? null,
      expiresInDays,
      expired: claim.evidence.expiresAt ? Boolean(expired) : null,
      evidence: claim.registryUrl ? "attested" : "documented",
      verification: "unverified",
      noteEs: "La afirmación se evalúa por estructura y coherencia; no se consulta al emisor.",
      noteEn: "The claim is assessed for structure and consistency; the issuer is not contacted.",
    })
  }

  return { checks, assessments }
}

/* ------------------------------------------------------------------ */
/* Cross-cutting                                                       */
/* ------------------------------------------------------------------ */

function crossCuttingChecks(decl: Declaration, referenceDate: string | undefined): Check[] {
  const pillar = "cross_cutting" as const
  const checks: Check[] = []
  const transparency = decl.transparency
  const legal = decl.legal

  checks.push(
    check({
      id: "cross.provenance",
      pillar,
      titleEs: "Procedencia",
      titleEn: "Provenance",
      status: transparency.provenanceUrl
        ? "pass"
        : transparency.sourceUrl
          ? transparency.commit
            ? "pass"
            : "warn"
          : "fail",
      evidence: transparency.provenanceUrl ? "documented" : "declared",
      detailEs: transparency.provenanceUrl
        ? "Se enlaza un registro de procedencia."
        : transparency.sourceUrl
          ? transparency.commit
            ? "Se enlaza la fuente y un commit identificable."
            : "Se enlaza la fuente, pero no un commit o versión identificable."
          : "No se enlaza registro de procedencia ni fuente.",
      detailEn: transparency.provenanceUrl
        ? "A provenance record is linked."
        : transparency.sourceUrl
          ? transparency.commit
            ? "The source and an identifiable commit are linked."
            : "The source is linked, but not an identifiable commit or version."
          : "No provenance record or source is linked.",
      remediationEs: "Enlaza el repositorio, el commit exacto y, si existe, el registro de procedencia.",
      remediationEn: "Link the repository, the exact commit and, if available, the provenance record.",
    }),
  )

  const dataProtection = legal.dataProtection
  checks.push(
    check({
      id: "cross.data_protection",
      pillar,
      titleEs: "Protección de datos",
      titleEn: "Data protection",
      status: !dataProtection
        ? "warn"
        : !dataProtection.personalData
          ? "pass"
          : dataProtection.lawfulBasis && dataProtection.statementUrl
            ? "pass"
            : dataProtection.lawfulBasis
              ? "warn"
              : "fail",
      evidence: dataProtection?.statementUrl ? "documented" : "declared",
      detailEs: !dataProtection
        ? "No se declara si se tratan datos personales."
        : !dataProtection.personalData
          ? "Se declara que no se tratan datos personales."
          : dataProtection.lawfulBasis && dataProtection.statementUrl
            ? "Se declaran base legal y declaración de tratamiento."
            : dataProtection.lawfulBasis
              ? "Se declara base legal, pero no una declaración enlazada."
              : "Se declaran datos personales sin base legal.",
      detailEn: !dataProtection
        ? "Whether personal data is processed is not declared."
        : !dataProtection.personalData
          ? "No personal data processing is declared."
          : dataProtection.lawfulBasis && dataProtection.statementUrl
            ? "A lawful basis and a processing statement are declared."
            : dataProtection.lawfulBasis
              ? "A lawful basis is declared, but no linked statement."
              : "Personal data is declared without a lawful basis.",
      remediationEs: "Declara la base legal, la finalidad, la retención y los derechos aplicables en cada jurisdicción.",
      remediationEn: "Declare the lawful basis, purpose, retention and applicable rights in each jurisdiction.",
    }),
  )

  checks.push(
    check({
      id: "cross.privacy_notice",
      pillar,
      titleEs: "Aviso de privacidad",
      titleEn: "Privacy notice",
      status: legal.privacyUrl
        ? "pass"
        : decl.funding.active || dataProtection?.personalData
          ? "fail"
          : "warn",
      evidence: legal.privacyUrl ? "documented" : "declared",
      detailEs: legal.privacyUrl
        ? "Se enlaza un aviso de privacidad."
        : decl.funding.active || dataProtection?.personalData
          ? "Se recaudan fondos o se tratan datos personales sin aviso de privacidad enlazado."
          : "No se enlaza aviso de privacidad.",
      detailEn: legal.privacyUrl
        ? "A privacy notice is linked."
        : decl.funding.active || dataProtection?.personalData
          ? "Funds are raised or personal data is processed without a linked privacy notice."
          : "No privacy notice is linked.",
      remediationEs: "Publica un aviso de privacidad con finalidades, base legal, retención y contacto.",
      remediationEn: "Publish a privacy notice with purposes, lawful basis, retention and contact.",
    }),
  )

  checks.push(
    check({
      id: "cross.terms",
      pillar,
      titleEs: "Términos",
      titleEn: "Terms",
      status: legal.termsUrl ? "pass" : "warn",
      evidence: legal.termsUrl ? "documented" : "declared",
      detailEs: legal.termsUrl ? "Se enlazan términos publicados." : "No se enlazan términos de uso o participación.",
      detailEn: legal.termsUrl ? "Published terms are linked." : "No terms of use or participation are linked.",
      remediationEs: "Publica términos con responsabilidades, licencias y resolución de disputas.",
      remediationEn: "Publish terms covering responsibilities, licenses and dispute resolution.",
    }),
  )

  const exportControl = legal.exportControl
  checks.push(
    check({
      id: "cross.export_control",
      pillar,
      titleEs: "Control de exportación",
      titleEn: "Export control",
      status: !exportControl
        ? "not_applicable"
        : !exportControl.controlled
          ? "pass"
          : exportControl.statementUrl
            ? "pass"
            : "fail",
      evidence: exportControl?.statementUrl ? "documented" : "declared",
      detailEs: !exportControl
        ? "No se declara evaluación de control de exportación."
        : !exportControl.controlled
          ? "Se declara que no hay bienes o tecnologías controladas."
          : exportControl.statementUrl
            ? "Se declara control de exportación con declaración enlazada."
            : "Se declara control de exportación sin declaración enlazada.",
      detailEn: !exportControl
        ? "No export-control assessment is declared."
        : !exportControl.controlled
          ? "No controlled goods or technologies are declared."
          : exportControl.statementUrl
            ? "Export control is declared with a linked statement."
            : "Export control is declared without a linked statement.",
      remediationEs: "Enlaza la clasificación aplicable y el procedimiento de cumplimiento.",
      remediationEn: "Link the applicable classification and compliance procedure.",
    }),
  )

  const softwareLike = decl.publication.outputType === "software" || decl.publication.outputType === "hardware"
  checks.push(
    check({
      id: "cross.security",
      pillar,
      titleEs: "Seguridad del software",
      titleEn: "Software security",
      status: !softwareLike
        ? "not_applicable"
        : decl.security?.sbomUrl || decl.security?.vulnerabilityPolicyUrl
          ? "pass"
          : "warn",
      evidence: decl.security?.sbomUrl || decl.security?.vulnerabilityPolicyUrl ? "documented" : "declared",
      detailEs: !softwareLike
        ? "No aplica: el resultado no es software ni hardware."
        : decl.security?.sbomUrl || decl.security?.vulnerabilityPolicyUrl
          ? "Se enlaza SBOM o política de vulnerabilidades."
          : "Un resultado de software o hardware no enlaza SBOM ni política de vulnerabilidades.",
      detailEn: !softwareLike
        ? "Not applicable: the output is not software or hardware."
        : decl.security?.sbomUrl || decl.security?.vulnerabilityPolicyUrl
          ? "An SBOM or vulnerability policy is linked."
          : "A software or hardware output links neither an SBOM nor a vulnerability policy.",
      remediationEs: "Publica un SBOM y un canal para reportar vulnerabilidades.",
      remediationEn: "Publish an SBOM and a channel to report vulnerabilities.",
    }),
  )

  const slsa = decl.security?.slsaLevel
  checks.push(
    check({
      id: "cross.supply_chain",
      pillar,
      titleEs: "Cadena de suministro",
      titleEn: "Supply chain",
      status: slsa === undefined ? "not_applicable" : slsa === 0 ? "pass" : "warn",
      evidence: "declared",
      detailEs:
        slsa === undefined
          ? "No se declara nivel SLSA."
          : slsa === 0
            ? "Se declara SLSA 0, sin garantías de procedencia."
            : `Se declara SLSA ${slsa}. Un nivel declarado requiere procedencia verificable que este evaluador no comprueba.`,
      detailEn:
        slsa === undefined
          ? "No SLSA level is declared."
          : slsa === 0
            ? "SLSA 0 is declared, with no provenance guarantees."
            : `SLSA ${slsa} is declared. A declared level requires verifiable provenance that this evaluator does not check.`,
      remediationEs: "Enlaza la atestación de procedencia del artefacto o retira el nivel declarado.",
      remediationEn: "Link the artifact's provenance attestation or withdraw the declared level.",
    }),
  )

  checks.push(
    check({
      id: "cross.accessibility",
      pillar,
      titleEs: "Accesibilidad del servicio",
      titleEn: "Service accessibility",
      status: decl.accessibility?.statementUrl || decl.accessibility?.conformance ? "pass" : "warn",
      evidence: decl.accessibility?.statementUrl ? "documented" : "declared",
      detailEs: decl.accessibility?.statementUrl || decl.accessibility?.conformance
        ? `Se declara accesibilidad${decl.accessibility?.conformance ? `: ${decl.accessibility.conformance}` : ""}.`
        : "No se declara accesibilidad del servicio ni del sitio.",
      detailEn: decl.accessibility?.statementUrl || decl.accessibility?.conformance
        ? `Accessibility is declared${decl.accessibility?.conformance ? `: ${decl.accessibility.conformance}` : ""}.`
        : "No service or site accessibility is declared.",
      remediationEs: "Publica una declaración con criterios WCAG, alcance y fecha de revisión.",
      remediationEn: "Publish a statement with WCAG criteria, scope and review date.",
    }),
  )

  checks.push(
    check({
      id: "cross.corrections",
      pillar,
      titleEs: "Correcciones y apelaciones",
      titleEn: "Corrections and appeals",
      status: transparency.correctionsPolicyUrl || transparency.appealsUrl ? "pass" : "warn",
      evidence: transparency.correctionsPolicyUrl || transparency.appealsUrl ? "documented" : "declared",
      detailEs: transparency.correctionsPolicyUrl || transparency.appealsUrl
        ? "Se enlaza una política de correcciones o un canal de apelación."
        : "No se enlaza política de correcciones ni canal de apelación.",
      detailEn: transparency.correctionsPolicyUrl || transparency.appealsUrl
        ? "A corrections policy or appeal channel is linked."
        : "No corrections policy or appeal channel is linked.",
      remediationEs: "Publica cómo se corrigen errores y cómo se apela una decisión.",
      remediationEn: "Publish how errors are corrected and how a decision can be appealed.",
    }),
  )

  const lastReviewedDays = daysUntil(referenceDate, transparency.lastReviewedAt)
  checks.push(
    check({
      id: "cross.review_recency",
      pillar,
      titleEs: "Revisión reciente",
      titleEn: "Review recency",
      status:
        lastReviewedDays === null
          ? "warn"
          : lastReviewedDays > 730
            ? "warn"
            : "pass",
      evidence: "declared",
      detailEs:
        lastReviewedDays === null
          ? "No se declara fecha de última revisión o no hay fecha de referencia para evaluarla."
          : lastReviewedDays > 730
            ? `La última revisión declarada tiene más de dos años (${lastReviewedDays} días).`
            : `La última revisión declarada está dentro de dos años (${lastReviewedDays} días).`,
      detailEn:
        lastReviewedDays === null
          ? "No last-reviewed date is declared, or no reference date is available to assess it."
          : lastReviewedDays > 730
            ? `The declared last review is older than two years (${lastReviewedDays} days).`
            : `The declared last review is within two years (${lastReviewedDays} days).`,
      remediationEs: "Declara una fecha de revisión ISO 8601 con zona horaria y actualízala al cambiar el sujeto.",
      remediationEn: "Declare an ISO 8601 last-reviewed date with timezone and update it when the subject changes.",
    }),
  )

  return checks
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

const PILLAR_ORDER: PillarId[] = ["classification", "funding", "publication", "certification", "cross_cutting"]

function summarizePillar(pillar: PillarId, checks: Check[]): PillarSummary {
  const scoped = checks.filter((entry) => entry.pillar === pillar)
  const failed = scoped.filter((entry) => entry.status === "fail").length
  const warnings = scoped.filter((entry) => entry.status === "warn").length
  const passed = scoped.filter((entry) => entry.status === "pass").length
  const notApplicable = scoped.filter((entry) => entry.status === "not_applicable").length
  const status: PillarStatus = failed > 0 ? "blocked" : warnings > 0 ? "conditional" : "complete"
  return { pillar, status, total: scoped.length, passed, warnings, failed, notApplicable }
}

function outcomeOf(pillars: PillarSummary[]): EvaluationOutcome {
  if (pillars.some((entry) => entry.status === "blocked")) return "blocked"
  if (pillars.some((entry) => entry.status === "conditional")) return "conditional"
  return "complete"
}

function evidenceCeilingOf(checks: Check[]): IssuedEvidenceLevel {
  const relevant = checks.filter((entry) => entry.status !== "not_applicable")
  if (relevant.length === 0) return "declared"
  let minimum: IssuedEvidenceLevel = "attested"
  for (const entry of relevant) {
    if (EVIDENCE_RANK[entry.evidence] < EVIDENCE_RANK[minimum]) minimum = entry.evidence
  }
  return minimum
}

function remediationOf(checks: Check[]): RemediationItem[] {
  return checks
    .filter((entry) => (entry.status === "warn" || entry.status === "fail") && entry.remediationEs && entry.remediationEn)
    .map((entry) => ({
      checkId: entry.id,
      pillar: entry.pillar,
      severity: entry.status === "fail" ? ("blocker" as const) : ("warning" as const),
      actionEs: entry.remediationEs as string,
      actionEn: entry.remediationEn as string,
    }))
}

const OUTCOME_MEANING_ES: Record<EvaluationOutcome, string> = {
  complete:
    "La declaración está estructuralmente completa según este estándar. No significa que los datos sean verdaderos, que los identificadores resuelvan ni que exista una certificación válida.",
  conditional:
    "La declaración es utilizable, pero tiene advertencias que un tercero debe leer antes de confiar en ella. No es una certificación.",
  blocked:
    "La declaración tiene fallos estructurales o contradicciones que impiden tratarla como completa. No se emite juicio sobre la verdad del sujeto.",
}

const OUTCOME_MEANING_EN: Record<EvaluationOutcome, string> = {
  complete:
    "The declaration is structurally complete under this standard. It does not mean the data is true, that identifiers resolve, or that any certification is valid.",
  conditional:
    "The declaration is usable but has warnings a third party must read before relying on it. It is not a certification.",
  blocked:
    "The declaration has structural failures or contradictions that prevent treating it as complete. No judgment is made about the subject's truth.",
}

/**
 * Evaluate a validated declaration. Deterministic for a given declaration and
 * reference date: no clock reads, no network, no random values.
 */
export async function evaluateDeclaration(
  declaration: Declaration,
  options: EvaluateOptions = {},
): Promise<EvaluationReport> {
  const referenceDate = options.referenceDate

  const certification = certificationChecks(declaration, referenceDate)
  const checks: Check[] = [
    ...classificationChecks(declaration),
    ...fundingChecks(declaration),
    ...publicationChecks(declaration),
    ...certification.checks,
    ...crossCuttingChecks(declaration, referenceDate),
  ]

  const pillars = PILLAR_ORDER.map((pillar) => summarizePillar(pillar, checks))
  const outcome = outcomeOf(pillars)

  const body = {
    schema: REPORT_SCHEMA,
    standard: {
      id: STANDARD_ID,
      version: STANDARD_VERSION,
      status: STANDARD_STATUS,
      nameEs: STANDARD_NAME_ES,
      nameEn: STANDARD_NAME_EN,
      shortEs: STANDARD_SHORT_ES,
      shortEn: STANDARD_SHORT_EN,
    },
    subject: {
      id: declaration.subject.id,
      name: declaration.subject.name,
      type: declaration.subject.type,
    },
    outcome,
    outcomeMeaningEs: OUTCOME_MEANING_ES[outcome],
    outcomeMeaningEn: OUTCOME_MEANING_EN[outcome],
    verification: "unverified" as const,
    evidenceCeiling: evidenceCeilingOf(checks),
    referenceDate: referenceDate ?? null,
    pillars,
    checks,
    claimAssessments: certification.assessments,
    limitationsEs: STANDARD_LIMITATIONS_ES,
    limitationsEn: STANDARD_LIMITATIONS_EN,
    remediation: remediationOf(checks),
    semanticsEs: STANDARD_SEMANTICS_ES,
    semanticsEn: STANDARD_SEMANTICS_EN,
    canonicalization: REPORT_CANONICALIZATION,
    digestScope:
      "SHA-256 over this report serialized with tamv-jcs-1, excluding the digest field. The reference date, when supplied, is part of the digest.",
  }

  const digest = await digestReport(body)
  return { ...body, digest }
}

export { PILLAR_ORDER }
