import { z } from "zod"

export function isSafeReferenceUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return false
    if (url.username || url.password) return false

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "")
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".test")
    ) return false

    const octets = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (octets) {
      const [a, b, c, d] = octets.slice(1).map(Number)
      if ([a, b, c, d].some((part) => part > 255)) return false
      if (
        a === 0 || a === 10 || a === 127 || a >= 224 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 192 && b === 0 && (c === 0 || c === 2)) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113)
      ) return false
      // Keep the last octet referenced so the complete address is validated.
      if (d < 0 || d > 255) return false
    }

    // Only globally routable IPv6 unicast space (2000::/3) is accepted.
    if (hostname.includes(":") && (!/^[23][0-9a-f:]+$/i.test(hostname) || /^2001:db8:/i.test(hostname))) return false
    return true
  } catch {
    return false
  }
}

const safeHttpUrl = z.string().trim().url().max(2048).refine(
  isSafeReferenceUrl,
  "Usa una URL HTTP/HTTPS pública válida, sin credenciales ni direcciones locales.",
)

export const proposalSchema = z.object({
  topicId: z.string().trim().min(1).max(120).nullable().optional(),
  title: z.string().trim().min(8).max(160),
  abstract: z.string().trim().min(100).max(5000),
  proposalType: z.enum(["article", "dataset", "thesis", "report", "prototype", "course", "other"]),
  license: z.string().trim().max(80).optional().nullable(),
  sourceUrl: safeHttpUrl.optional().nullable(),
  shareConsent: z.boolean().default(false),
})

export const interestSchema = z.object({
  topicId: z.string().trim().min(1).max(120),
  interestType: z.enum(["join", "cocreate", "publish", "funding"]),
  message: z.string().trim().min(10).max(1200),
  consentToShare: z.boolean().default(false),
})

export const profileSchema = z.object({
  publicName: z.string().trim().min(2).max(100),
  affiliation: z.string().trim().max(180).nullable().optional(),
  orcid: z.string().trim().max(19).nullable().optional(),
  isni: z.string().trim().max(19).nullable().optional(),
  researchLines: z.array(z.string().trim().min(2).max(80)).max(12),
  isPublic: z.boolean().default(false),
})

export const evidenceSchema = z.object({
  label: z.string().trim().min(2).max(120),
  kind: z.enum(["article", "dataset", "repository", "thesis", "report", "other"]),
  url: safeHttpUrl,
  description: z.string().trim().max(600).optional().nullable(),
  license: z.string().trim().max(80).optional().nullable(),
})

export const appealSchema = z.object({
  reason: z.string().trim().min(30).max(2000),
})

export const moderationSchema = z.object({
  outcome: z.enum(["triage", "review", "changes_requested", "accepted", "rejected", "published", "recusal"]),
  feedback: z.string().trim().min(10).max(3000),
  conflictOfInterest: z.boolean().default(false),
})

export const simulationSchema = z.object({
  scenario: z.enum(["baseline", "conservative", "collaborative"]),
  startYear: z.number().int().min(2026).max(2050),
  endYear: z.number().int().min(2026).max(2050),
  seed: z.number().int().min(0).max(2_147_483_647),
  mcRuns: z.number().int().min(20).max(200),
  shocks: z.array(z.object({
    atomId: z.string().min(1).max(120),
    year: z.number().int().min(2026).max(2050),
    intensity: z.number().min(-1).max(1),
  })).max(16),
  quarantine: z.array(z.string().min(1).max(120)).max(64),
})

const uniqueAtomIds = (ids: string[]) => new Set(ids).size === ids.length

export const hcuAtomSchema = z.object({
  domainId: z.string().trim().min(1).max(120),
  nameEs: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80).optional(),
  descriptionEs: z.string().trim().min(10).max(500),
  descriptionEn: z.string().trim().min(10).max(500).optional(),
  influenceX: z.number().finite().min(0).max(100),
  riskY: z.number().finite().min(0).max(100),
  evidenceZ: z.number().finite().min(0).max(100),
})

export const hcuHyperedgeSchema = z.object({
  sourceAtomIds: z.array(z.string().trim().min(1).max(120)).min(1).max(32).refine(uniqueAtomIds),
  targetAtomIds: z.array(z.string().trim().min(1).max(120)).min(1).max(32).refine(uniqueAtomIds),
  sourceTitle: z.string().trim().min(2).max(160),
  sourceUrl: safeHttpUrl.optional().nullable(),
  weight: z.number().finite().min(0.05).max(1),
  sign: z.union([z.literal(1), z.literal(-1)]),
  delayYears: z.number().int().min(1).max(15),
  tqafLevel: z.enum(["N1", "N2", "N3"]).nullable().optional(),
  evidenceStatus: z.enum(["hypothesis", "declared", "external"]).default("hypothesis"),
})

export const tqafAssessmentSchema = z.object({
  criterionCode: z.enum(["TQAF-01", "TQAF-02", "TQAF-03", "TQAF-04", "TQAF-05", "TQAF-06", "TQAF-07", "TQAF-08", "TQAF-09", "TQAF-10"]),
  status: z.enum(["verified", "declared", "partial", "pending", "external"]),
  rationale: z.string().trim().max(1200).optional(),
  evidenceUrl: safeHttpUrl.optional().nullable(),
})

export type ProposalInput = z.infer<typeof proposalSchema>
export type InterestInput = z.infer<typeof interestSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type EvidenceInput = z.infer<typeof evidenceSchema>
export type SimulationInput = z.infer<typeof simulationSchema>
