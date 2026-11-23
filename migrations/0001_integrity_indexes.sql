-- Non-destructive query indexes only. No existing records are deleted or rewritten.
-- Column names intentionally match the Drizzle schema identifiers exactly.

CREATE INDEX IF NOT EXISTS research_proposals_owner_created_idx
  ON research_proposals (user_id, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS proposal_events_proposal_created_idx
  ON proposal_events (proposal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS proposal_evidence_proposal_user_version_idx
  ON proposal_evidence (proposal_id, user_id, version DESC);

CREATE INDEX IF NOT EXISTS proposal_reviews_proposal_created_idx
  ON proposal_reviews (proposal_id, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS proposal_appeals_proposal_user_status_idx
  ON proposal_appeals (proposal_id, user_id, status);

CREATE INDEX IF NOT EXISTS hcu_runs_owner_created_idx
  ON hcu_runs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS collaboration_interests_owner_created_idx
  ON collaboration_interests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS researcher_profiles_owner_idx
  ON researcher_profiles (user_id);

CREATE INDEX IF NOT EXISTS research_topics_system_status_area_idx
  ON research_topics (user_id, status, area);
