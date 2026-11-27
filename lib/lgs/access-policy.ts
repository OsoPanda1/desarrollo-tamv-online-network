export type LgsAccessPolicyInput = {
  sessionAuthenticated: boolean
  founderEmailVerified: boolean
  databaseRoleIsAdmin: boolean
  featureFlagEnabled: boolean
  phishingResistantMfaSatisfied: boolean
  independentSecurityReviewApproved: boolean
}

export type LgsAccessDecision = {
  allowed: boolean
  failedRequirements: string[]
}

/**
 * Pure fail-closed policy. Every requirement must be explicitly true.
 * This is not an authentication mechanism; callers must derive each input
 * from trusted server-side session/provider/database state.
 */
export function evaluateLgsAccessPolicy(input: LgsAccessPolicyInput): LgsAccessDecision {
  const requirements: Array<[keyof LgsAccessPolicyInput, string]> = [
    ["sessionAuthenticated", "authenticated-session-required"],
    ["founderEmailVerified", "verified-founder-identity-required"],
    ["databaseRoleIsAdmin", "database-admin-role-required"],
    ["featureFlagEnabled", "founder-access-feature-flag-disabled"],
    ["phishingResistantMfaSatisfied", "phishing-resistant-mfa-step-up-required"],
    ["independentSecurityReviewApproved", "independent-security-review-required"],
  ]
  const failedRequirements = requirements
    .filter(([key]) => input[key] !== true)
    .map(([, reason]) => reason)
  return { allowed: failedRequirements.length === 0, failedRequirements }
}
