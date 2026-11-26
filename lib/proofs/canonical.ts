/**
 * Deterministic canonicalization for TPVA receipts.
 *
 * This module does not issue receipts, verify signatures or claim external
 * review. It only converts a validated payload into the exact UTF-8 bytes
 * that are hashed and signed.
 */

import type { TpvaReceipt } from "./types.ts";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareText(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function canonicalizeValue(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeValue(item));
  }
  if (isRecord(value)) {
    const output: UnknownRecord = {};
    for (const name of Object.keys(value).sort(compareText)) {
      if (value[name] === undefined) continue;
      output[name] = canonicalizeValue(value[name], name);
    }
    return output;
  }
  if ((key === "issued_at" || key === "revoked_at") && typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return value;
}

function stableSort<T>(items: T[], key: (item: T) => string): T[] {
  return [...items].sort((left, right) => {
    const byKey = compareText(key(left), key(right));
    if (byKey !== 0) return byKey;
    return compareText(
      JSON.stringify(canonicalizeValue(left)),
      JSON.stringify(canonicalizeValue(right)),
    );
  });
}

/**
 * Canonical payload excludes `receipt_hash` and `signature`, recursively sorts
 * object keys, sorts evidence by path and checks by name, and normalizes the
 * two receipt date fields to UTC with milliseconds.
 */
export function canonicalizeReceiptPayload(receipt: TpvaReceipt): string {
  const payload: UnknownRecord = { ...(receipt as unknown as UnknownRecord) };
  delete payload.receipt_hash;
  delete payload.signature;

  if (Array.isArray(payload.evidence)) {
    payload.evidence = stableSort(
      payload.evidence as Array<{ path?: unknown }>,
      (item) => (typeof item?.path === "string" ? item.path : ""),
    );
  }
  if (Array.isArray(payload.checks)) {
    payload.checks = stableSort(
      payload.checks as Array<{ name?: unknown }>,
      (item) => (typeof item?.name === "string" ? item.name : ""),
    );
  }

  return JSON.stringify(canonicalizeValue(payload));
}

export function canonicalReceiptBytes(receipt: TpvaReceipt): Uint8Array {
  return new TextEncoder().encode(canonicalizeReceiptPayload(receipt));
}
