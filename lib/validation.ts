import { z } from "zod"

const safeHttpUrl = z.string().trim().url().max(2048).refine((value) => {
  try {
    const protocol = new URL(value).protocol
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}, "Usa una URL HTTP o HTTPS válida.")

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

export type ProposalInput = z.infer<typeof proposalSchema>
export type InterestInput = z.infer<typeof interestSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type EvidenceInput = z.infer<typeof evidenceSchema>
export type SimulationInput = z.infer<typeof simulationSchema>
