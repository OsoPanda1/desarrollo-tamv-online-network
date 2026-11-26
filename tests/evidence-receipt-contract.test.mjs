import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  CanonicalizationError,
  MAX_RECEIPT_BYTES,
  RECEIPT_DOMAIN,
  RECEIPT_SCHEMA,
  RECEIPT_SEMANTICS,
  canonicalize,
  receiptFileName,
  receiptToJsonLd,
  sha256Hex,
  shortDigest,
  stampReceipt,
  verifyEvidenceFiles,
  verifyReceipt,
} from "../lib/evidence/receipt.ts"
import { POST } from "../app/api/v1/evidence/receipts/verify/route.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (relative) => readFileSync(path.join(root, relative), "utf8")

const fileBytes = new TextEncoder().encode("tamv evidence bytes")
const fileDigest = await sha256Hex(fileBytes)

function draft(overrides = {}) {
  return {
    schema: RECEIPT_SCHEMA,
    createdAt: "2026-11-25T12:00:00Z",
    nonce: "0123456789abcdef",
    producer: {
      name: "TAMV Online Network",
      url: "https://tamv.online",
      tool: "tamv-independent-developer-module",
      version: "1.0.0",
    },
    purpose: {
      primary: "portable_evidence_receipt",
      context: "Independent developer module",
      note: "Declared evidence for a focused contribution.",
    },
    issuer: {
      kind: "self_declared",
      displayName: "Ana Example",
      handles: [{ platform: "github", handle: "ana-example" }],
    },
    subject: {
      kind: "build",
      title: "Independent evidence module",
      description: "A small, reproducible contribution.",
      urls: ["https://example.org/build"],
    },
    evidence: [
      {
        label: "captura.png",
        kind: "image",
        sha256: fileDigest,
        sizeBytes: fileBytes.byteLength,
        contentType: "image/png",
        uri: null,
        license: null,
      },
    ],
    claims: [{ statement: "The build is publicly reachable.", status: "declared" }],
    consent: {
      shareEvidence: true,
      publishReceipt: true,
      termsVersion: "cev-1.0",
      grantedAt: "2026-11-25T12:00:00Z",
    },
    chain: { previous: null },
    ...overrides,
  }
}

function request(body, contentType = "application/json", extraHeaders = {}) {
  return new Request("https://tamv.online/api/v1/evidence/receipts/verify", {
    method: "POST",
    headers: { "content-type": contentType, ...extraHeaders },
    body,
  })
}

test("canonicalization is deterministic, ordered, and Unicode-stable", () => {
  assert.equal(canonicalize({ b: 1, a: 2 }), '{"a":2,"b":1}')
  assert.equal(canonicalize({ a: [3, { z: true, y: null }] }), '{"a":[3,{"y":null,"z":true}]}')
  assert.equal(canonicalize("e\u0301"), JSON.stringify("é"))
  assert.equal(canonicalize(-0), "0")
  assert.equal(canonicalize(1.5), "1.5")
})

test("canonicalization rejects ambiguous or unsafe values", () => {
  assert.throws(() => canonicalize({ a: undefined }), (error) => error instanceof CanonicalizationError && error.code === "unsupported_type")
  assert.throws(() => canonicalize({ a: Number.NaN }), (error) => error instanceof CanonicalizationError && error.code === "non_finite_number")
  assert.throws(() => canonicalize(new Date()), (error) => error instanceof CanonicalizationError && error.code === "invalid_object")
  assert.throws(() => canonicalize({ a: { b: { c: 1 } } }, { maxDepth: 1 }), (error) => error instanceof CanonicalizationError && error.code === "depth_limit")
  assert.throws(() => canonicalize("\uD800"), (error) => error instanceof CanonicalizationError && error.code === "lone_surrogate")
})

test("a stamped receipt verifies shape and integrity", async () => {
  const receipt = await stampReceipt(draft())
  assert.equal(receipt.schema, RECEIPT_SCHEMA)
  assert.equal(receipt.hash.domain, RECEIPT_DOMAIN)
  assert.equal(receipt.hash.algorithm, "sha-256")
  assert.match(receipt.hash.value, /^[a-f0-9]{64}$/)

  const result = await verifyReceipt(receipt)
  assert.equal(result.valid, true)
  assert.deepEqual(result.levels, { shape: true, integrity: true })
  assert.equal(result.expected, receipt.hash.value)
  assert.equal(result.actual, receipt.hash.value)
  assert.equal(result.semantics, RECEIPT_SEMANTICS)
})

test("stamping is independent of object key order", async () => {
  const first = await stampReceipt(draft())
  const reordered = Object.fromEntries(Object.entries(draft()).reverse())
  const second = await stampReceipt(reordered)
  assert.equal(first.hash.value, second.hash.value)
})

test("tampering is detected without echoing the payload", async () => {
  const receipt = await stampReceipt(draft())
  const tampered = { ...receipt, subject: { ...receipt.subject, title: "Different title" } }
  const result = await verifyReceipt(tampered)
  assert.equal(result.valid, false)
  assert.deepEqual(result.levels, { shape: true, integrity: false })
  assert.equal(result.issues[0].code, "integrity_mismatch")
  assert.equal(JSON.stringify(result).includes("Different title"), false)
})

test("shape validation rejects unknown fields, malformed digests, and empty locators", async () => {
  const unknown = await verifyReceipt({ ...draft(), secret: "must-not-be-echoed" })
  assert.equal(unknown.levels.shape, false)
  assert.equal(JSON.stringify(unknown).includes("must-not-be-echoed"), false)

  const malformed = await verifyReceipt(
    draft({ evidence: [{ ...draft().evidence[0], sha256: "a".repeat(63) }] }),
  )
  assert.equal(malformed.levels.shape, false)

  const empty = await verifyReceipt(draft({ evidence: [], subject: { ...draft().subject, urls: [] } }))
  assert.equal(empty.levels.shape, false)
})

test("evidence binding matches bytes locally and reports unmatched files", async () => {
  const receipt = await stampReceipt(draft())
  const match = await verifyEvidenceFiles(receipt, [{ name: "captura.png", bytes: fileBytes }])
  assert.equal(match.checked, 1)
  assert.equal(match.matched.length, 1)
  assert.equal(match.unmatchedFiles.length, 0)
  assert.equal(match.unmatchedEvidence.length, 0)

  const other = new TextEncoder().encode("different bytes")
  const mismatch = await verifyEvidenceFiles(receipt, [{ name: "otra.png", bytes: other }])
  assert.equal(mismatch.matched.length, 0)
  assert.equal(mismatch.unmatchedFiles.length, 1)
  assert.equal(mismatch.unmatchedEvidence.length, 1)
})

test("JSON-LD export keeps the disclaimer and the digest", async () => {
  const receipt = await stampReceipt(draft())
  const jsonLd = receiptToJsonLd(receipt)
  assert.equal(jsonLd.identifier, `sha256:${receipt.hash.value}`)
  assert.equal(jsonLd.sha256, receipt.hash.value)
  assert.equal(jsonLd.disclaimer, RECEIPT_SEMANTICS)
  assert.equal(jsonLd["@type"], "DigitalDocument")
})

test("short digest and file names are display-safe", async () => {
  const receipt = await stampReceipt(draft())
  assert.ok(shortDigest(receipt.hash.value).includes("…"))
  assert.equal(receiptFileName("Módulo de Evidencia / v1"), "tamv-cev-modulo-de-evidencia-v1.json")
  assert.equal(receiptFileName("***"), "tamv-cev-receipt.json")
})

test("verification API accepts a valid receipt and sets no-store headers", async () => {
  const receipt = await stampReceipt(draft())
  const response = await POST(request(JSON.stringify(receipt)))
  const result = await response.json()
  assert.equal(response.status, 200)
  assert.equal(result.valid, true)
  assert.deepEqual(result.levels, { shape: true, integrity: true })
  assert.equal(result.digest, receipt.hash.value)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.match(result.note, /File binding, registered origin, and human review were not checked/)
})

test("verification API rejects tampered and invalid receipts without echoing them", async () => {
  const receipt = await stampReceipt(draft())
  const tampered = { ...receipt, subject: { ...receipt.subject, title: "Payload secret" } }
  const tamperedResponse = await POST(request(JSON.stringify(tampered)))
  const tamperedResult = await tamperedResponse.json()
  assert.equal(tamperedResponse.status, 422)
  assert.equal(tamperedResult.error, "integrity_mismatch")
  assert.equal(JSON.stringify(tamperedResult).includes("Payload secret"), false)

  const invalid = { ...draft(), secret: "must-not-be-echoed" }
  const invalidResponse = await POST(request(JSON.stringify(invalid)))
  const invalidResult = await invalidResponse.json()
  assert.equal(invalidResponse.status, 422)
  assert.equal(invalidResult.error, "schema_validation_failed")
  assert.equal(JSON.stringify(invalidResult).includes("must-not-be-echoed"), false)
})

test("verification API enforces media type, size, encoding, and JSON errors", async () => {
  assert.equal((await POST(request("{}", "text/plain"))).status, 415)
  assert.equal((await POST(request("x".repeat(MAX_RECEIPT_BYTES + 1)))).status, 413)
  assert.equal((await POST(request(new Uint8Array([0x7b, 0xff, 0x7d])))).status, 400)
  assert.equal((await POST(request("{"))).status, 400)
})

test("verification API classifies a broken body stream without leaking details", async () => {
  const broken = new ReadableStream({
    start(controller) {
      controller.error(new Error("simulated transport failure"))
    },
  })
  const brokenRequest = new Request("https://tamv.online/api/v1/evidence/receipts/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: broken,
    duplex: "half",
  })
  const response = await POST(brokenRequest)
  const result = await response.json()
  assert.equal(response.status, 400)
  assert.equal(result.error, "request_body_unreadable")
  assert.equal(JSON.stringify(result).includes("simulated transport failure"), false)
})

test("the independent developer module is wired into discovery and documentation", () => {
  const page = read("app/desarrolladores/independiente/page.tsx")
  assert.match(page, /ReceiptBuilder/)
  assert.match(page, /ReceiptVerifier/)
  assert.match(page, /MÓDULO DE DESARROLLADOR INDEPENDIENTE/)
  assert.match(page, /No se copió código del proyecto original/)
  assert.match(page, /no promete pago/)

  const developers = read("app/desarrolladores/page.tsx")
  assert.match(developers, /desarrolladores\/independiente/)
  assert.match(developers, /api\/v1\/evidence\/receipts\/verify/)

  assert.match(read("app/sitemap.ts"), /"\/desarrolladores\/independiente"/)
  assert.match(read("lib/visuals/catalog.ts"), /"\/desarrolladores\/independiente"/)
  assert.match(read("app/evidence.css"), /prefers-reduced-motion/)
  assert.match(read("public/openapi.yaml"), /\/api\/v1\/evidence\/receipts\/verify:/)

  assert.ok(existsSync(path.join(root, "docs", "architecture", "evidence-receipt-v1.md")))
  assert.ok(existsSync(path.join(root, "docs", "research", "proof-drop-method-analysis-v1.md")))
  assert.match(read("docs/research/proof-drop-method-analysis-v1.md"), /418457b243f8ca9d45e39f37b908a3b6aaef1f85/)
  assert.match(read("docs/research/proof-drop-method-analysis-v1.md"), /no copia código/)
})

test("the public module copy never turns integrity into truth or payment", () => {
  const page = read("app/desarrolladores/independiente/page.tsx")
  const builder = read("components/evidence/receipt-builder.tsx")
  const verifier = read("components/evidence/receipt-verifier.tsx")
  const combined = `${page}\n${builder}\n${verifier}`

  assert.match(combined, /no prueba autoría/i)
  assert.match(combined, /no promete pago/i)
  assert.match(combined, /no se subieron ni se guardaron/i)
  assert.doesNotMatch(combined, /garantiza pago/i)
  assert.doesNotMatch(combined, /prueba de autoría garantizada/i)
})
