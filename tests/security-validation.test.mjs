import test from "node:test"
import assert from "node:assert/strict"
import { canTransitionProposal } from "../lib/research/workflow.ts"
import { appealSchema, moderationSchema, proposalSchema, simulationSchema } from "../lib/validation.ts"

test("proposal workflow allows only declared transitions", () => {
  assert.equal(canTransitionProposal("received", "triage"), true)
  assert.equal(canTransitionProposal("appealed", "in_review"), true)
  assert.equal(canTransitionProposal("published", "withdrawn"), false)
  assert.equal(canTransitionProposal("received", "published"), false)
  assert.equal(canTransitionProposal("unknown", "published"), false)
})

test("proposal input rejects unsafe URL schemes and defaults consent to false", () => {
  const base = {
    title: "A defensible research proposal",
    abstract: "a".repeat(120),
    proposalType: "article",
  }
  const valid = proposalSchema.safeParse({ ...base, sourceUrl: "https://example.org/paper" })
  assert.equal(valid.success, true)
  if (valid.success) assert.equal(valid.data.shareConsent, false)

  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "javascript:alert(1)" }).success, false)
  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "data:text/html,unsafe" }).success, false)
  assert.equal(proposalSchema.safeParse({ ...base, title: "short" }).success, false)
})

test("appeal and moderation schemas enforce bounded, non-empty feedback", () => {
  assert.equal(appealSchema.safeParse({ reason: "This reason is long enough to meet the required minimum." }).success, true)
  assert.equal(appealSchema.safeParse({ reason: "too short" }).success, false)
  assert.equal(moderationSchema.safeParse({ outcome: "rejected", feedback: "Please address the evidence gap." }).success, true)
  assert.equal(moderationSchema.safeParse({ outcome: "root", feedback: "This feedback is long enough." }).success, false)
})

test("simulation schema rejects out-of-range work factors", () => {
  const base = {
    scenario: "baseline",
    startYear: 2026,
    endYear: 2035,
    seed: 42,
    mcRuns: 100,
    shocks: [],
    quarantine: [],
  }
  assert.equal(simulationSchema.safeParse(base).success, true)
  assert.equal(simulationSchema.safeParse({ ...base, mcRuns: 201 }).success, false)
  assert.equal(simulationSchema.safeParse({ ...base, seed: -1 }).success, false)
  assert.equal(simulationSchema.safeParse({ ...base, shocks: Array.from({ length: 17 }, (_, i) => ({ atomId: String(i), year: 2030, intensity: 0.1 })) }).success, false)
})
