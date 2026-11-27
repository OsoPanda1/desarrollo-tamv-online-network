import "server-only"

/**
 * Restricted source for the founder-only specification.
 * Never prefix this environment variable with NEXT_PUBLIC_.
 * Do not put the canonical text in this public repository.
 */
export function getPrivateLgsSpecification(): string | null {
  const value = process.env.LGS_CANONICAL_SPEC_MARKDOWN
  if (!value || value.trim().length === 0) return null
  return value
}
