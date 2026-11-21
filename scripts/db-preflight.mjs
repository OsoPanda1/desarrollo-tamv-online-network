import pg from "pg"

const { Pool } = pg
const databaseUrl = process.env.DATABASE_URL
const strict = process.argv.includes("--strict")

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Preflight did not connect or change data.")
  process.exit(1)
}

const required = {
  user: ["id"],
  research_proposals: ["id", "user_id", "createdAt", "status", "visibility", "share_consent"],
  proposal_events: ["id", "user_id", "proposal_id", "created_at"],
  proposal_evidence: ["id", "user_id", "proposal_id", "version"],
  proposal_reviews: ["id", "user_id", "proposal_id", "createdAt"],
  proposal_appeals: ["id", "user_id", "proposal_id", "status"],
  hcu_runs: ["id", "user_id", "created_at"],
  collaboration_interests: ["id", "user_id", "created_at"],
  researcher_profiles: ["id", "user_id"],
  research_topics: ["id", "user_id", "status", "area"],
  research_projects: ["id", "user_id", "slug", "visibility", "verification_status"],
  hcu_domains: ["id", "user_id", "visibility"],
  hcu_atoms: ["id", "user_id", "domain_id", "visibility", "is_quarantined"],
  hcu_hyperedges: ["id", "user_id", "source_atom_ids", "target_atom_ids", "visibility", "is_active"],
  hcu_shocks: ["id", "user_id", "atom_id", "year", "intensity"],
}

const checks = [
  ["orphan research proposals", `SELECT count(*)::int AS n FROM research_proposals p LEFT JOIN "user" u ON u.id = p.user_id WHERE u.id IS NULL`],
  ["orphan proposal events (proposal)", `SELECT count(*)::int AS n FROM proposal_events e LEFT JOIN research_proposals p ON p.id = e.proposal_id WHERE p.id IS NULL`],
  ["orphan proposal events (actor)", `SELECT count(*)::int AS n FROM proposal_events e LEFT JOIN "user" u ON u.id = e.user_id WHERE u.id IS NULL`],
  ["orphan proposal evidence (proposal)", `SELECT count(*)::int AS n FROM proposal_evidence e LEFT JOIN research_proposals p ON p.id = e.proposal_id WHERE p.id IS NULL`],
  ["orphan proposal evidence (owner)", `SELECT count(*)::int AS n FROM proposal_evidence e LEFT JOIN "user" u ON u.id = e.user_id WHERE u.id IS NULL`],
  ["orphan proposal reviews (proposal)", `SELECT count(*)::int AS n FROM proposal_reviews r LEFT JOIN research_proposals p ON p.id = r.proposal_id WHERE p.id IS NULL`],
  ["orphan proposal reviews (reviewer)", `SELECT count(*)::int AS n FROM proposal_reviews r LEFT JOIN "user" u ON u.id = r.user_id WHERE u.id IS NULL`],
  ["orphan proposal appeals (proposal)", `SELECT count(*)::int AS n FROM proposal_appeals a LEFT JOIN research_proposals p ON p.id = a.proposal_id WHERE p.id IS NULL`],
  ["orphan proposal appeals (owner)", `SELECT count(*)::int AS n FROM proposal_appeals a LEFT JOIN "user" u ON u.id = a.user_id WHERE u.id IS NULL`],
  ["orphan collaboration interests (owner)", `SELECT count(*)::int AS n FROM collaboration_interests i LEFT JOIN "user" u ON u.id = i.user_id WHERE u.id IS NULL`],
  ["orphan HCU runs (owner)", `SELECT count(*)::int AS n FROM hcu_runs r LEFT JOIN "user" u ON u.id = r.user_id WHERE u.id IS NULL`],
  ["orphan researcher profiles (owner)", `SELECT count(*)::int AS n FROM researcher_profiles r LEFT JOIN "user" u ON u.id = r.user_id WHERE u.id IS NULL`],
  ["orphan proposals (topic)", `SELECT count(*)::int AS n FROM research_proposals p LEFT JOIN research_topics t ON t.id = p.topic_id WHERE p.topic_id IS NOT NULL AND t.id IS NULL`],
  ["orphan collaboration interests (topic)", `SELECT count(*)::int AS n FROM collaboration_interests i LEFT JOIN research_topics t ON t.id = i.topic_id WHERE i.topic_id IS NOT NULL AND t.id IS NULL`],
  ["orphan HCU atoms (domain)", `SELECT count(*)::int AS n FROM hcu_atoms a LEFT JOIN hcu_domains d ON d.id = a.domain_id WHERE d.id IS NULL`],
  ["orphan HCU shocks (atom)", `SELECT count(*)::int AS n FROM hcu_shocks s LEFT JOIN hcu_atoms a ON a.id = s.atom_id WHERE a.id IS NULL`],
  ["orphan HCU hyperedge source atoms", `SELECT count(*)::int AS n FROM hcu_hyperedges h CROSS JOIN LATERAL unnest(h.source_atom_ids) AS src(atom_id) LEFT JOIN hcu_atoms a ON a.id = src.atom_id WHERE a.id IS NULL`],
  ["orphan HCU hyperedge target atoms", `SELECT count(*)::int AS n FROM hcu_hyperedges h CROSS JOIN LATERAL unnest(h.target_atom_ids) AS tgt(atom_id) LEFT JOIN hcu_atoms a ON a.id = tgt.atom_id WHERE a.id IS NULL`],
  ["duplicate researcher profiles per owner", `SELECT count(*)::int AS n FROM (SELECT user_id FROM researcher_profiles GROUP BY user_id HAVING count(*) > 1) d`],
  ["duplicate evidence version per proposal and owner", `SELECT count(*)::int AS n FROM (SELECT proposal_id, user_id, version FROM proposal_evidence GROUP BY proposal_id, user_id, version HAVING count(*) > 1) d`],
  ["multiple active appeals per proposal", `SELECT count(*)::int AS n FROM (SELECT proposal_id FROM proposal_appeals WHERE status IN ('received', 'under_review') GROUP BY proposal_id HAVING count(*) > 1) d`],
  ["orphan HCU domains (owner)", `SELECT count(*)::int AS n FROM hcu_domains d LEFT JOIN "user" u ON u.id = d.user_id WHERE d.user_id <> 'system' AND u.id IS NULL`],
  ["orphan HCU atoms (owner)", `SELECT count(*)::int AS n FROM hcu_atoms a LEFT JOIN "user" u ON u.id = a.user_id WHERE a.user_id <> 'system' AND u.id IS NULL`],
  ["orphan HCU hyperedges (owner)", `SELECT count(*)::int AS n FROM hcu_hyperedges h LEFT JOIN "user" u ON u.id = h.user_id WHERE h.user_id <> 'system' AND u.id IS NULL`],
  ["orphan HCU shocks (owner)", `SELECT count(*)::int AS n FROM hcu_shocks s LEFT JOIN "user" u ON u.id = s.user_id WHERE u.id IS NULL`],
  ["orphan research projects (owner)", `SELECT count(*)::int AS n FROM research_projects p LEFT JOIN "user" u ON u.id = p.user_id WHERE p.user_id <> 'system' AND u.id IS NULL`],
  ["orphan research topics (owner)", `SELECT count(*)::int AS n FROM research_topics t LEFT JOIN "user" u ON u.id = t.user_id WHERE t.user_id <> 'system' AND u.id IS NULL`],
  ["invalid proposal status", `SELECT count(*)::int AS n FROM research_proposals WHERE status NOT IN ('received','triage','in_review','changes_requested','accepted','rejected','appealed','published','withdrawn')`],
  ["invalid proposal visibility", `SELECT count(*)::int AS n FROM research_proposals WHERE visibility NOT IN ('private','public')`],
  ["published proposals without consent", `SELECT count(*)::int AS n FROM research_proposals WHERE status = 'published' AND (visibility <> 'public' OR share_consent = false)`],
  ["invalid HCU atom coordinates", `SELECT count(*)::int AS n FROM hcu_atoms WHERE influence_x NOT BETWEEN -1 AND 1 OR risk_y NOT BETWEEN -1 AND 1 OR evidence_z NOT BETWEEN 0 AND 1`],
  ["invalid HCU simulation horizons", `SELECT count(*)::int AS n FROM hcu_runs WHERE start_year > end_year OR end_year - start_year > 24 OR seed < 0`],
]

const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 5_000 })
let failed = false
let warnings = 0

try {
  const client = await pool.connect()
  try {
    const schema = await client.query(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema()",
    )
    const columns = new Map()
    for (const row of schema.rows) {
      if (!columns.has(row.table_name)) columns.set(row.table_name, new Set())
      columns.get(row.table_name).add(row.column_name)
    }

    for (const [table, expectedColumns] of Object.entries(required)) {
      const actual = columns.get(table)
      const missing = expectedColumns.filter((column) => !actual?.has(column))
      if (missing.length) {
        console.error(`FAIL schema ${table}: missing table/columns: ${missing.join(", ")}`)
        failed = true
      } else {
        console.log(`PASS schema ${table}`)
      }
    }

    if (!failed) {
      for (const [label, query] of checks) {
        const result = await client.query(query)
        const count = Number(result.rows[0]?.n ?? 0)
        if (count > 0) {
          console.warn(`WARN ${label}: ${count} finding(s)`)
          warnings += 1
        } else {
          console.log(`PASS ${label}`)
        }
      }
    }
  } finally {
    client.release()
  }
} catch (error) {
  console.error("Database preflight failed. No data was changed.")
  console.error(error instanceof Error ? error.message : "Unknown database error")
  process.exitCode = 1
} finally {
  await pool.end()
}

if (!process.exitCode && (failed || (strict && warnings > 0))) {
  process.exitCode = 1
  console.error(strict && warnings > 0 ? "Strict preflight failed; review data findings before adding constraints." : "Schema preflight failed.")
}
