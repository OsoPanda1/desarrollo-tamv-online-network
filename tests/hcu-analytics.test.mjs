import test from "node:test"
import assert from "node:assert/strict"
import { deriveHcuAnalytics, HCU_HIGH_RISK_THRESHOLD } from "../lib/hcu/analytics.ts"

const graph = {
  domains: [{ id: "research" }, { id: "identity" }, { id: "territory" }],
  atoms: [
    { id: "a1", domainId: "research", influenceX: 40, riskY: 72, evidenceZ: 20, isProvisional: true, isQuarantined: false },
    { id: "a2", domainId: "identity", influenceX: 90, riskY: 20, evidenceZ: 80, isProvisional: false, isQuarantined: false },
    { id: "a3", domainId: "territory", influenceX: 10, riskY: 45, evidenceZ: 50, isProvisional: false, isQuarantined: true },
  ],
  edges: [
    { id: "e1", sourceAtomIds: ["a1"], targetAtomIds: ["a2"], evidenceStatus: "hypothesis", sourceUrl: "https://example.org/source" },
    { id: "e2", sourceAtomIds: ["a2"], targetAtomIds: ["a3"], evidenceStatus: "documented", sourceUrl: null },
  ],
}

test("derives counts and mean declared parameters without implying validation", () => {
  const result = deriveHcuAnalytics(graph)
  assert.equal(result.domainCount, 3)
  assert.equal(result.atomCount, 3)
  assert.equal(result.edgeCount, 2)
  assert.equal(result.meanInfluence, 46.7)
  assert.equal(result.meanRisk, 45.7)
  assert.equal(result.meanEvidence, 50)
  assert.equal(result.highRiskCount, 1)
  assert.equal(result.quarantinedCount, 1)
  assert.equal(result.provisionalCount, 1)
  assert.equal(result.connectedAtomCount, 3)
  assert.equal(result.isolatedAtomCount, 0)
  assert.equal(result.crossDomainEdgeCount, 2)
  assert.equal(result.edgesWithSourceUrl, 1)
  assert.equal(result.sourceUrlCoveragePercent, 50)
  assert.deepEqual(result.topRiskAtomIds, ["a1", "a3", "a2"])
})

test("counts edge states independently and includes cross-domain incidence per domain", () => {
  const result = deriveHcuAnalytics(graph)
  assert.deepEqual(result.edgeStatusCounts, [
    { status: "documented", count: 1 },
    { status: "hypothesis", count: 1 },
  ])
  assert.deepEqual(result.domains.map((domain) => domain.incidentEdgeCount), [1, 2, 1])
})

test("flags out-of-scale parameters and malformed relationships instead of silently normalizing them", () => {
  const result = deriveHcuAnalytics({
    domains: [{ id: "d" }],
    atoms: [{ id: "a", domainId: "missing", influenceX: 101, riskY: -1, evidenceZ: Number.NaN, isProvisional: true, isQuarantined: false }],
    edges: [{ id: "broken", sourceAtomIds: ["ghost"], targetAtomIds: [], evidenceStatus: "" }],
  })
  assert.equal(result.invalidParameterAtomCount, 1)
  assert.equal(result.invalidEdgeCount, 1)
  assert.equal(result.isolatedAtomCount, 1)
  assert.equal(result.edgesWithSourceUrl, 0)
  assert.equal(result.sourceUrlCoveragePercent, 0)
})

test("keeps the high-risk threshold explicit and treats empty graphs safely", () => {
  assert.equal(HCU_HIGH_RISK_THRESHOLD, 65)
  const result = deriveHcuAnalytics({ domains: [], atoms: [], edges: [] })
  assert.equal(result.meanRisk, null)
  assert.equal(result.sourceUrlCoveragePercent, null)
  assert.equal(result.topRiskAtomIds.length, 0)
})
