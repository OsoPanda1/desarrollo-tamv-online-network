/**
 * Public entry point for the TAMV Open Integrity Standard (ETIA/TOIS).
 *
 * Everything exported here is safe to import from a server route, a CLI script,
 * a test or a browser component: no network calls, no database access and no
 * system clock reads.
 */

export * from "./taxonomy.ts"
export * from "./references.ts"
export * from "./schema.ts"
export * from "./evaluator.ts"
export * from "./canonical.ts"

import { declarationSchema, formatIssues, type Declaration } from "./schema.ts"
import {
  evaluateDeclaration,
  REPORT_SCHEMA,
  type EvaluationReport,
} from "./evaluator.ts"
import { REFERENCES, REFERENCE_GROUPS } from "./references.ts"
import {
  PILLARS,
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
  STANDARD_URL,
  STANDARD_VERSION,
} from "./taxonomy.ts"

export const STANDARD_LEVELS = [
  {
    id: "declared",
    labelEs: "Declarado",
    labelEn: "Declared",
    descriptionEs: "El sujeto afirma el dato. Nadie lo ha comprobado.",
    descriptionEn: "The subject states the fact. Nobody has checked it.",
  },
  {
    id: "documented",
    labelEs: "Documentado",
    labelEn: "Documented",
    descriptionEs: "Existe un documento o URL pública que puede leerse; su contenido no se verifica.",
    descriptionEn: "A public document or URL exists and can be read; its content is not verified.",
  },
  {
    id: "attested",
    labelEs: "Atestiguado",
    labelEn: "Attested",
    descriptionEs: "Un tercero declara haber emitido o registrado el hecho, con evidencia y registro enlazados.",
    descriptionEn: "A third party states it issued or registered the fact, with linked evidence and registry.",
  },
  {
    id: "verified",
    labelEs: "Verificado (reservado)",
    labelEn: "Verified (reserved)",
    descriptionEs: "Reservado para verificación externa reproducible. Este estándar no lo emite nunca.",
    descriptionEn: "Reserved for reproducible external verification. This standard never issues it.",
  },
] as const

export function getStandardCatalog() {
  return {
    schemaVersion: REPORT_SCHEMA,
    standard: {
      id: STANDARD_ID,
      version: STANDARD_VERSION,
      status: STANDARD_STATUS,
      nameEs: STANDARD_NAME_ES,
      nameEn: STANDARD_NAME_EN,
      shortEs: STANDARD_SHORT_ES,
      shortEn: STANDARD_SHORT_EN,
      url: STANDARD_URL,
    },
    semanticsEs: STANDARD_SEMANTICS_ES,
    semanticsEn: STANDARD_SEMANTICS_EN,
    limitationsEs: STANDARD_LIMITATIONS_ES,
    limitationsEn: STANDARD_LIMITATIONS_EN,
    outcomes: {
      complete: "Structural completeness only; not truth and not certification.",
      conditional: "Usable with warnings; read the remediation list before relying on it.",
      blocked: "Structural failure or contradiction; not a judgment about the subject's truth.",
    },
    evidenceLevels: STANDARD_LEVELS,
    pillars: PILLARS,
    endpoints: {
      catalog: "/api/v1/standard",
      references: "/api/v1/standard/references",
      evaluate: "/api/v1/standard/evaluate",
      declarationJsonSchema: "/api/v1/standard/schema",
      exampleDeclaration: "/standards/example-declaration.json",
      openapi: "/openapi.yaml",
    },
    references: {
      total: REFERENCES.length,
      groups: REFERENCE_GROUPS.map((group) => ({
        id: group.id,
        nameEs: group.nameEs,
        nameEn: group.nameEn,
        count: REFERENCES.filter((entry) => entry.group === group.id).length,
      })),
    },
  }
}

export type DeclarationValidation =
  | { ok: true; declaration: Declaration; report: EvaluationReport }
  | { ok: false; issues: ReturnType<typeof formatIssues> }

/**
 * Validate shape, then evaluate. Structural issues are returned separately so
 * callers can answer 422 with machine-readable paths instead of a report.
 */
export async function validateAndEvaluate(
  input: unknown,
  options: { referenceDate?: string } = {},
): Promise<DeclarationValidation> {
  const parsed = declarationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, issues: formatIssues(parsed.error) }
  }
  const report = await evaluateDeclaration(parsed.data, options)
  return { ok: true, declaration: parsed.data, report }
}
