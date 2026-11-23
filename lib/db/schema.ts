import { sql } from "drizzle-orm"
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" })

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("member"),
  createdAt: timestamptz("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamptz("expiresAt").notNull(),
  token: text("token").notNull(),
  createdAt: timestamptz("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamptz("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamptz("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamptz("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamptz("expiresAt").notNull(),
  createdAt: timestamptz("createdAt").defaultNow(),
  updatedAt: timestamptz("updatedAt").defaultNow(),
})

export const researchTopics = pgTable("research_topics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  area: text("area").notNull(),
  titleEs: text("title_es").notNull(),
  titleEn: text("title_en").notNull(),
  questionEs: text("question_es").notNull(),
  questionEn: text("question_en").notNull(),
  contributorsEs: text("contributors_es").notNull(),
  contributorsEn: text("contributors_en").notNull(),
  formatEs: text("format_es").notNull(),
  formatEn: text("format_en").notNull(),
  modes: text("modes").array().notNull().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("open"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})

export const researchProjects = pgTable("research_projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("system"),
  slug: text("slug").notNull(),
  category: text("category").notNull(),
  titleEs: text("title_es").notNull(),
  titleEn: text("title_en").notNull(),
  subtitleEs: text("subtitle_es").notNull(),
  subtitleEn: text("subtitle_en").notNull(),
  descriptionEs: text("description_es").notNull(),
  descriptionEn: text("description_en").notNull(),
  maturity: text("maturity").notNull(),
  limitsEs: text("limits_es").notNull(),
  limitsEn: text("limits_en").notNull(),
  sourceUrl: text("source_url"),
  sourceCommit: text("source_commit"),
  license: text("license"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  visibility: text("visibility").notNull().default("public"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})

export const researcherProfiles = pgTable("researcher_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  publicName: text("public_name").notNull(),
  roleCode: text("role_code"),
  tri: text("tri"),
  orcid: text("orcid"),
  isni: text("isni"),
  affiliation: text("affiliation"),
  researchLines: text("research_lines").array().notNull().default(sql`ARRAY[]::text[]`),
  isPublic: boolean("is_public").notNull().default(false),
  verificationStatus: text("verification_status").notNull().default("declared"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})

export const researchProposals = pgTable("research_proposals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topicId: text("topic_id"),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  proposalType: text("proposal_type").notNull().default("article"),
  status: text("status").notNull().default("received"),
  visibility: text("visibility").notNull().default("private"),
  shareConsent: boolean("share_consent").notNull().default(false),
  license: text("license"),
  sourceUrl: text("source_url"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  publishedAt: timestamptz("published_at"),
})

export const proposalEvents = pgTable("proposal_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  proposalId: text("proposal_id").notNull(),
  action: text("action").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  detail: text("detail"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  previousHash: text("previous_hash"),
  eventHash: text("event_hash"),
  canonicalPayload: jsonb("canonical_payload").notNull().default({}),
})

export const proposalEvidence = pgTable("proposal_evidence", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  proposalId: text("proposal_id").notNull(),
  label: text("label").notNull(),
  kind: text("kind").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  sha256: text("sha256"),
  version: integer("version").notNull().default(1),
  license: text("license"),
  visibility: text("visibility").notNull().default("private"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const proposalReviews = pgTable("proposal_reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  proposalId: text("proposal_id").notNull(),
  outcome: text("outcome").notNull(),
  feedback: text("feedback").notNull(),
  conflictOfInterest: boolean("conflict_of_interest").notNull().default(false),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const proposalAppeals = pgTable("proposal_appeals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  proposalId: text("proposal_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("received"),
  resolutionNote: text("resolution_note"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  resolvedAt: timestamptz("resolved_at"),
})

export const collaborationInterests = pgTable("collaboration_interests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topicId: text("topic_id"),
  interestType: text("interest_type").notNull(),
  message: text("message").notNull(),
  consentToShare: boolean("consent_to_share").notNull().default(false),
  status: text("status").notNull().default("received"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const researchIdentitySequences = pgTable("research_identity_sequences", {
  year: integer("year").primaryKey(),
  nextNumber: integer("next_number").notNull().default(1),
})

export const adminBootstrapState = pgTable("admin_bootstrap_state", {
  id: integer("id").primaryKey(),
  claimedAt: timestamptz("claimed_at"),
  claimedBy: text("claimed_by"),
})

export const hcuDomains = pgTable("hcu_domains", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("system"),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionEs: text("description_es").notNull(),
  descriptionEn: text("description_en").notNull(),
  sortOrder: integer("sort_order").notNull(),
  visibility: text("visibility").notNull().default("public"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const hcuAtoms = pgTable("hcu_atoms", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("system"),
  domainId: text("domain_id").notNull(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionEs: text("description_es").notNull(),
  descriptionEn: text("description_en").notNull(),
  influenceX: real("influence_x").notNull(),
  riskY: real("risk_y").notNull(),
  evidenceZ: real("evidence_z").notNull(),
  tri: text("tri"),
  roleCode: text("role_code"),
  isProvisional: boolean("is_provisional").notNull().default(true),
  isQuarantined: boolean("is_quarantined").notNull().default(false),
  visibility: text("visibility").notNull().default("private"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})

export const hcuHyperedges = pgTable("hcu_hyperedges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  sourceAtomIds: text("source_atom_ids").array().notNull(),
  targetAtomIds: text("target_atom_ids").array().notNull(),
  weight: real("weight").notNull(),
  sign: smallint("sign").notNull().default(1),
  delayYears: smallint("delay_years").notNull().default(0),
  tqafLevel: text("tqaf_level"),
  evidenceStatus: text("evidence_status").notNull().default("hypothesis"),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  visibility: text("visibility").notNull().default("private"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})

export const hcuRuns = pgTable("hcu_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  scenario: text("scenario").notNull(),
  seed: integer("seed").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year").notNull(),
  inputHash: text("input_hash").notNull(),
  outputHash: text("output_hash").notNull(),
  modelVersion: text("model_version").notNull(),
  output: jsonb("output").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const hcuShocks = pgTable("hcu_shocks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  atomId: text("atom_id").notNull(),
  year: integer("year").notNull(),
  intensity: real("intensity").notNull(),
  note: text("note"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
})

export const tqafAssessments = pgTable("tqaf_assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  proposalId: text("proposal_id").notNull(),
  criterionCode: text("criterion_code").notNull(),
  status: text("status").notNull().default("pending"),
  rationale: text("rationale"),
  evidenceUrl: text("evidence_url"),
  reviewerId: text("reviewer_id"),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
})
