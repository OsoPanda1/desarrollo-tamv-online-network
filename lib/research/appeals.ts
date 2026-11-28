export function canReviewAppeal({
  appealStatus,
  proposalStatus,
  reviewerId,
  rejectingReviewerIds,
}: {
  appealStatus?: string
  proposalStatus: string
  reviewerId: string
  rejectingReviewerIds: string[]
}) {
  if (appealStatus !== "received" && appealStatus !== "under_review") return true
  if (proposalStatus !== "appealed" && proposalStatus !== "in_review") return true
  return rejectingReviewerIds.length > 0 && !rejectingReviewerIds.includes(reviewerId)
}
