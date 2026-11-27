/**
 * Fail-closed lifecycle gates for controlled changes to AI systems.
 * This pure evaluator does not replace an authenticated approval workflow.
 */
export const LGS_GATE_REQUIREMENTS = {
  G1_INITIATIVE: ["purposeDefined", "systemOwnerAssigned", "legalBasisReviewed"],
  G2_DESIGN: ["architectureDocumented", "dataInventoryReviewed", "riskAssessmentCompleted"],
  G3_DEVELOPMENT: ["testsPassed", "dependenciesReviewed", "artifactVersioned"],
  G4_EVALUATION: ["securityReviewed", "privacyReviewed", "impactAssessmentReviewed"],
  G5_AUTHORIZATION: ["independentReviewRecorded", "authorizedApproverRecorded", "rollbackPlanTested"],
  G6_PRODUCTION: ["monitoringEnabled", "incidentRunbookAvailable", "accessControlsVerified"],
  G7_CHANGE: ["changeImpactReviewed", "regressionTestsPassed", "newVersionRecorded"],
  G8_RETIREMENT: ["retentionDecisionRecorded", "credentialsRevoked", "disposalVerified"],
} as const

export type LgsGate = keyof typeof LGS_GATE_REQUIREMENTS
export type GateEvidence = Partial<Record<(typeof LGS_GATE_REQUIREMENTS)[LgsGate][number], boolean>>
export type GateEvaluation = {
  gate: LgsGate
  allowed: boolean
  missing: string[]
  decision: "allow-next-stage" | "block"
}

export function evaluateLgsGate(gate: LgsGate, evidence: GateEvidence): GateEvaluation {
  const required = LGS_GATE_REQUIREMENTS[gate] as readonly string[]
  const missing = required.filter((requirement) => evidence[requirement as keyof GateEvidence] !== true)
  const allowed = missing.length === 0
  return {
    gate,
    allowed,
    missing,
    decision: allowed ? "allow-next-stage" : "block",
  }
}
