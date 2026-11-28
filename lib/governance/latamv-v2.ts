/**
 * LATAMV 2.0 local policy evaluator.
 *
 * Scope: deterministic, versioned rule selection with validity windows and
 * fail-closed decision logic. It does NOT verify signatures, DID ownership,
 * zero-knowledge proofs, stakeholder identities, legal compliance, or any
 * production authorization. `signatureMetadata` is an unverified label only.
 */

export type Jurisdiction = "EU" | "US" | "CN" | "LATAM" | "SV";
export type Severity = "low" | "medium" | "high" | "critical";
export type ImpactLevel = 0 | 1 | 2 | 3 | 4;
export type RuleCondition =
  | "pii_without_consent"
  | "restricted_dataset"
  | "high_impact_action"
  | "unverified_rule";

export interface RegulatoryGene {
  ruleId: string;
  jurisdiction: Jurisdiction;
  validFrom: string;
  validUntil: string;
  condition: RuleCondition;
  action: "DENY" | "REQUIRE_CONSENSUS" | "ALLOW";
  severity: Severity;
  source: string;
  signatureMetadata?: string;
}

export interface GovernanceContext {
  jurisdiction: Jurisdiction;
  condition: RuleCondition;
  impact: ImpactLevel;
  identity: boolean;
  authority: boolean;
  policy: boolean;
  evidence: boolean;
  safety: boolean;
  consensusApprovals: number;
}

export interface GovernanceDecision {
  allowed: boolean;
  reason:
    | "no_active_rule"
    | "rule_denied"
    | "missing_factor"
    | "consensus_insufficient"
    | "all_factors_present";
  matchedRuleId: string | null;
  requiredApprovals: number;
  evaluatedAt: string;
}

const severityRank: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isGeneActive(gene: RegulatoryGene, at: string): boolean {
  if (!isValidDateOnly(gene.validFrom) || !isValidDateOnly(gene.validUntil)) return false;
  if (gene.validFrom > gene.validUntil) return false;
  const day = at.slice(0, 10);
  return day >= gene.validFrom && day <= gene.validUntil;
}

/** Approval counts are arithmetic thresholds, not verified stakeholder signatures. */
export function requiredApprovals(impact: ImpactLevel): number {
  if (impact === 4) return 3;
  if (impact === 2 || impact === 3) return 2;
  return 1;
}

function strictestGene(genes: RegulatoryGene[], jurisdiction: Jurisdiction): RegulatoryGene | null {
  return genes.reduce<RegulatoryGene | null>((winner, gene) => {
    if (!winner) return gene;
    const rankDifference = severityRank[gene.severity] - severityRank[winner.severity];
    if (rankDifference > 0) return gene;
    if (rankDifference < 0) return winner;
    if (gene.jurisdiction === jurisdiction && winner.jurisdiction !== jurisdiction) return gene;
    return winner.ruleId <= gene.ruleId ? winner : gene;
  }, null);
}

/**
 * Deny by default. A rule must be active for the supplied date; the strictest
 * matching rule wins; every factor and the impact-based approval count must be
 * satisfied before ALLOW is returned.
 */
export function evaluateConstitution(
  genes: RegulatoryGene[],
  context: GovernanceContext,
  at: string,
): GovernanceDecision {
  const required = requiredApprovals(context.impact);
  const base = { requiredApprovals: required, evaluatedAt: at };

  const matching = genes.filter(
    (gene) => gene.condition === context.condition && isGeneActive(gene, at),
  );
  const gene = strictestGene(matching, context.jurisdiction);
  if (!gene) return { ...base, allowed: false, reason: "no_active_rule", matchedRuleId: null };
  if (gene.action === "DENY") {
    return { ...base, allowed: false, reason: "rule_denied", matchedRuleId: gene.ruleId };
  }

  const factors = [
    ["identity", context.identity],
    ["authority", context.authority],
    ["policy", context.policy],
    ["evidence", context.evidence],
    ["safety", context.safety],
  ] as const;
  const missing = factors.find(([, present]) => present !== true);
  if (missing) {
    return { ...base, allowed: false, reason: "missing_factor", matchedRuleId: gene.ruleId };
  }
  if (
    !Number.isFinite(context.consensusApprovals) ||
    !Number.isInteger(context.consensusApprovals) ||
    context.consensusApprovals < required
  ) {
    return { ...base, allowed: false, reason: "consensus_insufficient", matchedRuleId: gene.ruleId };
  }
  return { ...base, allowed: true, reason: "all_factors_present", matchedRuleId: gene.ruleId };
}

/**
 * Deterministic renewal selection for an expired rule family. This chooses a
 * valid catalog entry; it does not repair chains, rotate keys or heal systems.
 */
export function resolveRenewal(
  genes: RegulatoryGene[],
  ruleIdPrefix: string,
  at: string,
): RegulatoryGene | null {
  const candidates = genes
    .filter((gene) => gene.ruleId.startsWith(ruleIdPrefix) && isGeneActive(gene, at))
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom) || a.ruleId.localeCompare(b.ruleId));
  return candidates[0] ?? null;
}

/** Demonstration catalog. Sources are declarations, not legal or ZK evidence. */
export const LATAMV_V2_DEMO_GENES: RegulatoryGene[] = [
  {
    ruleId: "R-PII-EU-001",
    jurisdiction: "EU",
    validFrom: "2026-08-02",
    validUntil: "2027-12-02",
    condition: "pii_without_consent",
    action: "DENY",
    severity: "critical",
    source: "Declared source: EU AI Act Art. 10 + GDPR; not legal advice",
    signatureMetadata: "unverified:ed25519:placeholder",
  },
  {
    ruleId: "R-PII-LATAM-001",
    jurisdiction: "LATAM",
    validFrom: "2026-01-01",
    validUntil: "2027-12-31",
    condition: "pii_without_consent",
    action: "REQUIRE_CONSENSUS",
    severity: "high",
    source: "Declared LATAMV policy catalog entry",
  },
  {
    ruleId: "R-IMPACT-LATAM-001",
    jurisdiction: "LATAM",
    validFrom: "2026-01-01",
    validUntil: "2027-12-31",
    condition: "high_impact_action",
    action: "REQUIRE_CONSENSUS",
    severity: "critical",
    source: "Declared LATAMV impact policy",
  },
  {
    ruleId: "R-DATA-OLD-001",
    jurisdiction: "US",
    validFrom: "2025-01-01",
    validUntil: "2025-12-31",
    condition: "restricted_dataset",
    action: "DENY",
    severity: "critical",
    source: "Expired demonstration rule",
  },
  {
    ruleId: "R-PII-LATAM-002",
    jurisdiction: "LATAM",
    validFrom: "2026-06-01",
    validUntil: "2027-12-31",
    condition: "pii_without_consent",
    action: "REQUIRE_CONSENSUS",
    severity: "medium",
    source: "Renewal candidate for the R-PII-LATAM family",
  },
];
