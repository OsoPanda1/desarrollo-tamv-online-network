import { createHash } from "node:crypto"
import { canonicalizeMerkleRecord } from "./merkle.ts"

const SHA256_HEX = /^[a-f0-9]{64}$/
export const GENESIS_PREVIOUS_HASH = "0".repeat(64)

export type LgsAuditEventInput = {
  eventId: string
  occurredAt: string
  actorRef: string
  action: string
  subjectRef: string
  outcome: "success" | "denied" | "failure"
  policyVersion: string
  metadata?: Record<string, string | number | boolean | null>
}

export type LgsAuditEvent = LgsAuditEventInput & {
  sequence: number
  previousHash: string
  eventHash: string
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

function validateInput(input: LgsAuditEventInput): void {
  for (const key of ["eventId", "occurredAt", "actorRef", "action", "subjectRef", "policyVersion"] as const) {
    if (typeof input[key] !== "string" || input[key].trim().length === 0) {
      throw new TypeError(`${key} must be a non-empty string`)
    }
  }
  if (!Number.isFinite(Date.parse(input.occurredAt))) throw new TypeError("occurredAt must be a valid timestamp")
  if (!["success", "denied", "failure"].includes(input.outcome)) throw new TypeError("invalid outcome")
}

function eventDigest(event: Omit<LgsAuditEvent, "eventHash">): string {
  return sha256(`TAMV-LGS-AUDIT-V1\0${canonicalizeMerkleRecord(event)}`)
}

export function appendAuditEvent(
  previous: LgsAuditEvent | null,
  input: LgsAuditEventInput,
): LgsAuditEvent {
  validateInput(input)
  const sequence = previous ? previous.sequence + 1 : 1
  const previousHash = previous?.eventHash ?? GENESIS_PREVIOUS_HASH
  if (previous && (!SHA256_HEX.test(previous.eventHash) || previous.sequence < 1)) {
    throw new TypeError("previous event is not a valid chain head")
  }
  const envelope = { ...input, sequence, previousHash }
  return { ...envelope, eventHash: eventDigest(envelope) }
}

export function verifyAuditChain(events: readonly LgsAuditEvent[]): { valid: boolean; index: number | null; reason: string | null } {
  let previous: LgsAuditEvent | null = null
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]
    try {
      validateInput(event)
    } catch {
      return { valid: false, index, reason: "invalid-event-fields" }
    }
    const expectedSequence = index + 1
    const expectedPreviousHash = previous?.eventHash ?? GENESIS_PREVIOUS_HASH
    if (event.sequence !== expectedSequence) return { valid: false, index, reason: "sequence-mismatch" }
    if (event.previousHash !== expectedPreviousHash) return { valid: false, index, reason: "previous-hash-mismatch" }
    const { eventHash, ...envelope } = event
    if (!SHA256_HEX.test(eventHash) || eventDigest(envelope) !== eventHash) {
      return { valid: false, index, reason: "event-hash-mismatch" }
    }
    previous = event
  }
  return { valid: true, index: null, reason: null }
}

/**
 * A hash-linked chain detects edits/reordering within the supplied sequence.
 * It cannot by itself prove authorship, prevent deletion/truncation, or prove
 * that events are truthful. Production requires signed checkpoints, external
 * witnesses, durable storage, access controls and retention governance.
 */
