import "server-only"

import { db } from "@/lib/db"
import {
  collaborationInterests,
  hcuAtoms,
  hcuDomains,
  hcuHyperedges,
  hcuRuns,
  proposalAppeals,
  proposalEvidence,
  proposalEvents,
  proposalReviews,
  researchProjects,
  researchProposals,
  researchTopics,
  researcherProfiles,
  tqafAssessments,
} from "@/lib/db/schema"
import { and, count, desc, eq, inArray } from "drizzle-orm"

export async function getPublicResearchTopics() {
  return db
    .select()
    .from(researchTopics)
    .where(and(eq(researchTopics.userId, "system"), eq(researchTopics.status, "open")))
    .orderBy(researchTopics.area, researchTopics.titleEs)
}

export async function getPublicResearchTopicsIncludingClosed() {
  return db
    .select()
    .from(researchTopics)
    .where(eq(researchTopics.userId, "system"))
    .orderBy(researchTopics.area, researchTopics.titleEs)
}

export async function getPublicResearchTopic(slug: string) {
  const [topic] = await db
    .select()
    .from(researchTopics)
    .where(and(eq(researchTopics.userId, "system"), eq(researchTopics.slug, slug)))
    .limit(1)
  return topic ?? null
}

export async function getPublicProjects() {
  return db
    .select()
    .from(researchProjects)
    .where(eq(researchProjects.visibility, "public"))
    .orderBy(researchProjects.category, researchProjects.titleEs)
}

export async function getPublicProject(slug: string) {
  const [project] = await db
    .select()
    .from(researchProjects)
    .where(and(eq(researchProjects.visibility, "public"), eq(researchProjects.slug, slug)))
    .limit(1)
  return project ?? null
}

export async function getPublicHcuGraph() {
  const domains = await db
    .select()
    .from(hcuDomains)
    .where(and(eq(hcuDomains.userId, "system"), eq(hcuDomains.visibility, "public")))
    .orderBy(hcuDomains.sortOrder)
  const domainIds = domains.map((domain) => domain.id)
  const atoms = domainIds.length
    ? await db
        .select()
        .from(hcuAtoms)
        .where(and(eq(hcuAtoms.userId, "system"), eq(hcuAtoms.visibility, "public"), inArray(hcuAtoms.domainId, domainIds)))
        .orderBy(hcuAtoms.nameEs)
    : []
  const edges = await db
    .select()
    .from(hcuHyperedges)
    .where(and(eq(hcuHyperedges.userId, "system"), eq(hcuHyperedges.visibility, "public"), eq(hcuHyperedges.isActive, true)))
    .orderBy(hcuHyperedges.createdAt)
  const atomIds = new Set(atoms.map((atom) => atom.id))
  return {
    domains,
    atoms,
    edges: edges.filter(
      (edge) =>
        edge.sourceAtomIds.length > 0 &&
        edge.targetAtomIds.length > 0 &&
        edge.sourceAtomIds.length <= 32 &&
        edge.targetAtomIds.length <= 32 &&
        edge.sourceAtomIds.every((id) => atomIds.has(id)) &&
        edge.targetAtomIds.every((id) => atomIds.has(id)),
    ),
  }
}

export async function getUserHcuModel(userId: string) {
  const [atoms, edges, publicGraph] = await Promise.all([
    db.select().from(hcuAtoms).where(and(eq(hcuAtoms.userId, userId), eq(hcuAtoms.visibility, "private"))).orderBy(hcuAtoms.createdAt),
    db.select().from(hcuHyperedges).where(and(eq(hcuHyperedges.userId, userId), eq(hcuHyperedges.visibility, "private"), eq(hcuHyperedges.isActive, true))).orderBy(hcuHyperedges.createdAt),
    getPublicHcuGraph(),
  ])
  const atomIds = new Set([...publicGraph.atoms, ...atoms].map((atom) => atom.id))
  return {
    atoms,
    edges: edges.filter((edge) =>
      edge.sourceAtomIds.length > 0 && edge.targetAtomIds.length > 0 &&
      edge.sourceAtomIds.length <= 32 && edge.targetAtomIds.length <= 32 &&
      edge.sourceAtomIds.every((id) => atomIds.has(id)) &&
      edge.targetAtomIds.every((id) => atomIds.has(id)),
    ),
  }
}

export async function getUserHcuGraph(userId: string) {
  const [publicGraph, privateModel] = await Promise.all([getPublicHcuGraph(), getUserHcuModel(userId)])
  const atoms = [...publicGraph.atoms, ...privateModel.atoms]
  const atomIds = new Set(atoms.map((atom) => atom.id))
  const edges = [...publicGraph.edges, ...privateModel.edges].filter((edge) =>
    edge.sourceAtomIds.length > 0 && edge.targetAtomIds.length > 0 &&
    edge.sourceAtomIds.length <= 32 && edge.targetAtomIds.length <= 32 &&
    edge.sourceAtomIds.every((id) => atomIds.has(id)) &&
    edge.targetAtomIds.every((id) => atomIds.has(id)),
  )
  return { domains: publicGraph.domains, atoms, edges }
}

export async function getPublicResearchers() {
  return db
    .select({
      id: researcherProfiles.id,
      publicName: researcherProfiles.publicName,
      roleCode: researcherProfiles.roleCode,
      tri: researcherProfiles.tri,
      orcid: researcherProfiles.orcid,
      isni: researcherProfiles.isni,
      affiliation: researcherProfiles.affiliation,
      researchLines: researcherProfiles.researchLines,
      verificationStatus: researcherProfiles.verificationStatus,
    })
    .from(researcherProfiles)
    .where(eq(researcherProfiles.isPublic, true))
    .orderBy(researcherProfiles.publicName)
}

export async function getPublishedProposals() {
  return db
    .select({
      id: researchProposals.id,
      title: researchProposals.title,
      abstract: researchProposals.abstract,
      proposalType: researchProposals.proposalType,
      topicId: researchProposals.topicId,
      license: researchProposals.license,
      sourceUrl: researchProposals.sourceUrl,
      publishedAt: researchProposals.publishedAt,
    })
    .from(researchProposals)
    .where(
      and(
        eq(researchProposals.status, "published"),
        eq(researchProposals.visibility, "public"),
        eq(researchProposals.shareConsent, true),
      ),
    )
    .orderBy(desc(researchProposals.publishedAt))
}

export async function getUserResearchProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(researcherProfiles)
    .where(eq(researcherProfiles.userId, userId))
    .limit(1)
  return profile ?? null
}

export async function getUserProposals(userId: string) {
  return db
    .select()
    .from(researchProposals)
    .where(eq(researchProposals.userId, userId))
    .orderBy(desc(researchProposals.createdAt))
}

export async function getUserProposal(userId: string, proposalId: string) {
  const [proposal] = await db
    .select()
    .from(researchProposals)
    .where(and(eq(researchProposals.id, proposalId), eq(researchProposals.userId, userId)))
    .limit(1)
  if (!proposal) return null

  const [events, evidence, reviews, appeals, tqaf] = await Promise.all([
    db
      .select({ id: proposalEvents.id, action: proposalEvents.action, fromStatus: proposalEvents.fromStatus, toStatus: proposalEvents.toStatus, detail: proposalEvents.detail, createdAt: proposalEvents.createdAt, eventHash: proposalEvents.eventHash, previousHash: proposalEvents.previousHash })
      .from(proposalEvents)
      .where(eq(proposalEvents.proposalId, proposalId))
      .orderBy(proposalEvents.createdAt),
    db
      .select({ id: proposalEvidence.id, label: proposalEvidence.label, kind: proposalEvidence.kind, url: proposalEvidence.url, description: proposalEvidence.description, license: proposalEvidence.license, version: proposalEvidence.version, verificationStatus: proposalEvidence.verificationStatus, createdAt: proposalEvidence.createdAt })
      .from(proposalEvidence)
      .where(and(eq(proposalEvidence.proposalId, proposalId), eq(proposalEvidence.userId, userId)))
      .orderBy(desc(proposalEvidence.createdAt)),
    db
      .select({ id: proposalReviews.id, outcome: proposalReviews.outcome, feedback: proposalReviews.feedback, conflictOfInterest: proposalReviews.conflictOfInterest, createdAt: proposalReviews.createdAt })
      .from(proposalReviews)
      .where(eq(proposalReviews.proposalId, proposalId))
      .orderBy(desc(proposalReviews.createdAt)),
    db
      .select({ id: proposalAppeals.id, reason: proposalAppeals.reason, status: proposalAppeals.status, resolutionNote: proposalAppeals.resolutionNote, createdAt: proposalAppeals.createdAt, resolvedAt: proposalAppeals.resolvedAt })
      .from(proposalAppeals)
      .where(and(eq(proposalAppeals.proposalId, proposalId), eq(proposalAppeals.userId, userId)))
      .orderBy(desc(proposalAppeals.createdAt)),
    getTqafAssessmentsForProposal(proposalId, userId),
  ])
  return { proposal, events, evidence, reviews, appeals, tqaf }
}

export async function getTqafAssessmentsForProposal(proposalId: string, ownerId: string) {
  const records = await db
    .select({ criterionCode: tqafAssessments.criterionCode, status: tqafAssessments.status, rationale: tqafAssessments.rationale, evidenceUrl: tqafAssessments.evidenceUrl, reviewerId: tqafAssessments.reviewerId, updatedAt: tqafAssessments.updatedAt })
    .from(tqafAssessments)
    .where(and(eq(tqafAssessments.proposalId, proposalId), eq(tqafAssessments.userId, ownerId)))
    .orderBy(tqafAssessments.criterionCode)
  return records.map(({ reviewerId, ...record }) => ({ ...record, isReviewed: Boolean(reviewerId) }))
}

export async function getUserInterests(userId: string) {
  return db
    .select()
    .from(collaborationInterests)
    .where(eq(collaborationInterests.userId, userId))
    .orderBy(desc(collaborationInterests.createdAt))
}

export async function getUserHcuRuns(userId: string) {
  return db
    .select({ id: hcuRuns.id, scenario: hcuRuns.scenario, seed: hcuRuns.seed, startYear: hcuRuns.startYear, endYear: hcuRuns.endYear, inputHash: hcuRuns.inputHash, outputHash: hcuRuns.outputHash, modelVersion: hcuRuns.modelVersion, createdAt: hcuRuns.createdAt })
    .from(hcuRuns)
    .where(eq(hcuRuns.userId, userId))
    .orderBy(desc(hcuRuns.createdAt))
}

export async function getUserHcuRun(userId: string, runId: string) {
  const [run] = await db
    .select()
    .from(hcuRuns)
    .where(and(eq(hcuRuns.id, runId), eq(hcuRuns.userId, userId)))
    .limit(1)
  return run ?? null
}

export async function getPortalCounts(userId: string) {
  const [proposalCount] = await db
    .select({ value: count() })
    .from(researchProposals)
    .where(eq(researchProposals.userId, userId))
  const [interestCount] = await db
    .select({ value: count() })
    .from(collaborationInterests)
    .where(eq(collaborationInterests.userId, userId))
  const [runCount] = await db
    .select({ value: count() })
    .from(hcuRuns)
    .where(eq(hcuRuns.userId, userId))
  return {
    proposals: proposalCount?.value ?? 0,
    interests: interestCount?.value ?? 0,
    runs: runCount?.value ?? 0,
  }
}
