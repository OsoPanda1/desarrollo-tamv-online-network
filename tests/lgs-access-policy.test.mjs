import test from "node:test"
import assert from "node:assert/strict"
import { evaluateLgsAccessPolicy } from "../lib/lgs/access-policy.ts"

const fullyApproved = {
  sessionAuthenticated: true,
  founderEmailVerified: true,
  databaseRoleIsAdmin: true,
  featureFlagEnabled: true,
  phishingResistantMfaSatisfied: true,
  independentSecurityReviewApproved: true,
}

test("founder access is granted only when every control is explicitly satisfied", () => {
  assert.deepEqual(evaluateLgsAccessPolicy(fullyApproved), { allowed: true, failedRequirements: [] })
})

test("any missing control blocks access and returns a stable reason", () => {
  for (const key of Object.keys(fullyApproved)) {
    const decision = evaluateLgsAccessPolicy({ ...fullyApproved, [key]: false })
    assert.equal(decision.allowed, false, key)
    assert.equal(decision.failedRequirements.length, 1, key)
  }
})

test("truthy non-boolean values do not satisfy security requirements", () => {
  const decision = evaluateLgsAccessPolicy({ ...fullyApproved, phishingResistantMfaSatisfied: "true" })
  assert.equal(decision.allowed, false)
  assert.deepEqual(decision.failedRequirements, ["phishing-resistant-mfa-step-up-required"])
})

test("multiple failed controls are all reported", () => {
  const decision = evaluateLgsAccessPolicy({
    ...fullyApproved,
    featureFlagEnabled: false,
    phishingResistantMfaSatisfied: false,
    independentSecurityReviewApproved: false,
  })
  assert.equal(decision.allowed, false)
  assert.equal(decision.failedRequirements.length, 3)
})
