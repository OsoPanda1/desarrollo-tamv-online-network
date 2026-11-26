import { z } from "zod";
import { isSafeReferenceUrl } from "../validation.ts";

const publicHttpUrl = z.string().trim().url().max(2048).refine(
  isSafeReferenceUrl,
  "URI must use a public HTTP/HTTPS URL without credentials, private addresses or local hostnames",
);

const isoDateTimeWithZone = z.string().refine(
  (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/.exec(value);
    if (!match || Number.isNaN(Date.parse(value))) return false;
    const [, year, month, day] = match;
    const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return calendarDate.getUTCFullYear() === Number(year) &&
      calendarDate.getUTCMonth() === Number(month) - 1 &&
      calendarDate.getUTCDate() === Number(day);
  },
  "Expected an ISO 8601 date-time with an explicit timezone",
);

const digestLengths = {
  "sha-256": 64,
  "sha-384": 96,
  "sha-512": 128,
} as const;

/**
 * Runtime validation for provenance envelopes received from external systems.
 * This records origin/validation metadata; it does not establish authorship,
 * trusted time, cryptographic signature validity, peer review or accreditation.
 */
export const provenanceRecordSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  sourceUri: publicHttpUrl,
  sourceSystem: z.string().trim().min(1).max(200),
  sourceRecordId: z.string().max(500).nullable().optional(),
  sourceVersion: z.string().max(300).nullable().optional(),
  observedAt: isoDateTimeWithZone,
  license: z.string().trim().min(1).max(200).nullable().optional(),
  contentDigest: z
    .object({
      algorithm: z.enum(["sha-256", "sha-384", "sha-512"]),
      value: z.string().regex(/^[a-fA-F0-9]+$/),
    })
    .strict()
    .nullable()
    .optional()
    .refine(
      (digest) =>
        digest === undefined ||
        digest === null ||
        digest.value.length === digestLengths[digest.algorithm],
      "Digest length does not match its declared algorithm",
    ),
  validationState: z.enum([
    "unreviewed",
    "schema_valid",
    "source_verified",
    "rejected",
  ]),
  validationEvidenceUri: publicHttpUrl.nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
}).strict();

export type ProvenanceRecord = z.infer<typeof provenanceRecordSchema>;

export function validateProvenanceRecord(input: unknown): ProvenanceRecord {
  return provenanceRecordSchema.parse(input);
}
