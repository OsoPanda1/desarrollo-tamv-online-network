import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const MIGRATION_PATTERN = /^\d{4}_[a-z0-9_-]+\.sql$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function compareNames(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export async function loadMigrationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && MIGRATION_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareNames);

  if (names.length === 0) {
    throw new Error("No migration files found; refusing to build an empty migration plan.");
  }

  const migrations = [];
  for (const name of names) {
    const sql = await readFile(path.join(directory, name), "utf8");
    migrations.push({
      name,
      sql,
      sha256: createHash("sha256").update(sql).digest("hex"),
    });
  }
  return migrations;
}

/**
 * Produces a deterministic plan digest tied to the database identity, migration
 * file hashes, and the exact applied/pending state. The digest is an operational
 * confirmation token, not a digital signature or an authorization credential.
 */
export function createMigrationPlan({
  migrations,
  appliedRows = [],
  trackingTableExists,
  databaseIdentity,
}) {
  if (!Array.isArray(migrations) || migrations.length === 0) {
    throw new Error("Migration plan must contain at least one migration.");
  }
  if (typeof trackingTableExists !== "boolean") {
    throw new Error("Migration tracking-table state is required.");
  }
  if (!databaseIdentity || typeof databaseIdentity !== "object") {
    throw new Error("Database identity is required to bind the plan to its target.");
  }

  const identity = {
    database: String(databaseIdentity.database ?? ""),
    role: String(databaseIdentity.role ?? ""),
    schema: String(databaseIdentity.schema ?? ""),
    serverAddress: String(databaseIdentity.serverAddress ?? "local"),
    serverPort: databaseIdentity.serverPort == null ? null : Number(databaseIdentity.serverPort),
  };
  if (!identity.database || !identity.role || identity.schema !== "public") {
    throw new Error("Migration plans require a database role and the explicit public schema.");
  }
  if (identity.serverPort !== null && (!Number.isInteger(identity.serverPort) || identity.serverPort < 1 || identity.serverPort > 65535)) {
    throw new Error("Database server port in identity is invalid.");
  }

  const ordered = [...migrations].sort((a, b) => compareNames(a.name, b.name));
  const localByName = new Map();
  for (const migration of ordered) {
    if (!migration || typeof migration.name !== "string" || !MIGRATION_PATTERN.test(migration.name)) {
      throw new Error("Invalid migration filename in plan.");
    }
    if (!SHA256_PATTERN.test(migration.sha256 ?? "")) {
      throw new Error(`Invalid SHA-256 for migration: ${migration.name}`);
    }
    if (localByName.has(migration.name)) {
      throw new Error(`Duplicate migration filename: ${migration.name}`);
    }
    localByName.set(migration.name, migration);
  }

  if (!trackingTableExists && appliedRows.length > 0) {
    throw new Error("Applied migration records were returned although the tracking table does not exist.");
  }

  const appliedByName = new Map();
  for (const row of appliedRows) {
    if (!row || typeof row.name !== "string" || !SHA256_PATTERN.test(row.sha256 ?? "")) {
      throw new Error("Malformed record in public.tamv_schema_migrations.");
    }
    if (!localByName.has(row.name)) {
      throw new Error(`Database records a migration missing from this checkout: ${row.name}. Restore the immutable migration file before applying changes.`);
    }
    if (appliedByName.has(row.name)) {
      throw new Error(`Duplicate migration record: ${row.name}`);
    }
    const local = localByName.get(row.name);
    if (local.sha256 !== row.sha256) {
      throw new Error(`Applied migration was modified: ${row.name}. Add a new migration instead.`);
    }
    appliedByName.set(row.name, row.sha256);
  }

  const plannedMigrations = ordered.map(({ name, sha256, sql }) => ({
    name,
    sha256,
    sql,
    applied: appliedByName.has(name),
  }));
  const digestMaterial = {
    version: 1,
    databaseIdentity: identity,
    trackingTableExists,
    migrations: plannedMigrations.map(({ name, sha256, applied }) => ({ name, sha256, applied })),
  };
  const digest = createHash("sha256").update(JSON.stringify(digestMaterial)).digest("hex");

  return {
    digest,
    databaseIdentity: identity,
    trackingTableExists,
    migrations: plannedMigrations,
    pending: plannedMigrations.filter((migration) => !migration.applied),
    alreadyApplied: plannedMigrations.filter((migration) => migration.applied),
  };
}
