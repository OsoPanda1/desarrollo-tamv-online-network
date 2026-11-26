/** Deterministic SHA-256 helpers for TPVA payloads and evidence files. */

import { createHash } from "node:crypto";
import { canonicalReceiptBytes } from "./canonical.ts";
import type { TpvaReceipt } from "./types.ts";

export function sha256Hex(value: Uint8Array | string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashReceiptPayload(receipt: TpvaReceipt): string {
  return `sha256:${sha256Hex(canonicalReceiptBytes(receipt))}`;
}
