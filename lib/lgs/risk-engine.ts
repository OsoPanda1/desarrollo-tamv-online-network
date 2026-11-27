/**
 * LATAMV Governance System — deterministic risk triage.
 *
 * This score is a prioritization aid, not a legal conclusion, safety proof,
 * certification, or substitute for contextual human review.
 */
export type RiskDimension = 1 | 2 | 3 | 4 | 5

export type RiskAssessmentInput = {
  likelihood: RiskDimension
  impact: RiskDimension
  exposure: RiskDimension
  velocity: RiskDimension
  uncertainty: RiskDimension
  irreversibility: RiskDimension
  rightsViolationLikely?: boolean
  safetyCriticalUncontrolled?: boolean
  humanOversightAbsent?: boolean
}

export type RiskBand = "low" | "moderate" | "high" | "very-high" | "critical"
export type RiskAssessment = {
  score: number
  band: RiskBand
  disposition: "review" | "mitigate" | "escalate" | "blocked"
  vetoes: string[]
  weights: Record<keyof Pick<RiskAssessmentInput, "likelihood" | "impact" | "exposure" | "velocity" | "uncertainty" | "irreversibility">, number>
  formula: string
}

const WEIGHTS = {
  likelihood: 0.2,
  impact: 0.3,
  exposure: 0.15,
  velocity: 0.1,
  uncertainty: 0.1,
  irreversibility: 0.15,
} as const

function assertDimension(name: string, value: unknown): asserts value is RiskDimension {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 5) {
    throw new RangeError(`${name} must be an integer from 1 to 5`)
  }
}

/**
 * Weighted score: 100 * (Σ(weight_i * dimension_i) - 1) / 4; maps the 1–5 scale to 0–100.
 * Rights/safety/oversight vetoes are non-compensatory: a low average cannot
 * cancel a hard-stop condition.
 */
export function assessLgsRisk(input: RiskAssessmentInput): RiskAssessment {
  for (const key of Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]) {
    assertDimension(key, input[key])
  }

  const weighted = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[])
    .reduce((sum, key) => sum + WEIGHTS[key] * input[key], 0)
  const score = Math.round(((weighted - 1) / 4) * 100)

  const vetoes: string[] = []
  if (input.rightsViolationLikely) vetoes.push("potential-rights-violation")
  if (input.safetyCriticalUncontrolled) vetoes.push("uncontrolled-safety-critical-risk")
  if (input.humanOversightAbsent) vetoes.push("required-human-oversight-absent")

  const band: RiskBand =
    score < 20 ? "low" :
    score < 40 ? "moderate" :
    score < 60 ? "high" :
    score < 80 ? "very-high" : "critical"

  const disposition: RiskAssessment["disposition"] = vetoes.length > 0
    ? "blocked"
    : band === "low" || band === "moderate"
      ? "review"
      : band === "high"
        ? "mitigate"
        : "escalate"

  return {
    score,
    band,
    disposition,
    vetoes,
    weights: { ...WEIGHTS },
    formula: "round(100 × (Σ(weightᵢ × dimensionᵢ) − 1) / 4); weights sum to 1",
  }
}
