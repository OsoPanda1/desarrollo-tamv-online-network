-- Query-path indexes for public catalog and HCU graph reads.
-- Additive only; no data rows or existing constraints are changed.

CREATE INDEX IF NOT EXISTS research_topics_public_listing_idx
  ON research_topics (user_id, status, area, title_es);

CREATE INDEX IF NOT EXISTS research_projects_public_listing_idx
  ON research_projects (visibility, category, title_es);

CREATE INDEX IF NOT EXISTS research_proposals_public_catalog_idx
  ON research_proposals (status, visibility, share_consent, "published_at" DESC);

CREATE INDEX IF NOT EXISTS researcher_profiles_public_listing_idx
  ON researcher_profiles (is_public, public_name);

CREATE INDEX IF NOT EXISTS hcu_domains_public_listing_idx
  ON hcu_domains (user_id, visibility, sort_order);

CREATE INDEX IF NOT EXISTS hcu_atoms_public_domain_listing_idx
  ON hcu_atoms (user_id, visibility, domain_id, name_es);

CREATE INDEX IF NOT EXISTS hcu_hyperedges_public_listing_idx
  ON hcu_hyperedges (user_id, visibility, is_active, created_at);

CREATE INDEX IF NOT EXISTS hcu_shocks_atom_year_idx
  ON hcu_shocks (atom_id, year, user_id);

CREATE INDEX IF NOT EXISTS research_proposals_topic_created_idx
  ON research_proposals (topic_id, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS collaboration_interests_topic_created_idx
  ON collaboration_interests (topic_id, created_at DESC);
