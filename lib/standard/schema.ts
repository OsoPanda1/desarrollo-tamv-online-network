/**
 * Strict declaration schema for the TAMV Open Integrity Standard.
 *
 * The schema validates shape, enumerations and URL safety. Identifier formats
 * and semantic consistency are evaluated by `evaluator.ts`, so the report can
 * explain what is wrong instead of returning an opaque parse error.
 */

import { z } from "zod"
import { isSafeReferenceUrl } from "../validation.ts"
import {
  ACCESS_MODES,
  CERTIFICATION_CLAIM_TYPES,
  CERTIFICATION_STATUSES,
  CREDIT_ROLES,
  DOMAINS,
  FUNDING_MODELS,
  LEGAL_VEHICLES,
  MATURITY_LEVELS,
  METADATA_SCHEMAS,
  OUTPUT_TYPES,
  PAYMENT_PCI_SCOPES,
  PID_SCHEMES,
  REVIEW_MODELS,
  SUBJECT_TYPES,
} from "./taxonomy.ts"

export const DECLARATION_SCHEMA = "tamv.open_integrity.declaration.v1" as const

const ISO_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/

export const isoDateTime = z.string().refine((value) => {
  const match = ISO_WITH_ZONE.exec(value)
  if (!match || Number.isNaN(Date.parse(value))) return false
  const [, year, month, day] = match
  const calendar = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return (
    calendar.getUTCFullYear() === Number(year) &&
    calendar.getUTCMonth() === Number(month) - 1 &&
    calendar.getUTCDate() === Number(day)
  )
}, "Expected an ISO 8601 date-time with an explicit timezone")

export const safeHttpUrl = z
  .string()
  .trim()
  .url()
  .max(2048)
  .refine(isSafeReferenceUrl, "Expected a public HTTP/HTTPS URL without credentials, local hosts or private addresses")

const shortText = (min: number, max: number) => z.string().trim().min(min).max(max)
const optionalUrl = safeHttpUrl.optional()

const identifierSetSchema = z
  .object({
    ror: shortText(1, 64).optional(),
    isni: shortText(1, 32).optional(),
    orcid: shortText(1, 32).optional(),
    doi: shortText(1, 255).optional(),
    handle: shortText(1, 255).optional(),
    ark: shortText(1, 255).optional(),
    spdx: shortText(1, 64).optional(),
    funderId: shortText(1, 255).optional(),
    awardId: shortText(1, 120).optional(),
  })
  .strict()

const subjectSchema = z
  .object({
    id: shortText(1, 120),
    name: shortText(2, 200),
    type: z.enum(SUBJECT_TYPES),
    description: shortText(1, 2000).optional(),
    url: optionalUrl,
    jurisdiction: shortText(2, 2),
    identifiers: identifierSetSchema.default({}),
    license: shortText(1, 64).optional(),
    maturity: z.enum(MATURITY_LEVELS),
    domains: z.array(z.enum(DOMAINS)).min(1).max(8),
    claims: z
      .object({
        openSource: z.boolean().default(false),
        openScience: z.boolean().default(false),
        openHardware: z.boolean().default(false),
      })
      .strict()
      .default({ openSource: false, openScience: false, openHardware: false }),
    roles: z
      .array(
        z
          .object({
            name: shortText(2, 160),
            orcid: shortText(1, 32).optional(),
            credit: z.array(z.enum(CREDIT_ROLES)).max(14).default([]),
          })
          .strict(),
      )
      .max(100)
      .default([]),
  })
  .strict()

const fundingPoliciesSchema = z
  .object({
    giftAcceptanceUrl: optionalUrl,
    restrictedFundsUrl: optionalUrl,
    donorPrivacyUrl: optionalUrl,
    sanctionsUrl: optionalUrl,
    conflictOfInterestUrl: optionalUrl,
    complaintsUrl: optionalUrl,
    transparencyReportUrl: optionalUrl,
    auditUrl: optionalUrl,
    crossBorderReviewUrl: optionalUrl,
  })
  .strict()

const fundingSchema = z
  .object({
    active: z.boolean(),
    model: z.array(z.enum(FUNDING_MODELS)).max(10).default([]),
    legalVehicle: z.enum(LEGAL_VEHICLES).optional(),
    jurisdiction: shortText(2, 2).optional(),
    fiscalHost: z
      .object({
        name: shortText(2, 200),
        url: safeHttpUrl,
        agreementUrl: optionalUrl,
      })
      .strict()
      .optional(),
    taxStatus: z
      .object({
        status: shortText(2, 120),
        evidenceUrl: optionalUrl,
      })
      .strict()
      .optional(),
    currency: shortText(3, 3).optional(),
    policies: fundingPoliciesSchema.default({}),
    paymentProcessor: z
      .object({
        name: shortText(2, 120),
        pciScope: z.enum(PAYMENT_PCI_SCOPES),
        url: optionalUrl,
      })
      .strict()
      .optional(),
    crossBorder: z.boolean().default(false),
    notes: shortText(1, 1200).optional(),
  })
  .strict()

const publicationSchema = z
  .object({
    outputType: z.enum(OUTPUT_TYPES),
    repository: z
      .object({
        name: shortText(2, 160),
        url: safeHttpUrl,
        preservationPolicyUrl: optionalUrl,
        certification: z
          .object({
            scheme: shortText(2, 120),
            issuer: shortText(2, 160),
            evidenceUrl: optionalUrl,
            registryUrl: optionalUrl,
          })
          .strict()
          .optional(),
      })
      .strict(),
    persistentId: z
      .object({
        scheme: z.enum(PID_SCHEMES),
        value: shortText(1, 255),
      })
      .strict(),
    metadataSchema: z.enum(METADATA_SCHEMAS),
    version: shortText(1, 64),
    versioningPolicyUrl: optionalUrl,
    access: z.enum(ACCESS_MODES),
    review: z
      .object({
        model: z.enum(REVIEW_MODELS),
        evidenceUrl: optionalUrl,
        policyUrl: optionalUrl,
      })
      .strict(),
    license: shortText(1, 64),
    contributors: z
      .array(
        z
          .object({
            name: shortText(2, 160),
            orcid: shortText(1, 32).optional(),
            credit: z.array(z.enum(CREDIT_ROLES)).max(14).default([]),
          })
          .strict(),
      )
      .min(1)
      .max(200),
    fundingAcknowledgement: z
      .array(
        z
          .object({
            funderName: shortText(2, 200),
            funderId: shortText(1, 255).optional(),
            awardId: shortText(1, 120).optional(),
          })
          .strict(),
      )
      .max(30)
      .default([]),
    conflictOfInterest: shortText(1, 1200),
    dataAvailabilityUrl: optionalUrl,
    codeAvailabilityUrl: optionalUrl,
    ethics: z
      .object({
        humanSubjects: z.boolean().default(false),
        approvalUrl: optionalUrl,
        consentUrl: optionalUrl,
        animalWelfare: z.boolean().default(false),
        biologicalMaterials: z.boolean().default(false),
      })
      .strict()
      .optional(),
    indigenousData: z
      .object({
        involved: z.boolean(),
        careStatementUrl: optionalUrl,
      })
      .strict()
      .optional(),
    accessibilityUrl: optionalUrl,
    language: shortText(2, 35),
  })
  .strict()

const certificationClaimSchema = z
  .object({
    id: shortText(1, 80),
    claimType: z.enum(CERTIFICATION_CLAIM_TYPES),
    claimText: shortText(5, 500),
    issuer: z
      .object({
        name: shortText(2, 200),
        url: safeHttpUrl,
        type: z
          .enum([
            "intergovernmental",
            "standards_body",
            "accreditation_body",
            "certification_body",
            "repository",
            "publisher",
            "community",
            "self",
            "unknown",
          ])
          .default("unknown"),
        independence: shortText(2, 600),
      })
      .strict(),
    scheme: z
      .object({
        name: shortText(2, 160),
        version: shortText(1, 64),
        url: optionalUrl,
      })
      .strict(),
    scope: z
      .object({
        included: z.array(shortText(1, 200)).min(1).max(20),
        excluded: z.array(shortText(1, 200)).max(20).default([]),
      })
      .strict(),
    evidence: z
      .object({
        url: safeHttpUrl,
        digest: z.string().regex(/^(?:sha256:)?[a-f0-9]{64}$/i).optional(),
        issuedAt: isoDateTime.optional(),
        expiresAt: isoDateTime.optional(),
      })
      .strict(),
    status: z.enum(CERTIFICATION_STATUSES),
    registryUrl: optionalUrl,
    revocationPolicyUrl: optionalUrl,
    appealUrl: optionalUrl,
  })
  .strict()

const transparencySchema = z
  .object({
    provenanceUrl: optionalUrl,
    sourceUrl: optionalUrl,
    commit: shortText(1, 128).optional(),
    correctionsPolicyUrl: optionalUrl,
    appealsUrl: optionalUrl,
    lastReviewedAt: isoDateTime.optional(),
  })
  .strict()
  .default({})

const legalSchema = z
  .object({
    termsUrl: optionalUrl,
    privacyUrl: optionalUrl,
    dataProtection: z
      .object({
        personalData: z.boolean(),
        lawfulBasis: shortText(1, 200).optional(),
        statementUrl: optionalUrl,
      })
      .strict()
      .optional(),
    exportControl: z
      .object({
        controlled: z.boolean(),
        statementUrl: optionalUrl,
      })
      .strict()
      .optional(),
  })
  .strict()
  .default({})

const securitySchema = z
  .object({
    sbomUrl: optionalUrl,
    vulnerabilityPolicyUrl: optionalUrl,
    slsaLevel: z.number().int().min(0).max(4).optional(),
  })
  .strict()

const accessibilitySchema = z
  .object({
    statementUrl: optionalUrl,
    conformance: shortText(1, 120).optional(),
  })
  .strict()

export const declarationSchema = z
  .object({
    schemaVersion: z.literal(DECLARATION_SCHEMA),
    subject: subjectSchema,
    funding: fundingSchema,
    publication: publicationSchema,
    certificationClaims: z.array(certificationClaimSchema).max(20).default([]),
    transparency: transparencySchema,
    legal: legalSchema,
    security: securitySchema.optional(),
    accessibility: accessibilitySchema.optional(),
  })
  .strict()

export type Declaration = z.infer<typeof declarationSchema>
export type Subject = z.infer<typeof subjectSchema>
export type Funding = z.infer<typeof fundingSchema>
export type Publication = z.infer<typeof publicationSchema>
export type CertificationClaim = z.infer<typeof certificationClaimSchema>
export type Transparency = z.infer<typeof transparencySchema>
export type Legal = z.infer<typeof legalSchema>
export type Security = z.infer<typeof securitySchema>
export type Accessibility = z.infer<typeof accessibilitySchema>

export type ValidationIssue = {
  path: string
  code: string
  message: string
}

export function formatIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    code: issue.code,
    message: issue.message,
  }))
}
