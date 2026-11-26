/**
 * Strict structural validation for TPVA receipts.
 *
 * This is schema enforcement plus safety rules. It does not verify authorship,
 * signatures, timestamps, review providers or production authorization.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

type UnknownRecord = Record<string, unknown>;

const SHA256_HEX = /^[a-f0-9]{64}$/;
const CANONICAL_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SAFE_PATH = /^(?!\/)(?!.*(?:\.\.|^\.$))[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/;
const RECEIPT_ID = /^rcpt_[a-f0-9]{32}$/;
const COMMIT_SHA = /^[a-f0-9]{40}$/;
const ARTIFACT_DIGEST = /^sha256:[a-f0-9]{64}$/;
const KEY_ID = /^tpva-[a-z0-9-]{1,64}$/;
const SIGNATURE_HEX = /^[a-f0-9]{128}$/;
const CHECK_STATUSES = new Set(["pass", "fail", "skipped", "not_available"]);
const REVIEW_TYPES = new Set(["automated", "maintainer", "independent"]);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string, errors: string[]): value is UnknownRecord {
  if (!isRecord(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  return true;
}

function requireKeys(
  value: UnknownRecord,
  keys: readonly string[],
  label: string,
  errors: string[],
): void {
  for (const key of keys) {
    if (!(key in value)) errors.push(`${label}.${key} is required`);
  }
}

function onlyKeys(
  value: UnknownRecord,
  keys: readonly string[],
  label: string,
  errors: string[],
): void {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${label}.${key} is not allowed`);
  }
}

function stringField(
  value: UnknownRecord,
  key: string,
  label: string,
  errors: string[],
  options: { min?: number; max?: number; pattern?: RegExp } = {},
): void {
  const field = value[key];
  if (typeof field !== "string") {
    errors.push(`${label}.${key} must be a string`);
    return;
  }
  if (options.min !== undefined && field.length < options.min) {
    errors.push(`${label}.${key} is too short`);
  }
  if (options.max !== undefined && field.length > options.max) {
    errors.push(`${label}.${key} is too long`);
  }
  if (options.pattern && !options.pattern.test(field)) {
    errors.push(`${label}.${key} has an invalid format`);
  }
}

function canonicalDateField(
  value: UnknownRecord,
  key: string,
  label: string,
  errors: string[],
): void {
  const field = value[key];
  if (typeof field !== "string" || !CANONICAL_ISO.test(field)) {
    errors.push(`${label}.${key} must be ISO-8601 UTC with milliseconds`);
    return;
  }
  const parsed = new Date(field);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== field) {
    errors.push(`${label}.${key} is not a real UTC timestamp`);
  }
}

function booleanField(
  value: UnknownRecord,
  key: string,
  label: string,
  errors: string[],
): void {
  if (typeof value[key] !== "boolean") errors.push(`${label}.${key} must be a boolean`);
}

function validateEvidence(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("$.evidence must be an array");
    return;
  }
  if (value.length < 1 || value.length > 200) {
    errors.push("$.evidence must contain between 1 and 200 entries");
  }
  value.forEach((entry, index) => {
    const label = `$.evidence[${index}]`;
    if (!requireObject(entry, label, errors)) return;
    requireKeys(entry, ["path", "media_type", "size_bytes", "sha256"], label, errors);
    onlyKeys(entry, ["path", "media_type", "size_bytes", "sha256"], label, errors);
    stringField(entry, "path", label, errors, { min: 1, max: 512, pattern: SAFE_PATH });
    stringField(entry, "media_type", label, errors, { min: 1, max: 128 });
    stringField(entry, "sha256", label, errors, { pattern: SHA256_HEX });
    const size = entry.size_bytes;
    if (typeof size !== "number" || !Number.isInteger(size) || size < 0 || size > 52_428_800) {
      errors.push(`${label}.size_bytes must be an integer between 0 and 52428800`);
    }
  });
}

function validateChecks(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("$.checks must be an array");
    return;
  }
  if (value.length < 1 || value.length > 200) {
    errors.push("$.checks must contain between 1 and 200 entries");
  }
  value.forEach((entry, index) => {
    const label = `$.checks[${index}]`;
    if (!requireObject(entry, label, errors)) return;
    requireKeys(
      entry,
      ["name", "tool", "tool_version", "status", "evidence_ref", "mandatory"],
      label,
      errors,
    );
    onlyKeys(
      entry,
      ["name", "tool", "tool_version", "status", "evidence_ref", "mandatory"],
      label,
      errors,
    );
    stringField(entry, "name", label, errors, { min: 1, max: 120 });
    stringField(entry, "tool", label, errors, { min: 1, max: 120 });
    stringField(entry, "tool_version", label, errors, { min: 1, max: 60 });
    stringField(entry, "evidence_ref", label, errors, { min: 1, max: 512, pattern: SAFE_PATH });
    booleanField(entry, "mandatory", label, errors);
    const status = entry.status;
    if (typeof status !== "string" || !CHECK_STATUSES.has(status)) {
      errors.push(`${label}.status has an invalid value`);
    }
  });
}

function validateReview(value: unknown, errors: string[]): void {
  const label = "$.review";
  if (!requireObject(value, label, errors)) return;
  requireKeys(value, ["type", "scope", "limitations", "external"], label, errors);
  onlyKeys(
    value,
    ["type", "scope", "limitations", "external", "provider", "provider_url"],
    label,
    errors,
  );
  const type = value.type;
  if (typeof type !== "string" || !REVIEW_TYPES.has(type)) {
    errors.push(`${label}.type has an invalid value`);
  }
  stringField(value, "scope", label, errors, { min: 1, max: 4000 });
  stringField(value, "limitations", label, errors, { max: 4000 });
  booleanField(value, "external", label, errors);

  if (value.external === true) {
    stringField(value, "provider", label, errors, { min: 1, max: 160 });
    stringField(value, "provider_url", label, errors, { min: 1, max: 2000 });
    if (typeof value.provider_url === "string" && !value.provider_url.startsWith("https://")) {
      errors.push(`${label}.provider_url must use https`);
    }
  } else if ("provider" in value || "provider_url" in value) {
    errors.push(`${label}.provider fields require external=true`);
  }
}

function validateSignature(value: unknown, errors: string[]): void {
  const label = "$.signature";
  if (!requireObject(value, label, errors)) return;
  requireKeys(value, ["algorithm", "kid", "public_key_ref", "value"], label, errors);
  onlyKeys(value, ["algorithm", "kid", "public_key_ref", "value"], label, errors);
  if (value.algorithm !== "Ed25519") errors.push(`${label}.algorithm must equal Ed25519`);
  stringField(value, "kid", label, errors, { pattern: KEY_ID });
  stringField(value, "public_key_ref", label, errors, { min: 1, max: 512, pattern: SAFE_PATH });
  stringField(value, "value", label, errors, { pattern: SIGNATURE_HEX });
}

function validateRevocation(value: unknown, errors: string[]): void {
  const label = "$.revocation";
  if (!requireObject(value, label, errors)) return;
  requireKeys(value, ["status", "reason"], label, errors);
  onlyKeys(value, ["status", "reason", "revoked_at"], label, errors);
  const status = value.status;
  if (status !== "none" && status !== "revoked") {
    errors.push(`${label}.status has an invalid value`);
  }
  stringField(value, "reason", label, errors, { max: 1000 });
  if ("revoked_at" in value) canonicalDateField(value, "revoked_at", label, errors);
  if (status === "revoked" && !("revoked_at" in value)) {
    errors.push(`${label}.revoked_at is required when status is revoked`);
  }
  if (status === "none" && "revoked_at" in value) {
    errors.push(`${label}.revoked_at is not allowed when status is none`);
  }
}

export function validateReceiptShape(receipt: unknown): ValidationResult {
  const errors: string[] = [];
  if (!requireObject(receipt, "$", errors)) return { valid: false, errors };

  requireKeys(
    receipt,
    [
      "schema",
      "receipt_id",
      "repository",
      "commit_sha",
      "artifact_digest",
      "evidence",
      "checks",
      "review",
      "issued_at",
      "previous_receipt_hash",
      "receipt_hash",
      "signature",
    ],
    "$",
    errors,
  );
  onlyKeys(
    receipt,
    [
      "schema",
      "receipt_id",
      "repository",
      "commit_sha",
      "artifact_digest",
      "evidence",
      "checks",
      "review",
      "issued_at",
      "previous_receipt_hash",
      "receipt_hash",
      "signature",
      "revocation",
    ],
    "$",
    errors,
  );

  if (receipt.schema !== "tpva-receipt/v1") errors.push("$.schema must equal tpva-receipt/v1");
  stringField(receipt, "receipt_id", "$", errors, { pattern: RECEIPT_ID });
  stringField(receipt, "commit_sha", "$", errors, { pattern: COMMIT_SHA });
  stringField(receipt, "artifact_digest", "$", errors, { pattern: ARTIFACT_DIGEST });
  stringField(receipt, "repository", "$", errors, { min: 1, max: 2000 });
  if (
    typeof receipt.repository === "string" &&
    !receipt.repository.startsWith("https://github.com/")
  ) {
    errors.push("$.repository must be a canonical https://github.com/ URL");
  }
  canonicalDateField(receipt, "issued_at", "$", errors);

  const previous = receipt.previous_receipt_hash;
  if (previous !== null && !(typeof previous === "string" && ARTIFACT_DIGEST.test(previous))) {
    errors.push("$.previous_receipt_hash must be null or a sha256 digest");
  }
  stringField(receipt, "receipt_hash", "$", errors, { pattern: ARTIFACT_DIGEST });

  validateEvidence(receipt.evidence, errors);
  validateChecks(receipt.checks, errors);
  validateReview(receipt.review, errors);
  validateSignature(receipt.signature, errors);
  if ("revocation" in receipt) validateRevocation(receipt.revocation, errors);

  return { valid: errors.length === 0, errors };
}
