import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createMigrationPlan, loadMigrationFiles } from "./db-migration-contract.mjs";

const { Pool } = pg;
const root = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(root, "..", "migrations");
const databaseUrl = process.env.DATABASE_URL;
const args = process.argv.slice(2);
const apply = args.includes("--apply");
let expectedDigest;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--apply") continue;
  if (arg === "--plan-digest") {
    expectedDigest = args[index + 1];
    index += 1;
    continue;
  }
  if (arg.startsWith("--plan-digest=")) {
    expectedDigest = arg.slice("--plan-digest=".length);
    continue;
  }
  console.error("Unknown argument: " + arg);
  process.exit(2);
}

if (apply && !/^[a-f0-9]{64}$/.test(expectedDigest ?? "")) {
  console.error("Migration blocked: --apply requires the exact 64-character digest printed by a fresh plan.");
  console.error("Run pnpm db:migrate first. No migration was applied.");
  process.exit(2);
}
if (!apply && expectedDigest) {
  console.error("--plan-digest is only accepted together with --apply.");
  process.exit(2);
}
if (!databaseUrl) {
  console.error("DATABASE_URL is required. No connection or migration was attempted.");
  process.exit(1);
}

async function main() {
  const migrations = await loadMigrationFiles(migrationsDirectory);
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
    application_name: apply ? "tamv-db-migrate" : "tamv-db-migration-plan",
  });
  let client;
  let lockAcquired = false;
  let exitCode = 0;

  try {
    client = await pool.connect();

    if (apply) {
      const lock = await client.query("SELECT pg_try_advisory_lock(20261120, 1) AS acquired");
      lockAcquired = lock.rows[0]?.acquired === true;
      if (!lockAcquired) {
        throw new Error("Another migration runner holds the advisory lock. Retry after it finishes.");
      }
    } else {
      // Planning is a read-only operation; it must never create the tracker table.
      await client.query("SET default_transaction_read_only = on");
    }

    await client.query("SET search_path TO public");
    await client.query("SET statement_timeout = '30000ms'");
    await client.query("SET lock_timeout = '10000ms'");

    const identityResult = await client.query(
      "SELECT current_database() AS database_name, current_user AS role_name, " +
      "current_schema() AS schema_name, inet_server_addr()::text AS server_address, " +
      "inet_server_port() AS server_port"
    );
    const identityRow = identityResult.rows[0];
    const databaseIdentity = {
      database: identityRow.database_name,
      role: identityRow.role_name,
      schema: identityRow.schema_name,
      serverAddress: identityRow.server_address ?? "local",
      serverPort: identityRow.server_port == null ? null : Number(identityRow.server_port),
    };
    if (databaseIdentity.schema !== "public") {
      throw new Error("Database target is not resolving the explicit public schema; refusing to continue.");
    }

    const trackerState = await client.query(
      "SELECT to_regclass('public.tamv_schema_migrations') IS NOT NULL AS exists"
    );
    const trackingTableExists = trackerState.rows[0]?.exists === true;
    const appliedRows = trackingTableExists
      ? (await client.query("SELECT name, sha256 FROM public.tamv_schema_migrations ORDER BY name")).rows
      : [];

    const plan = createMigrationPlan({
      migrations,
      appliedRows,
      trackingTableExists,
      databaseIdentity,
    });

    console.log("Target: database=" + databaseIdentity.database +
      " role=" + databaseIdentity.role + " schema=public");
    console.log("Migration tracker: " + (trackingTableExists ? "present" : "absent"));
    console.log("Migrations: " + plan.alreadyApplied.length +
      " already applied; " + plan.pending.length + " pending");
    for (const migration of plan.migrations) {
      console.log((migration.applied ? "APPLIED " : "PENDING ") + migration.name +
        " sha256=" + migration.sha256);
    }
    console.log("Plan digest: " + plan.digest);

    if (!apply) {
      console.log("PLAN ONLY: no schema or application data was changed.");
      return;
    }

    if (expectedDigest !== plan.digest) {
      throw new Error("The supplied plan digest does not match the current database target, migration files, or applied state. Re-plan and review before applying.");
    }

    if (!trackingTableExists) {
      const existingApplicationSchema = await client.query(
        "SELECT to_regclass('public.' || chr(34) || 'user' || chr(34)) IS NOT NULL AS exists"
      );
      if (existingApplicationSchema.rows[0]?.exists === true) {
        throw new Error("Application tables exist but public.tamv_schema_migrations is absent. Refusing to replay historical migrations; perform an approved baseline reconciliation first.");
      }
    }

    // Strict read-only consistency checks must pass before the first schema write.
    const preflight = spawnSync(process.execPath, [path.join(root, "db-preflight.mjs"), "--strict"], {
      env: process.env,
      stdio: "inherit",
      timeout: 120_000,
    });
    if (preflight.error || preflight.status !== 0) {
      throw new Error("Migration blocked: strict database preflight did not pass. No migration was applied.");
    }

    if (!trackingTableExists) {
      await client.query(
        "CREATE TABLE public.tamv_schema_migrations (" +
        "name text PRIMARY KEY, " +
        "sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'), " +
        "applied_at timestamptz NOT NULL DEFAULT now())"
      );
    }

    if (plan.pending.length === 0) {
      console.log("No pending migrations. Database schema was not changed.");
      return;
    }

    for (const migration of plan.pending) {
      console.log("Applying: " + migration.name);
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          "INSERT INTO public.tamv_schema_migrations (name, sha256) VALUES ($1, $2)",
          [migration.name, migration.sha256]
        );
        await client.query("COMMIT");
        console.log("Applied: " + migration.name);
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Preserve the migration error if rollback itself fails.
        }
        throw new Error(
          "Migration " + migration.name + " failed and its transaction was rolled back: " +
          (error instanceof Error ? error.message : "unknown SQL error")
        );
      }
    }

    const verification = await client.query(
      "SELECT name, sha256 FROM public.tamv_schema_migrations ORDER BY name"
    );
    const verifiedPlan = createMigrationPlan({
      migrations,
      appliedRows: verification.rows,
      trackingTableExists: true,
      databaseIdentity,
    });
    if (verifiedPlan.pending.length > 0) {
      throw new Error("Post-apply verification found migrations still pending.");
    }
    console.log("Migration verification passed for " + verifiedPlan.alreadyApplied.length + " migration(s).");
  } catch (error) {
    exitCode = 1;
    console.error("Database migration operation failed. Review the reported state before retrying.");
    console.error(error instanceof Error ? error.message : "Unknown database error");
  } finally {
    if (client && lockAcquired) {
      try {
        await client.query("SELECT pg_advisory_unlock(20261120, 1)");
      } catch {
        // Closing the connection also releases the advisory lock.
      }
    }
    client?.release();
    await pool.end();
  }

  if (exitCode !== 0) process.exitCode = exitCode;
}

main().catch((error) => {
  console.error("Database migration operation failed before planning could complete.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
