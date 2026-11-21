import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const { Pool } = pg
const root = path.dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = path.join(root, "..", "migrations")
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("DATABASE_URL is required. No migration was applied.")
  process.exit(1)
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 5_000,
})
const client = await pool.connect()
let lockAcquired = false

try {
  await client.query("SELECT pg_advisory_lock(20261120, 1)")
  lockAcquired = true
  await client.query(`
    CREATE TABLE IF NOT EXISTS tamv_schema_migrations (
      name text PRIMARY KEY,
      sha256 text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const names = (await readdir(migrationsDirectory))
    .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
    .sort()

  if (names.length === 0) {
    console.log("No migration files found; no schema changes applied.")
  }

  for (const name of names) {
    const sql = await readFile(path.join(migrationsDirectory, name), "utf8")
    const sha256 = createHash("sha256").update(sql).digest("hex")
    const prior = await client.query(
      "SELECT sha256 FROM tamv_schema_migrations WHERE name = $1",
      [name],
    )

    if (prior.rowCount) {
      if (prior.rows[0].sha256 !== sha256) {
        throw new Error(`Applied migration was modified: ${name}. Add a new migration instead.`)
      }
      console.log(`Already applied: ${name}`)
      continue
    }

    console.log(`Applying: ${name}`)
    await client.query("BEGIN")
    try {
      await client.query(sql)
      await client.query(
        "INSERT INTO tamv_schema_migrations (name, sha256) VALUES ($1, $2)",
        [name, sha256],
      )
      await client.query("COMMIT")
      console.log(`Applied: ${name}`)
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    }
  }
} catch (error) {
  console.error("Database migration failed. Review the migration and database state before retrying.")
  console.error(error instanceof Error ? error.message : "Unknown migration error")
  process.exitCode = 1
} finally {
  if (lockAcquired) {
    try {
      await client.query("SELECT pg_advisory_unlock(20261120, 1)")
    } catch {
      // The connection will be closed below; do not mask the original error.
    }
  }
  client.release()
  await pool.end()
}
