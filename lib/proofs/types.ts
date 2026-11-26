/** TPVA receipt v1 types. This is a specification contract, not a production issuer. */

export type ProofState = "VERIFIED" | "WITH NOTES" | "FAILED" | "UNVERIFIED" | "REVOKED";

export type CheckStatus = "pass" | "fail" | "skipped" | "not_available";

export interface ReceiptEvidence {
  path: string;
  media_type: string;
  size_bytes: number;
  sha256: string;
}

export interface ReceiptCheck {
  name: string;
  tool: string;
  tool_version: string;
  status: CheckStatus;
  evidence_ref: string;
  mandatory: boolean;
}

export interface ReceiptReview {
  type: "automated" | "maintainer" | "independent";
  scope: string;
  limitations: string;
  external: boolean;
  provider?: string;
  provider_url?: string;
}

export interface ReceiptSignature {
  algorithm: "Ed25519";
  kid: string;
  public_key_ref: string;
  value: string;
}

export interface ReceiptRevocation {
  status: "none" | "revoked";
  reason: string;
  revoked_at?: string;
}

export interface TpvaReceipt {
  schema: "tpva-receipt/v1";
  receipt_id: string;
  repository: string;
  commit_sha: string;
  artifact_digest: string;
  evidence: ReceiptEvidence[];
  checks: ReceiptCheck[];
  review: ReceiptReview;
  issued_at: string;
  previous_receipt_hash: string | null;
  receipt_hash: string;
  signature: ReceiptSignature;
  revocation?: ReceiptRevocation;
}

/** Public key material only. Private keys are never accepted by this module. */
export interface ProofKey {
  kid: string;
  publicKey: string;
  status: "active" | "revoked";
}

export interface VerifyReceiptOptions {
  keys: ProofKey[];
  now?: string;
}

export interface ReceiptVerification {
  state: ProofState;
  reasons: string[];
  receiptHash: string | null;
  checkedAt: string;
}
