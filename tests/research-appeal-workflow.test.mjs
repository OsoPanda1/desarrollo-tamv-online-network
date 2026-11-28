import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { canReviewAppeal } from "../lib/research/appeals.ts"
import { canTransitionProposal } from "../lib/research/workflow.ts"
import { moderationSchema } from "../lib/validation.ts"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("appeal independence remains enforced after independent review starts", () => {
  const base = {
    appealStatus: "under_review",
    proposalStatus: "in_review",
    reviewerId: "original-reviewer",
    rejectingReviewerIds: ["original-reviewer"],
  }
  assert.equal(canReviewAppeal(base), false)
  assert.equal(canReviewAppeal({ ...base, reviewerId: "independent-reviewer" }), true)
  assert.equal(canReviewAppeal({ ...base, appealStatus: "received", proposalStatus: "appealed" }), false)
})

test("appeal review fails closed when rejecting history cannot be verified", () => {
  assert.equal(canReviewAppeal({
    appealStatus: "received",
    proposalStatus: "appealed",
    reviewerId: "reviewer",
    rejectingReviewerIds: [],
  }), false)
})

test("resolved appeals and ordinary review do not impose appeal independence", () => {
  assert.equal(canReviewAppeal({
    appealStatus: "resolved",
    proposalStatus: "in_review",
    reviewerId: "original-reviewer",
    rejectingReviewerIds: ["original-reviewer"],
  }), true)
  assert.equal(canReviewAppeal({
    proposalStatus: "in_review",
    reviewerId: "original-reviewer",
    rejectingReviewerIds: ["original-reviewer"],
  }), true)
})

test("author resubmission uses the declared changes-requested transition", () => {
  assert.equal(canTransitionProposal("changes_requested", "received"), true)
  assert.equal(canTransitionProposal("received", "received"), false)
  assert.equal(moderationSchema.safeParse({ outcome: "review", feedback: "Revisión editorial solicitada." }).success, true)
  assert.equal(moderationSchema.safeParse({ outcome: "in_review", feedback: "Revisión editorial solicitada." }).success, false)
})

test("resubmission route binds owner, state, content and provenance atomically", () => {
  const route = read("app/api/v1/research/proposals/[id]/resubmit/route.ts")
  assert.match(route, /isSameOriginRequest\(request\)/)
  assert.match(route, /eq\(researchProposals\.userId, session\.user\.id\)/)
  assert.match(route, /\.for\("update"\)/)
  assert.match(route, /proposal\.status !== "changes_requested"/)
  assert.match(route, /contentHash/)
  assert.match(route, /action: "resubmitted"/)
  assert.match(route, /makeProposalEventHash\(payload, lastEvent\?\.eventHash \?\? null\)/)
  assert.match(route, /db\.transaction/)
})

test("moderation UI sends only supported outcomes and leaves author resubmission to the author", () => {
  const controls = read("components/portal/moderation-controls.tsx")
  assert.match(controls, /value: "review", label: "Iniciar revisión"/)
  assert.match(controls, /value: "review", label: "Revisión de apelación"/)
  assert.doesNotMatch(controls, /value: "in_review"/)
  assert.doesNotMatch(controls, /value: "received"/)
  const page = read("app/portal/propuestas/[id]/page.tsx")
  assert.match(page, /proposal\.status === "changes_requested" && <article/)
  assert.match(page, /<ProposalForm topics=\{topics\} proposal=\{proposal\}/)
})
