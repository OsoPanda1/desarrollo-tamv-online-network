/**
 * Canonical serialization and digest helpers for TAMV Open Integrity reports.
 *
 * Reports are canonicalized with the same `tamv-jcs-1` serializer used by the
 * evidence receipt module: sorted keys, NFC strings, no undefined properties.
 * The digest binds the report content, not the time of evaluation. Any field
 * that changes the verdict or its explanation changes the digest.
 */

import { canonicalize, sha256Hex } from "../evidence/receipt.ts"

export const REPORT_CANONICALIZATION = "tamv-jcs-1" as const
export const REPORT_DIGEST_ALGORITHM = "sha-256" as const
export const REPORT_DIGEST_PREFIX = "sha256:" as const

export function canonicalReportBytes(report: unknown): string {
  return canonicalize(report)
}

export async function digestReport(report: unknown): Promise<string> {
  return `${REPORT_DIGEST_PREFIX}${await sha256Hex(canonicalReportBytes(report))}`
}

export function shortDigest(digest: string): string {
  const hex = digest.startsWith(REPORT_DIGEST_PREFIX) ? digest.slice(REPORT_DIGEST_PREFIX.length) : digest
  return hex.slice(0, 12)
}
