import test from "node:test"
import assert from "node:assert/strict"
import {
  buildMerkleTree,
  canonicalizeMerkleRecord,
  createMerkleInclusionProof,
  verifyMerkleInclusionProof,
} from "../lib/lgs/merkle.ts"

test("canonicalization sorts object keys and preserves array order", () => {
  assert.equal(canonicalizeMerkleRecord({ z: 1, a: { y: true, x: null } }), '{"a":{"x":null,"y":true},"z":1}')
  assert.notEqual(canonicalizeMerkleRecord([1, 2]), canonicalizeMerkleRecord([2, 1]))
})

test("tree roots are deterministic for canonical-equivalent records", () => {
  const a = buildMerkleTree([{ b: 2, a: 1 }, { id: "two" }])
  const b = buildMerkleTree([{ a: 1, b: 2 }, { id: "two" }])
  assert.equal(a.root, b.root)
  assert.equal(a.leafCount, 2)
})

test("inclusion proofs verify for every leaf in an odd-width tree", () => {
  const records = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
  const tree = buildMerkleTree(records)
  for (let index = 0; index < records.length; index += 1) {
    const proof = createMerkleInclusionProof(records, index)
    assert.equal(verifyMerkleInclusionProof(records[index], proof, tree.root), true)
  }
})

test("proof rejects a modified record, root, direction or sibling", () => {
  const records = [{ id: "alpha" }, { id: "beta" }, { id: "gamma" }]
  const root = buildMerkleTree(records).root
  const proof = createMerkleInclusionProof(records, 1)
  assert.equal(verifyMerkleInclusionProof({ id: "changed" }, proof, root), false)
  assert.equal(verifyMerkleInclusionProof(records[1], proof, "0".repeat(64)), false)
  assert.equal(verifyMerkleInclusionProof(records[1], { ...proof, siblings: [{ ...proof.siblings[0], side: "right" }, ...proof.siblings.slice(1)] }, root), false)
})

test("empty tree has a deterministic domain-separated root and no valid inclusion", () => {
  const tree = buildMerkleTree([])
  assert.equal(tree.leafCount, 0)
  assert.equal(tree.root.length, 64)
  assert.throws(() => createMerkleInclusionProof([], 0), RangeError)
})

test("canonicalization rejects undefined and non-finite numbers", () => {
  assert.throws(() => canonicalizeMerkleRecord({ value: undefined }), TypeError)
  assert.throws(() => canonicalizeMerkleRecord({ value: Number.NaN }), TypeError)
})
