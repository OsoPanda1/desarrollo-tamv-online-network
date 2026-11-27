import { randomUUID } from "node:crypto"
import { asc, desc, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { lgsAuditEvents } from "@/lib/db/schema"
import { getLgsFounderAccess } from "@/lib/lgs-founder-guard"
import { appendAuditEvent, verifyAuditChain, type LgsAuditEvent, type LgsAuditEventInput } from "@/lib/lgs/audit-chain"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const MAX_VERIFY_EVENTS = 5000
const ALLOWED_ACTIONS = new Set(["system.reviewed", "risk.assessed", "gate.checked", "specification.viewed"])
const NO_STORE = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" }

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE })
}

async function authorizeRequest() {
  const result = await getLgsFounderAccess()
  if (!result.allowed) {
    return {
      founder: null,
      response: responseError(
        result.authenticated ? "LGS access is restricted." : "Authentication required.",
        result.authenticated ? 403 : 401,
      ),
    }
  }
  return { founder: result.founder, response: null }
}

function asAuditEvent(row: typeof lgsAuditEvents.$inferSelect): LgsAuditEvent {
  return {
    eventId: row.eventId,
    occurredAt: row.occurredAt.toISOString(),
    actorRef: row.actorRef,
    action: row.action,
    subjectRef: row.subjectRef,
    outcome: row.outcome as LgsAuditEvent["outcome"],
    policyVersion: row.policyVersion,
    metadata: row.metadata,
    sequence: row.sequence,
    previousHash: row.previousHash,
    eventHash: row.eventHash,
  }
}

export async function GET() {
  const access = await authorizeRequest()
  if (access.response) return access.response

  try {
    const rows = await db.select().from(lgsAuditEvents)
      .orderBy(asc(lgsAuditEvents.sequence))
      .limit(MAX_VERIFY_EVENTS + 1)

    if (rows.length > MAX_VERIFY_EVENTS) {
      return NextResponse.json({
        integrity: "not-verified",
        reason: "verification-window-exceeded",
        maximumVerifiedEvents: MAX_VERIFY_EVENTS,
      }, { status: 503, headers: NO_STORE })
    }

    const events = rows.map(asAuditEvent)
    const verification = verifyAuditChain(events)
    const head = events.at(-1)
    return NextResponse.json({
      integrity: events.length === 0 ? "empty" : verification.valid ? "verified" : "failed",
      eventCount: events.length,
      headSequence: head?.sequence ?? 0,
      headHash: head?.eventHash ?? null,
      reason: verification.reason,
      invalidIndex: verification.index,
      note: "Hash-chain verification detects edits in the supplied sequence; it does not prove event truth, authorship, or external non-truncation.",
    }, { headers: NO_STORE })
  } catch {
    return responseError("Audit ledger is unavailable; integrity status was not established.", 503)
  }
}

export async function POST(request: Request) {
  const access = await authorizeRequest()
  if (access.response) return access.response

  const origin = request.headers.get("origin")
  let requestOrigin: string
  try {
    requestOrigin = new URL(request.url).origin
  } catch {
    return responseError("Invalid request origin.", 400)
  }
  if (!origin || origin !== requestOrigin) return responseError("Cross-origin request rejected.", 403)

  const declaredLength = Number(request.headers.get("content-length") ?? "0")
  if (declaredLength > 4096) return responseError("Request body too large.", 413)

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > 4096) return responseError("Request body too large.", 413)
    body = JSON.parse(raw)
  } catch {
    return responseError("Invalid JSON body.", 400)
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) return responseError("Invalid event payload.", 400)
  const candidate = body as Record<string, unknown>
  const action = candidate.action
  const subjectRef = candidate.subjectRef
  if (typeof action !== "string" || !ALLOWED_ACTIONS.has(action)) return responseError("Unsupported audit action.", 400)
  if (typeof subjectRef !== "string" || !/^[A-Za-z0-9:_./-]{1,160}$/.test(subjectRef)) {
    return responseError("subjectRef must use 1–160 safe reference characters.", 400)
  }

  const input: LgsAuditEventInput = {
    eventId: randomUUID(),
    occurredAt: new Date().toISOString(),
    actorRef: `user:${access.founder.userId}`,
    action,
    subjectRef,
    outcome: "success",
    policyVersion: "LGS-1.1.0",
    metadata: { source: "founder-workspace" },
  }

  try {
    const event = await db.transaction(async (tx) => {
      // Serialize writers so concurrent serverless requests cannot reuse a sequence.
      await tx.execute(sql`LOCK TABLE public.lgs_audit_events IN EXCLUSIVE MODE`)
      const [headRow] = await tx.select().from(lgsAuditEvents)
        .orderBy(desc(lgsAuditEvents.sequence))
        .limit(1)
      const previous = headRow ? asAuditEvent(headRow) : null
      const next = appendAuditEvent(previous, input)
      await tx.insert(lgsAuditEvents).values({
        sequence: next.sequence,
        eventId: next.eventId,
        occurredAt: new Date(next.occurredAt),
        actorUserId: access.founder.userId,
        actorRef: next.actorRef,
        action: next.action,
        subjectRef: next.subjectRef,
        outcome: next.outcome,
        policyVersion: next.policyVersion,
        metadata: next.metadata ?? {},
        previousHash: next.previousHash,
        eventHash: next.eventHash,
      })
      return next
    })

    return NextResponse.json({
      accepted: true,
      sequence: event.sequence,
      eventId: event.eventId,
      eventHash: event.eventHash,
    }, { status: 201, headers: NO_STORE })
  } catch {
    return responseError("Audit event was not persisted. No success is claimed.", 503)
  }
}
