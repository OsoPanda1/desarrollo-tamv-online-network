import { createHash } from "node:crypto"

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}

export function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

export function sha3_512(value: string) {
  return createHash("sha3-512").update(value, "utf8").digest("hex")
}

export function makeProposalEventHash(payload: Record<string, unknown>, previousHash: string | null) {
  const canonicalPayload = canonicalJson(payload)
  return {
    canonicalPayload: JSON.parse(canonicalPayload) as Record<string, unknown>,
    eventHash: sha256(`${previousHash ?? "GENESIS"}\n${canonicalPayload}`),
  }
}
