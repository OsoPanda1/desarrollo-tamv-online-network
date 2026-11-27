import test from "node:test"
import assert from "node:assert/strict"
import { appendAuditEvent, verifyAuditChain } from "../lib/lgs/audit-chain.ts"

const event = (eventId, action = "review") => ({
  eventId,
  occurredAt: "2026-11-27T12:00:00.000Z",
  actorRef: "user:founder",
  action,
  subjectRef: "system:demo",
  outcome: "success",
  policyVersion: "LGS-0.1",
  metadata: { environment: "test" },
})

function chain() {
  const first = appendAuditEvent(null, event("evt-1", "created"))
  const second = appendAuditEvent(first, event("evt-2", "reviewed"))
  return [first, second]
}

test("creates and verifies a deterministic sequential chain", () => {
  const events = chain()
  assert.equal(events[0].sequence, 1)
  assert.equal(events[1].sequence, 2)
  assert.equal(events[1].previousHash, events[0].eventHash)
  assert.deepEqual(verifyAuditChain(events), { valid: true, index: null, reason: null })
})

test("detects modified event content and broken links", () => {
  const events = chain()
  const altered = [{ ...events[0], action: "tampered" }, events[1]]
  assert.equal(verifyAuditChain(altered).reason, "event-hash-mismatch")
  const broken = [events[0], { ...events[1], previousHash: "f".repeat(64) }]
  assert.equal(verifyAuditChain(broken).reason, "previous-hash-mismatch")
})

test("detects sequence gaps and rejects invalid event inputs", () => {
  const events = chain()
  assert.equal(verifyAuditChain([events[0], { ...events[1], sequence: 4 }]).reason, "sequence-mismatch")
  assert.throws(() => appendAuditEvent(null, { ...event(""), eventId: " " }), TypeError)
  assert.throws(() => appendAuditEvent(null, { ...event("evt-bad"), occurredAt: "not-a-date" }), TypeError)
})

test("empty chain is valid but conveys no evidence", () => {
  assert.deepEqual(verifyAuditChain([]), { valid: true, index: null, reason: null })
})
