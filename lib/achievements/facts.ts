import "server-only"

import { db } from "@/lib/db"
import {
  collaborationInterests,
  hcuAtoms,
  hcuHyperedges,
  hcuRuns,
  memberCourseProgress,
  membershipSubscriptions,
  proposalEvidence,
  proposalReviews,
  researchProposals,
  researcherProfiles,
} from "@/lib/db/schema"
import { COURSE_SLUG } from "@/lib/billing/plans"
import { membershipEntitlementCondition } from "@/lib/billing/entitlement-query"
import { and, count, eq, inArray } from "drizzle-orm"
import type { AchievementFacts } from "./catalog"

async function scalar(query: PromiseLike<{ value: number | string }[]>): Promise<number> {
  const [row] = await query
  return Number(row?.value ?? 0)
}

/**
 * Reads only aggregate counts and flags for the signed-in owner. No other
 * user's records are touched and no personal content leaves the database.
 */
export async function loadAchievementFacts(userId: string): Promise<AchievementFacts> {
  const [
    proposalTotal,
    acceptedTotal,
    publishedTotal,
    evidenceTotal,
    reviewTotal,
    atomTotal,
    hyperedgeTotal,
    runTotal,
    interestTotal,
    courseTotal,
    consentRows,
    profileRows,
    membershipRows,
  ] = await Promise.all([
    scalar(db.select({ value: count() }).from(researchProposals).where(eq(researchProposals.userId, userId))),
    scalar(
      db
        .select({ value: count() })
        .from(researchProposals)
        .where(and(eq(researchProposals.userId, userId), inArray(researchProposals.status, ["accepted", "published"]))),
    ),
    scalar(
      db
        .select({ value: count() })
        .from(researchProposals)
        .where(and(eq(researchProposals.userId, userId), eq(researchProposals.status, "published"))),
    ),
    scalar(db.select({ value: count() }).from(proposalEvidence).where(eq(proposalEvidence.userId, userId))),
    scalar(db.select({ value: count() }).from(proposalReviews).where(eq(proposalReviews.userId, userId))),
    scalar(db.select({ value: count() }).from(hcuAtoms).where(eq(hcuAtoms.userId, userId))),
    scalar(db.select({ value: count() }).from(hcuHyperedges).where(eq(hcuHyperedges.userId, userId))),
    scalar(db.select({ value: count() }).from(hcuRuns).where(eq(hcuRuns.userId, userId))),
    scalar(
      db.select({ value: count() }).from(collaborationInterests).where(eq(collaborationInterests.userId, userId)),
    ),
    scalar(
      db
        .select({ value: count() })
        .from(memberCourseProgress)
        .where(and(eq(memberCourseProgress.userId, userId), eq(memberCourseProgress.courseSlug, COURSE_SLUG))),
    ),
    db
      .select({ shareConsent: researchProposals.shareConsent })
      .from(researchProposals)
      .where(and(eq(researchProposals.userId, userId), eq(researchProposals.shareConsent, true)))
      .limit(1),
    db
      .select({
        orcid: researcherProfiles.orcid,
        isni: researcherProfiles.isni,
        isPublic: researcherProfiles.isPublic,
        publicName: researcherProfiles.publicName,
      })
      .from(researcherProfiles)
      .where(eq(researcherProfiles.userId, userId))
      .limit(1),
    db
      .select({ status: membershipSubscriptions.status })
      .from(membershipSubscriptions)
      .where(membershipEntitlementCondition(userId))
      .limit(1),
  ])

  const profile = profileRows[0]
  const hasOrcid = Boolean(profile?.orcid?.trim())
  const hasIsni = Boolean(profile?.isni?.trim())

  return {
    account: true,
    proposals: proposalTotal,
    accepted: acceptedTotal,
    published: publishedTotal,
    evidence: evidenceTotal,
    reviews: reviewTotal,
    hcuAtoms: atomTotal,
    hcuHyperedges: hyperedgeTotal,
    hcuRuns: runTotal,
    interests: interestTotal,
    hasOrcid,
    hasIsni,
    hasPersistentId: hasOrcid || hasIsni,
    publicProfile: Boolean(profile?.isPublic && profile?.publicName?.trim()),
    membershipActive: membershipRows.length > 0,
    courseModules: courseTotal,
    consentGranted: consentRows.length > 0,
  }
}
