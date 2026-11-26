/**
 * Offline TPVA receipt verifier.
 *
 * It recalculates the canonical hash, verifies a real Ed25519 signature when
 * public key material is supplied, and evaluates deterministic evidence state.
 * It does not contact external providers, does not inspect private keys and
 * does not turn a self-declared external review into an external badge.
 */

import { createPublicKey, verify as verifyEd25519 } from "node:crypto";
import { canonicalReceiptBytes } from "./canonical.ts";
import { hashReceiptPayload } from "./hash.ts";
import { validateReceiptShape } from "./validate.ts";
import type {
  ProofKey,
  ProofState,
  ReceiptVerification,
  TpvaReceipt,
  VerifyReceiptOptions,
} from "./types.ts";

function canonicalNow(value: string | undefined): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function verification(
  state: ProofState,
  reasons: string[],
  receiptHash: string | null,
  checkedAt: string,
): ReceiptVerification {
  return { state, reasons, receiptHash, checkedAt };
}

function selectedKey(keys: ProofKey[] | undefined, kid: string): ProofKey | undefined {
  if (!Array.isArray(keys)) return undefined;
  return keys.find((key) => key && key.kid === kid);
}

export function verifyReceiptSignature(
  receipt: TpvaReceipt,
  key: ProofKey,
): boolean {
  try {
    const publicKey = createPublicKey(key.publicKey);
    const signature = Buffer.from(receipt.signature.value, "hex");
    if (signature.length !== 64) return false;
    return verifyEd25519(null, canonicalReceiptBytes(receipt), publicKey, signature);
  } catch {
    return false;
  }
}

/**
 * Fail-closed evaluation. Any unknown key, malformed input or altered payload
 * cannot become VERIFIED. Offline verification of an external-review claim is
 * deliberately downgraded to WITH NOTES.
 */
export function verifyReceipt(
  receipt: unknown,
  options: VerifyReceiptOptions = { keys: [] },
): ReceiptVerification {
  const checkedAt = canonicalNow(options.now);
  const shape = validateReceiptShape(receipt);
  if (!shape.valid) {
    return verification("UNVERIFIED", ["schema_invalid", ...shape.errors.slice(0, 8)], null, checkedAt);
  }

  const typed = receipt as TpvaReceipt;
  const receiptHash = hashReceiptPayload(typed);
  if (receiptHash !== typed.receipt_hash) {
    return verification("FAILED", ["receipt_hash_mismatch"], receiptHash, checkedAt);
  }

  if (typed.revocation?.status === "revoked") {
    return verification("REVOKED", ["receipt_revoked"], receiptHash, checkedAt);
  }

  const key = selectedKey(options.keys, typed.signature.kid);
  if (!key) return verification("UNVERIFIED", ["key_unavailable"], receiptHash, checkedAt);
  if (key.status === "revoked") {
    return verification("REVOKED", ["key_revoked"], receiptHash, checkedAt);
  }
  if (!verifyReceiptSignature(typed, key)) {
    return verification("FAILED", ["signature_invalid"], receiptHash, checkedAt);
  }

  const evidencePaths = new Set(typed.evidence.map((item) => item.path));
  const missingRefs = typed.checks
    .filter((check) => !evidencePaths.has(check.evidence_ref))
    .map((check) => check.name);
  if (missingRefs.length > 0) {
    return verification("UNVERIFIED", ["evidence_ref_missing", ...missingRefs], receiptHash, checkedAt);
  }

  const failedMandatory = typed.checks
    .filter((check) => check.mandatory && check.status !== "pass")
    .map((check) => check.name);
  if (failedMandatory.length > 0) {
    return verification("FAILED", ["mandatory_check_failed", ...failedMandatory], receiptHash, checkedAt);
  }

  const notes: string[] = [];
  if (typed.checks.some((check) => !check.mandatory && check.status !== "pass")) {
    notes.push("optional_check_not_passed");
  }
  if (typed.review.limitations.trim().length > 0) notes.push("documented_limitations");
  if (typed.review.type === "independent") notes.push("independent_claim_offline");
  if (typed.review.external === true) notes.push("external_claim_offline");

  if (notes.length > 0) {
    return verification("WITH NOTES", notes, receiptHash, checkedAt);
  }
  return verification("VERIFIED", [], receiptHash, checkedAt);
}
