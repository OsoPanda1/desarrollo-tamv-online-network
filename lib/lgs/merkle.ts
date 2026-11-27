import { createHash } from "node:crypto"

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export type MerkleSibling = { hash: string; side: "left" | "right" }
export type MerkleInclusionProof = {
  algorithm: "SHA-256"
  leafIndex: number
  leafCount: number
  siblings: MerkleSibling[]
}
export type MerkleTreeResult = {
  algorithm: "SHA-256"
  leafCount: number
  leafHashes: string[]
  root: string
}

const HEX_256 = /^[a-f0-9]{64}$/

function stableJsonValue(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Merkle records must not contain non-finite numbers")
    return Object.is(value, -0) ? 0 : value
  }
  if (Array.isArray(value)) return value.map(stableJsonValue)
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Merkle records must contain plain JSON objects only")
    }
    const output: Record<string, JsonValue> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const item = (value as Record<string, unknown>)[key]
      if (item === undefined) throw new TypeError("Merkle records must not contain undefined values")
      output[key] = stableJsonValue(item)
    }
    return output
  }
  throw new TypeError("Merkle records must be JSON-compatible values")
}

/** Deterministic JSON serialization for the supported JSON data model. */
export function canonicalizeMerkleRecord(record: unknown): string {
  return JSON.stringify(stableJsonValue(record))
}

function digest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function leafHash(record: unknown): string {
  const canonical = Buffer.from(canonicalizeMerkleRecord(record), "utf8")
  return digest(Buffer.concat([Buffer.from([0x00]), canonical]))
}

function parentHash(leftHex: string, rightHex: string): string {
  return digest(Buffer.concat([
    Buffer.from([0x01]),
    Buffer.from(leftHex, "hex"),
    Buffer.from(rightHex, "hex"),
  ]))
}

function emptyRoot(): string {
  return digest(Buffer.from([0x02]))
}

function nextLevel(level: string[]): string[] {
  const next: string[] = []
  for (let index = 0; index < level.length; index += 2) {
    const left = level[index]
    const right = level[index + 1] ?? left
    next.push(parentHash(left, right))
  }
  return next
}

export function buildMerkleTree(records: readonly unknown[]): MerkleTreeResult {
  const leafHashes = records.map(leafHash)
  if (leafHashes.length === 0) {
    return { algorithm: "SHA-256", leafCount: 0, leafHashes, root: emptyRoot() }
  }
  let level = leafHashes
  while (level.length > 1) level = nextLevel(level)
  return { algorithm: "SHA-256", leafCount: leafHashes.length, leafHashes, root: level[0] }
}

/**
 * Creates an inclusion proof using the documented duplicate-last policy for
 * odd-width levels. Proof hashes are lowercase hexadecimal SHA-256 digests.
 */
export function createMerkleInclusionProof(records: readonly unknown[], leafIndex: number): MerkleInclusionProof {
  if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= records.length) {
    throw new RangeError("leafIndex must refer to an existing record")
  }
  let level = records.map(leafHash)
  let index = leafIndex
  const siblings: MerkleSibling[] = []

  while (level.length > 1) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1
    const sibling = level[siblingIndex] ?? level[index]
    siblings.push({ hash: sibling, side: index % 2 === 0 ? "right" : "left" })
    level = nextLevel(level)
    index = Math.floor(index / 2)
  }

  return { algorithm: "SHA-256", leafIndex, leafCount: records.length, siblings }
}

/** Verifies inclusion against a trusted root; it does not establish truth or completeness. */
export function verifyMerkleInclusionProof(
  record: unknown,
  proof: MerkleInclusionProof,
  expectedRoot: string,
): boolean {
  if (proof.algorithm !== "SHA-256" || !HEX_256.test(expectedRoot)) return false
  if (!Number.isInteger(proof.leafCount) || proof.leafCount < 1) return false
  if (!Number.isInteger(proof.leafIndex) || proof.leafIndex < 0 || proof.leafIndex >= proof.leafCount) return false

  let expectedDepth = 0
  for (let width = proof.leafCount; width > 1; width = Math.ceil(width / 2)) expectedDepth += 1
  if (proof.siblings.length !== expectedDepth) return false

  let current = leafHash(record)
  let index = proof.leafIndex
  let width = proof.leafCount

  for (const step of proof.siblings) {
    if (!HEX_256.test(step.hash)) return false
    const expectedSide = index % 2 === 0 ? "right" : "left"
    if (step.side !== expectedSide) return false
    if (index % 2 === 0 && index + 1 >= width && step.hash !== current) return false
    current = step.side === "left"
      ? parentHash(step.hash, current)
      : parentHash(current, step.hash)
    index = Math.floor(index / 2)
    width = Math.ceil(width / 2)
  }

  return current === expectedRoot
}
