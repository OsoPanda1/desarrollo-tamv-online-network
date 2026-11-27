import test from "node:test"
import assert from "node:assert/strict"
import { assessLgsRisk } from "../lib/lgs/risk-engine.ts"

const low = {
  likelihood: 1, impact: 1, exposure: 1,
  velocity: 1, uncertainty: 1, irreversibility: 1,
}
const high = {
  likelihood: 5, impact: 5, exposure: 5,
  velocity: 5, uncertainty: 5, irreversibility: 5,
}

test("risk score is deterministic and bounded from 0 to 100", () => {
  const result = assessLgsRisk(low)
  assert.equal(result.score, 20)
  assert.equal(result.band, "moderate")
  assert.equal(result.disposition, "review")
  assert.equal(assessLgsRisk(high).score, 100)
  assert.equal(assessLgsRisk(high).band, "critical")
})

test("risk weights sum to one", () => {
  const result = assessLgsRisk(low)
  assert.equal(Object.values(result.weights).reduce((sum, weight) => sum + weight, 0), 1)
})

test("non-compensatory veto blocks even the lowest numeric score", () => {
  const result = assessLgsRisk({ ...low, rightsViolationLikely: true })
  assert.equal(result.score, 20)
  assert.equal(result.disposition, "blocked")
  assert.deepEqual(result.vetoes, ["potential-rights-violation"])
})

test("multiple hard stops are preserved as separate reasons", () => {
  const result = assessLgsRisk({
    ...low, safetyCriticalUncontrolled: true, humanOversightAbsent: true,
  })
  assert.equal(result.disposition, "blocked")
  assert.equal(result.vetoes.length, 2)
})

test("rejects out-of-range, fractional and non-numeric dimensions", () => {
  assert.throws(() => assessLgsRisk({ ...low, impact: 0 }), RangeError)
  assert.throws(() => assessLgsRisk({ ...low, impact: 6 }), RangeError)
  assert.throws(() => assessLgsRisk({ ...low, impact: 2.5 }), RangeError)
  assert.throws(() => assessLgsRisk({ ...low, impact: "high" }), RangeError)
})
