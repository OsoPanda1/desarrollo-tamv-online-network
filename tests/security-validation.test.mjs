import test from "node:test"
import assert from "node:assert/strict"
import { canTransitionProposal } from "../lib/research/workflow.ts"
import { csvCell } from "../lib/research/csv.ts"
import { estimateHcuSimulationWork, isHcuGraphWithinLimits, isHcuSimulationWithinBudget } from "../lib/hcu/budget.ts"
import { appealSchema, hcuAtomSchema, hcuHyperedgeSchema, moderationSchema, proposalSchema, simulationSchema, tqafAssessmentSchema } from "../lib/validation.ts"
import { simulateHcu } from "../lib/hcu/model.ts"
import { readJsonBody, RequestBodyError } from "../lib/http.ts"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

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
  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "https://user:password@example.org/private" }).success, false)
  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "http://127.0.0.1/admin" }).success, false)
  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "http://192.168.1.1/private" }).success, false)
  assert.equal(proposalSchema.safeParse({ ...base, sourceUrl: "http://service.internal/metadata" }).success, false)
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

test("CSV exports neutralize spreadsheet formula injection and preserve quoting", () => {
  assert.equal(csvCell("=HYPERLINK(\"https://evil.example\")"), "\"'=HYPERLINK(\"\"https://evil.example\"\")\"")
  assert.equal(csvCell("  +1+1"), "\"'  +1+1\"")
  assert.equal(csvCell("@SUM(A1:A2)"), "\"'@SUM(A1:A2)\"")
  assert.equal(csvCell('A "quoted" value'), "\"A \"\"quoted\"\" value\"")
  assert.equal(csvCell(null), "\"\"")
})

test("HCU simulation budget rejects excessive graph and compute workloads", () => {
  const small = { mcRuns: 100, startYear: 2026, endYear: 2035, atomCount: 20, edgeCount: 20 }
  assert.equal(estimateHcuSimulationWork(small), 400_000)
  assert.equal(isHcuGraphWithinLimits(250, 1_000), true)
  assert.equal(isHcuGraphWithinLimits(251, 10), false)
  assert.equal(isHcuGraphWithinLimits(10, 1_001), false)
  assert.equal(isHcuSimulationWithinBudget(small), true)
  assert.equal(isHcuSimulationWithinBudget({ ...small, mcRuns: 200, atomCount: 100, edgeCount: 100 }), false)
  assert.equal(isHcuSimulationWithinBudget({ ...small, edgeFanout: 64 }), false)
})

test("private HCU inputs validate bounded values, ownership-safe references, and TQAF states", () => {
  assert.equal(hcuAtomSchema.safeParse({
    domainId: "research",
    nameEs: "Memoria territorial",
    descriptionEs: "Registro de conocimiento territorial documentado.",
    influenceX: 45,
    riskY: 30,
    evidenceZ: 20,
  }).success, true)
  assert.equal(hcuAtomSchema.safeParse({
    domainId: "research",
    nameEs: "Memoria territorial",
    descriptionEs: "Registro de conocimiento territorial documentado.",
    influenceX: 101,
    riskY: 30,
    evidenceZ: 20,
  }).success, false)
  assert.equal(hcuHyperedgeSchema.safeParse({
    sourceAtomIds: ["atom-a"],
    targetAtomIds: ["atom-b"],
    sourceTitle: "Fuente registrada",
    sourceUrl: "https://doi.org/10.1234/example",
    weight: 0.3,
    sign: 1,
    delayYears: 2,
    tqafLevel: "N2",
  }).success, true)
  assert.equal(hcuHyperedgeSchema.safeParse({
    sourceAtomIds: ["atom-a", "atom-a"],
    targetAtomIds: ["atom-b"],
    sourceTitle: "Fuente registrada",
    weight: 0.3,
    sign: 1,
    delayYears: 2,
  }).success, false)
  assert.equal(tqafAssessmentSchema.safeParse({ criterionCode: "TQAF-01", status: "verified", evidenceUrl: "https://example.org/evidence", rationale: "Revisión manual documentada con evidencia." }).success, true)
  assert.equal(tqafAssessmentSchema.safeParse({ criterionCode: "TQAF-99", status: "verified" }).success, false)
})

test("HCU runs are deterministic and bind inputs to the source graph digest", () => {
  const atoms = [
    { id: "atom-a", domainId: "domain-a", influenceX: 80, riskY: 30, evidenceZ: 45, isQuarantined: false },
    { id: "atom-b", domainId: "domain-b", influenceX: 50, riskY: 55, evidenceZ: 25, isQuarantined: false },
  ]
  const edges = [{ id: "edge-a", sourceAtomIds: ["atom-a"], targetAtomIds: ["atom-b"], weight: 0.3, sign: 1, delayYears: 1, evidenceStatus: "hypothesis" }]
  const input = { scenario: "baseline", startYear: 2026, endYear: 2030, seed: 20261101, mcRuns: 20, shocks: [{ atomId: "atom-a", year: 2026, intensity: 0.5 }], quarantine: [] }
  const first = simulateHcu(atoms, edges, input, "graph-digest-a")
  const repeated = simulateHcu(atoms, edges, input, "graph-digest-a")
  const updatedGraph = simulateHcu(atoms, edges, input, "graph-digest-b")
  assert.deepEqual(first, repeated)
  assert.notEqual(first.inputHash, updatedGraph.inputHash)
  assert.equal(first.sourceGraphHash, "graph-digest-a")
  assert.equal(first.input?.shocks.length, 1)
  assert.equal(first.series.length, 5)
})

function streamedRequest(body, headers = {}) {
  return new Request("https://tamv.example/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
    duplex: "half",
  })
}

function byteStream(chunks, { onCancel, cancelError, broken = false, close = true } = {}) {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk)
      if (broken) controller.error(new Error("broken input stream"))
      else if (close) controller.close()
    },
    cancel(reason) {
      onCancel?.(reason)
      if (cancelError) return Promise.reject(cancelError)
    },
  })
}

async function assertBodyError(request, code) {
  await assert.rejects(readJsonBody(request, 64_000), (error) => {
    assert.ok(error instanceof RequestBodyError)
    assert.equal(error.code, code)
    return true
  })
}

test("JSON body reader accepts exactly 64,000 streamed bytes without Content-Length", async () => {
  const prefix = '{"padding":"'
  const suffix = '"}'
  const padding = "x".repeat(64_000 - Buffer.byteLength(prefix) - Buffer.byteLength(suffix))
  const body = prefix + padding + suffix
  assert.equal(Buffer.byteLength(body), 64_000)
  const request = streamedRequest(byteStream([Buffer.from(body)]))
  assert.equal(request.headers.has("content-length"), false)
  assert.deepEqual(await readJsonBody(request, 64_000), { padding })
})

test("JSON body reader cancels a 64,001-byte stream and preserves size errors when cancellation fails", async () => {
  let cancellations = 0
  const request = streamedRequest(byteStream([Buffer.alloc(64_001, 0x20)], {
    onCancel: () => { cancellations += 1 },
    cancelError: new Error("cancel failed"),
    close: false,
  }))
  await assertBodyError(request, "payload_too_large")
  assert.equal(cancellations, 1)
})

test("JSON body reader does not trust forged Content-Length in either direction", async () => {
  await assertBodyError(streamedRequest(byteStream([Buffer.alloc(64_001, 0x20)]), { "content-length": "1" }), "payload_too_large")
  await assertBodyError(streamedRequest(byteStream([Buffer.from("{}")]), { "content-length": "64001" }), "payload_too_large")
})

test("JSON body reader classifies broken streams, invalid UTF-8, media types, and malformed JSON", async () => {
  await assertBodyError(streamedRequest(byteStream([], { broken: true })), "request_body_unreadable")
  await assertBodyError(streamedRequest(byteStream([Uint8Array.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d])])), "invalid_utf8")
  await assertBodyError(streamedRequest(byteStream([Buffer.from("{}")]), { "content-type": "text/plain" }), "unsupported_media_type")
  await assertBodyError(streamedRequest(byteStream([Buffer.from("{broken")])), "invalid_json")
})

test("assistant keeps abuse and origin gates first and maps bounded body reader errors", () => {
  const assistant = readFileSync(resolve(process.cwd(), "app/api/assistant/route.ts"), "utf8")
  const rateLimit = assistant.indexOf("enforcePublicRateLimit(")
  const origin = assistant.indexOf("isSameOriginRequest(")
  const body = assistant.indexOf("await readJsonBody(request, 64_000)")

  assert.ok(rateLimit >= 0 && origin > rateLimit && body > origin)
  assert.doesNotMatch(assistant, /request\.text\s*\(/)
  assert.match(assistant, /error\.code === "payload_too_large" \? 413/)
  assert.match(assistant, /error\.code === "unsupported_media_type" \? 415/)
  assert.match(assistant, /: 400/)
  assert.match(assistant, /headers: \{ "Cache-Control": "no-store" \}/)
})
