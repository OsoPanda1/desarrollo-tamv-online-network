import { createHmac, timingSafeEqual } from "node:crypto"

const DEFAULT_TOLERANCE_SECONDS = 300

/**
 * Stripe signs the exact raw body. Call this before JSON parsing or any body
 * transformation. A bounded timestamp window limits replay of captured events.
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowMs = Date.now(),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): boolean {
  if (!signatureHeader || !secret || !rawBody || !Number.isFinite(nowMs)) return false

  const fields = signatureHeader.split(",").map((part) => part.trim().split("=", 2))
  const timestampText = fields.find(([key]) => key === "t")?.[1]
  const timestamp = Number(timestampText)
  if (!timestampText || !Number.isSafeInteger(timestamp) || timestamp <= 0) return false
  if (Math.abs(Math.floor(nowMs / 1000) - timestamp) > toleranceSeconds) return false

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest()
  const signatures = fields
    .filter(([key, value]) => key === "v1" && typeof value === "string" && /^[a-f0-9]{64}$/i.test(value))
    .map(([, value]) => Buffer.from(value!, "hex"))

  return signatures.some((signature) => signature.length === expected.length && timingSafeEqual(signature, expected))
}
