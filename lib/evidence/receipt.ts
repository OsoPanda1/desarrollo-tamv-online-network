/**
 * TAMV Evidence Receipt (CEV) v1.
 *
 * A receipt is a portable, canonical JSON envelope that binds declared
 * metadata to the SHA-256 digest of an evidence file. It is deliberately
 * *not* a signature, a proof of authorship, a trusted timestamp, a payment
 * instruction, or a statement that a claim is true.
 *
 * The implementation is isomorphic: the same functions run in the browser
 * (Web Crypto) and in Node/Next.js route handlers. No evidence bytes are
 * uploaded or persisted by this module.
 */

import { z } from "zod"

export const RECEIPT_SCHEMA = "tamv.evidence_receipt.v1" as const
export const RECEIPT_DOMAIN = "tamv.cev.v1" as const
export const RECEIPT_CANONICALIZATION = "tamv-jcs-1" as const
export const RECEIPT_TOOL = "tamv-independent-developer-module" as const
export const RECEIPT_VERSION = "1.0.0" as const
export const RECEIPT_TERMS_VERSION = "cev-1.0" as const

export const MAX_RECEIPT_BYTES = 64 * 1024
export const MAX_EVIDENCE_FILES = 20
export const MAX_EVIDENCE_FILE_BYTES = 50 * 1024 * 1024
export const MAX_CLAIMS = 20
export const MAX_URLS = 10
export const MAX_HANDLES = 5

export const RECEIPT_SEMANTICS =
  "This receipt records declared metadata and a SHA-256 digest. It does not establish authorship, ownership, source truth, task completion, trusted time, a cryptographic signature, peer review, accreditation, or eligibility for payment. A matching hash only shows that the canonical payload has not changed since it was stamped."

export const RECEIPT_SEMANTICS_ES =
  "Este comprobante registra metadatos declarados y una huella SHA-256. No establece autoría, propiedad, veracidad de la fuente, finalización de la tarea, tiempo confiable, firma criptográfica, revisión por pares, acreditación ni elegibilidad de pago. Un hash coincidente solo muestra que el payload canónico no cambió desde que se selló."

export const RECEIPT_LEVELS = [
  {
    id: "shape",
    labelEs: "Forma",
    labelEn: "Shape",
    descriptionEs: "El JSON cumple el esquema estricto y no contiene campos desconocidos.",
    descriptionEn: "The JSON matches the strict schema and contains no unknown fields.",
  },
  {
    id: "integrity",
    labelEs: "Integridad",
    labelEn: "Integrity",
    descriptionEs: "El hash recalculado coincide con el hash declarado.",
    descriptionEn: "The recomputed hash matches the declared hash.",
  },
  {
    id: "binding",
    labelEs: "Vínculo con el archivo",
    labelEn: "File binding",
    descriptionEs: "Quien verifica posee el archivo y recalcula su SHA-256; solo entonces puede comparar bytes.",
    descriptionEn: "The verifier holds the file and recomputes its SHA-256; only then can bytes be compared.",
  },
  {
    id: "origin",
    labelEs: "Origen registrado",
    labelEn: "Registered origin",
    descriptionEs: "Una cuenta autenticada y un registro del servidor vinculan el recibo con un emisor; no prueba autoría intelectual.",
    descriptionEn: "An authenticated account and a server record link the receipt to an issuer; this does not prove intellectual authorship.",
  },
  {
    id: "review",
    labelEs: "Revisión humana",
    labelEn: "Human review",
    descriptionEs: "Una persona revisora registró una atestación fechada. La revisión puede ser parcial, errónea o controvertida.",
    descriptionEn: "A human reviewer recorded a dated attestation. Review can be partial, mistaken, or disputed.",
  },
] as const

export type ReceiptLevelId = (typeof RECEIPT_LEVELS)[number]["id"]

const ISO_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/

const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/

function isWellFormedUnicode(value: string) {
  return !LONE_SURROGATE.test(value)
}

const isoDateTime = z.string().refine((value) => {
  const match = ISO_WITH_ZONE.exec(value)
  if (!match || Number.isNaN(Date.parse(value))) return false
  const [, year, month, day] = match
  const calendar = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return (
    calendar.getUTCFullYear() === Number(year) &&
    calendar.getUTCMonth() === Number(month) - 1 &&
    calendar.getUTCDate() === Number(day)
  )
}, "Expected an ISO 8601 date-time with an explicit timezone")

const digest = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Expected a lowercase SHA-256 hex digest")

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(isWellFormedUnicode, "Text must not contain lone UTF-16 surrogates")
    .transform((value) => value.normalize("NFC"))

const optionalText = (max: number) => text(max).nullable()

const httpUrl = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol
      return protocol === "http:" || protocol === "https:"
    } catch {
      return false
    }
  }, "Expected an HTTP or HTTPS URL")

const handleSchema = z
  .object({
    platform: z.enum(["github", "x", "farcaster", "orcid", "other"]),
    handle: text(120),
  })
  .strict()

const evidenceSchema = z
  .object({
    label: text(160),
    kind: z.enum(["file", "image", "video", "document", "dataset", "repository", "url", "other"]),
    sha256: digest,
    sizeBytes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().default(null),
    contentType: optionalText(160).default(null),
    uri: httpUrl.nullable().default(null),
    license: optionalText(160).default(null),
  })
  .strict()

const claimSchema = z
  .object({
    statement: text(500),
    status: z.literal("declared"),
  })
  .strict()

const receiptPayloadShape = z
  .object({
    schema: z.literal(RECEIPT_SCHEMA),
    createdAt: isoDateTime,
    nonce: z.string().regex(/^[a-f0-9]{16,64}$/, "Expected 8-32 random bytes as lowercase hex"),
    producer: z
      .object({
        name: text(120),
        url: httpUrl,
        tool: text(120),
        version: text(40),
      })
      .strict(),
    purpose: z
      .object({
        primary: z.literal("portable_evidence_receipt"),
        context: optionalText(200).default(null),
        note: text(500),
      })
      .strict(),
    issuer: z
      .object({
        kind: z.enum(["account", "self_declared"]),
        displayName: optionalText(120).default(null),
        handles: z.array(handleSchema).max(MAX_HANDLES).default([]),
      })
      .strict(),
    subject: z
      .object({
        kind: z.enum([
          "build",
          "repository",
          "dataset",
          "publication",
          "proposal",
          "simulation",
          "service",
          "other",
        ]),
        title: text(180),
        description: optionalText(1200).default(null),
        urls: z.array(httpUrl).max(MAX_URLS).default([]),
      })
      .strict(),
    evidence: z.array(evidenceSchema).max(MAX_EVIDENCE_FILES).default([]),
    claims: z.array(claimSchema).max(MAX_CLAIMS).default([]),
    consent: z
      .object({
        shareEvidence: z.boolean(),
        publishReceipt: z.boolean(),
        termsVersion: text(40),
        grantedAt: isoDateTime,
      })
      .strict(),
    chain: z
      .object({
        previous: digest.nullable().default(null),
      })
      .strict()
      .default({ previous: null }),
  })
  .strict()

function requireLocator(value: z.infer<typeof receiptPayloadShape>, ctx: z.RefinementCtx) {
  if (value.evidence.length === 0 && value.subject.urls.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "A receipt needs at least one evidence digest or one public subject URL.",
    })
  }
}

export const receiptPayloadSchema = receiptPayloadShape.superRefine(requireLocator)

export const receiptHashSchema = z
  .object({
    algorithm: z.literal("sha-256"),
    canonicalization: z.literal(RECEIPT_CANONICALIZATION),
    domain: z.literal(RECEIPT_DOMAIN),
    value: digest,
  })
  .strict()

export const stampedReceiptSchema = receiptPayloadShape
  .extend({ hash: receiptHashSchema })
  .strict()
  .superRefine(requireLocator)

export type EvidenceReceiptPayload = z.infer<typeof receiptPayloadShape>
export type EvidenceReceipt = z.infer<typeof stampedReceiptSchema>
export type ReceiptEvidenceItem = z.infer<typeof evidenceSchema>
export type ReceiptHash = z.infer<typeof receiptHashSchema>

export type CanonicalizationLimits = {
  maxDepth: number
  maxNodes: number
}

const DEFAULT_LIMITS: CanonicalizationLimits = { maxDepth: 32, maxNodes: 10_000 }

export type CanonicalizationErrorCode =
  | "depth_limit"
  | "node_limit"
  | "unsupported_type"
  | "non_finite_number"
  | "lone_surrogate"
  | "duplicate_key"
  | "invalid_object"

export class CanonicalizationError extends Error {
  code: CanonicalizationErrorCode

  constructor(code: CanonicalizationErrorCode, message: string) {
    super(message)
    this.name = "CanonicalizationError"
    this.code = code
  }
}

/**
 * Deterministic JSON serialization for `tamv-jcs-1`.
 *
 * Differences from RFC 8785 (JCS): strings are normalized to NFC before
 * serialization, undefined object properties are rejected instead of omitted,
 * and only plain objects are accepted. These choices are explicit so that two
 * producers cannot disagree silently about Unicode or prototype-bearing data.
 */
export function canonicalize(value: unknown, limits: Partial<CanonicalizationLimits> = {}): string {
  const config = { ...DEFAULT_LIMITS, ...limits }
  let nodes = 0

  const walk = (input: unknown, depth: number): string => {
    nodes += 1
    if (nodes > config.maxNodes) {
      throw new CanonicalizationError("node_limit", "The value exceeds the canonicalization node limit.")
    }
    if (depth > config.maxDepth) {
      throw new CanonicalizationError("depth_limit", "The value exceeds the canonicalization depth limit.")
    }

    if (input === null) return "null"

    if (typeof input === "string") {
      if (!isWellFormedUnicode(input)) {
        throw new CanonicalizationError("lone_surrogate", "Strings must not contain lone UTF-16 surrogates.")
      }
      return JSON.stringify(input.normalize("NFC"))
    }

    if (typeof input === "boolean") return input ? "true" : "false"

    if (typeof input === "number") {
      if (!Number.isFinite(input)) {
        throw new CanonicalizationError("non_finite_number", "Numbers must be finite.")
      }
      return Object.is(input, -0) ? "0" : JSON.stringify(input)
    }

    if (typeof input === "undefined") {
      throw new CanonicalizationError("unsupported_type", "Undefined values are not canonical JSON.")
    }

    if (typeof input !== "object") {
      throw new CanonicalizationError("unsupported_type", `Unsupported value type: ${typeof input}.`)
    }

    if (Array.isArray(input)) {
      return `[${input.map((item) => walk(item, depth + 1)).join(",")}]`
    }

    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CanonicalizationError("invalid_object", "Only plain objects can be canonicalized.")
    }

    const record = input as Record<string, unknown>
    const allKeys = Object.keys(record)
    if (allKeys.some((key) => record[key] === undefined)) {
      throw new CanonicalizationError("unsupported_type", "Undefined object properties are not canonical JSON.")
    }
    const keys = allKeys.sort()
    const normalizedKeys = keys.map((key) => key.normalize("NFC"))
    if (new Set(normalizedKeys).size !== keys.length) {
      throw new CanonicalizationError("duplicate_key", "Keys collide after Unicode normalization.")
    }

    return `{${keys
      .map((key) => {
        if (!isWellFormedUnicode(key)) {
          throw new CanonicalizationError("lone_surrogate", "Keys must not contain lone UTF-16 surrogates.")
        }
        return `${JSON.stringify(key.normalize("NFC"))}:${walk(record[key], depth + 1)}`
      })
      .join(",")}}`
  }

  return walk(value, 0)
}

function toBytes(input: string | ArrayBuffer | ArrayBufferView): Uint8Array {
  if (typeof input === "string") return new TextEncoder().encode(input)
  if (input instanceof Uint8Array) return input
  if (input instanceof ArrayBuffer) return new Uint8Array(input)
  return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
}

export async function sha256Hex(input: string | ArrayBuffer | ArrayBufferView): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error("Web Crypto is not available in this runtime.")
  const digestBuffer = await subtle.digest("SHA-256", toBytes(input) as unknown as BufferSource)
  return [...new Uint8Array(digestBuffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function receiptDigest(payload: EvidenceReceiptPayload | Record<string, unknown>): Promise<string> {
  return sha256Hex(`${RECEIPT_DOMAIN}\n${canonicalize(payload)}`)
}

export async function stampReceipt(input: unknown): Promise<EvidenceReceipt> {
  const payload = receiptPayloadSchema.parse(input)
  const value = await receiptDigest(payload)
  return {
    ...payload,
    hash: {
      algorithm: "sha-256",
      canonicalization: RECEIPT_CANONICALIZATION,
      domain: RECEIPT_DOMAIN,
      value,
    },
  }
}

export type ReceiptIssue = {
  path: string
  code: string
  message: string
}

export type ReceiptVerification = {
  valid: boolean
  levels: { shape: boolean; integrity: boolean }
  expected: string | null
  actual: string | null
  issues: ReceiptIssue[]
  semantics: string
}

function formatIssues(error: z.ZodError): ReceiptIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    code: issue.code,
    message: issue.message,
  }))
}

/**
 * Verifies shape and payload integrity only. File binding, registered origin,
 * and human review are separate levels that require additional evidence.
 */
export async function verifyReceipt(input: unknown): Promise<ReceiptVerification> {
  const parsed = stampedReceiptSchema.safeParse(input)
  if (!parsed.success) {
    return {
      valid: false,
      levels: { shape: false, integrity: false },
      expected: null,
      actual: null,
      issues: formatIssues(parsed.error),
      semantics: RECEIPT_SEMANTICS,
    }
  }

  const { hash, ...payload } = parsed.data
  const actual = await receiptDigest(payload)
  const integrity = actual === hash.value
  return {
    valid: integrity,
    levels: { shape: true, integrity },
    expected: hash.value,
    actual,
    issues: integrity
      ? []
      : [
          {
            path: "hash.value",
            code: "integrity_mismatch",
            message: "The canonical payload no longer matches the declared hash.",
          },
        ],
    semantics: RECEIPT_SEMANTICS,
  }
}

export type EvidenceFileInput = {
  name: string
  bytes: ArrayBuffer | Uint8Array
}

export type EvidenceBindingResult = {
  checked: number
  matched: { label: string; fileName: string; sha256: string }[]
  unmatchedFiles: { fileName: string; sha256: string }[]
  unmatchedEvidence: { label: string; sha256: string }[]
}

/**
 * Client-side binding check. The evidence file never leaves the device.
 * A match shows that the supplied bytes hash to a digest declared in the
 * receipt; it does not prove who produced them or that they are truthful.
 */
export async function verifyEvidenceFiles(
  receipt: EvidenceReceipt,
  files: EvidenceFileInput[],
): Promise<EvidenceBindingResult> {
  const declared = new Map<string, string[]>()
  for (const item of receipt.evidence) {
    const labels = declared.get(item.sha256) ?? []
    labels.push(item.label)
    declared.set(item.sha256, labels)
  }

  const matched: EvidenceBindingResult["matched"] = []
  const unmatchedFiles: EvidenceBindingResult["unmatchedFiles"] = []

  for (const file of files) {
    const value = await sha256Hex(file.bytes)
    const labels = declared.get(value)
    if (labels) {
      for (const label of labels) matched.push({ label, fileName: file.name, sha256: value })
    } else {
      unmatchedFiles.push({ fileName: file.name, sha256: value })
    }
  }

  const matchedDigests = new Set(matched.map((item) => item.sha256))
  const unmatchedEvidence = receipt.evidence
    .filter((item) => !matchedDigests.has(item.sha256))
    .map((item) => ({ label: item.label, sha256: item.sha256 }))

  return { checked: files.length, matched, unmatchedFiles, unmatchedEvidence }
}

export function shortDigest(value: string, head = 14, tail = 8) {
  if (value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

export function receiptFileName(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return `tamv-cev-${slug || "receipt"}.json`
}

/**
 * A conservative JSON-LD projection for catalogues. It carries the same
 * disclaimer as the receipt and must not be read as an endorsement.
 */
export function receiptToJsonLd(receipt: EvidenceReceipt) {
  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    identifier: `sha256:${receipt.hash.value}`,
    name: receipt.subject.title,
    description: receipt.subject.description ?? undefined,
    dateCreated: receipt.createdAt,
    about: receipt.subject.kind,
    url: receipt.subject.urls[0],
    creator: receipt.issuer.displayName
      ? { "@type": "Person", name: receipt.issuer.displayName }
      : undefined,
    sha256: receipt.hash.value,
    isBasedOn: receipt.evidence.map((item) => ({
      "@type": "CreativeWork",
      name: item.label,
      identifier: `sha256:${item.sha256}`,
      ...(item.uri ? { url: item.uri } : {}),
    })),
    disclaimer: RECEIPT_SEMANTICS,
  }
}
