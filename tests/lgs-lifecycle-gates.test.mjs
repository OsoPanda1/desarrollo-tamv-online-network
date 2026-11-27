import test from "node:test"
import assert from "node:assert/strict"
import { evaluateLgsGate, LGS_GATE_REQUIREMENTS } from "../lib/lgs/lifecycle-gates.ts"

test("all gates block when evidence is absent", () => {
  for (const gate of Object.keys(LGS_GATE_REQUIREMENTS)) {
    const result = evaluateLgsGate(gate, {})
    assert.equal(result.allowed, false, gate)
    assert.equal(result.decision, "block", gate)
    assert.ok(result.missing.length > 0, gate)
  }
})

test("gate opens only when every required item is explicitly true", () => {
  const requirements = LGS_GATE_REQUIREMENTS.G5_AUTHORIZATION
  const evidence = Object.fromEntries(requirements.map((key) => [key, true]))
  assert.equal(evaluateLgsGate("G5_AUTHORIZATION", evidence).allowed, true)
  evidence.authorizedApproverRecorded = false
  const result = evaluateLgsGate("G5_AUTHORIZATION", evidence)
  assert.equal(result.allowed, false)
  assert.deepEqual(result.missing, ["authorizedApproverRecorded"])
})

test("undefined, null and truthy strings do not satisfy a gate", () => {
  const result = evaluateLgsGate("G1_INITIATIVE", {
    purposeDefined: "yes",
    systemOwnerAssigned: null,
    legalBasisReviewed: undefined,
  })
  assert.equal(result.allowed, false)
  assert.equal(result.missing.length, 3)
})
