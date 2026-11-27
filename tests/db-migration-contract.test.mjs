import assert from "node:assert/strict";
import test from "node:test";
import { createMigrationPlan } from "../scripts/db-migration-contract.mjs";

const identity = {
  database: "tamv_test",
  role: "tamv_migrator",
  schema: "public",
  serverAddress: "127.0.0.1",
  serverPort: 5432,
};
const migrations = [
  { name: "0002_public_indexes.sql", sha256: "b".repeat(64), sql: "SELECT 2;" },
  { name: "0001_integrity_indexes.sql", sha256: "a".repeat(64), sql: "SELECT 1;" },
];

test("migration plans sort files, mark applied state, and remain deterministic", () => {
  const first = createMigrationPlan({
    migrations,
    appliedRows: [{ name: "0001_integrity_indexes.sql", sha256: "a".repeat(64) }],
    trackingTableExists: true,
    databaseIdentity: identity,
  });
  const second = createMigrationPlan({
    migrations: [...migrations].reverse(),
    appliedRows: [{ name: "0001_integrity_indexes.sql", sha256: "a".repeat(64) }],
    trackingTableExists: true,
    databaseIdentity: identity,
  });

  assert.equal(first.digest, second.digest);
  assert.match(first.digest, /^[a-f0-9]{64}$/);
  assert.deepEqual(first.migrations.map(({ name, applied }) => [name, applied]), [
    ["0001_integrity_indexes.sql", true],
    ["0002_public_indexes.sql", false],
  ]);
  assert.deepEqual(first.pending.map(({ name }) => name), ["0002_public_indexes.sql"]);
  assert.deepEqual(first.alreadyApplied.map(({ name }) => name), ["0001_integrity_indexes.sql"]);
});

test("plan digest is bound to the database identity and applied/pending state", () => {
  const base = createMigrationPlan({
    migrations,
    appliedRows: [],
    trackingTableExists: true,
    databaseIdentity: identity,
  });
  const differentDatabase = createMigrationPlan({
    migrations,
    appliedRows: [],
    trackingTableExists: true,
    databaseIdentity: { ...identity, database: "another_database" },
  });
  const differentServer = createMigrationPlan({
    migrations,
    appliedRows: [],
    trackingTableExists: true,
    databaseIdentity: { ...identity, serverAddress: "192.0.2.20" },
  });
  const differentTrackingState = createMigrationPlan({
    migrations,
    appliedRows: [],
    trackingTableExists: false,
    databaseIdentity: identity,
  });

  assert.notEqual(base.digest, differentDatabase.digest);
  assert.notEqual(base.digest, differentServer.digest);
  assert.notEqual(base.digest, differentTrackingState.digest);
});

test("modified applied migration is rejected", () => {
  assert.throws(
    () => createMigrationPlan({
      migrations,
      appliedRows: [{ name: "0001_integrity_indexes.sql", sha256: "f".repeat(64) }],
      trackingTableExists: true,
      databaseIdentity: identity,
    }),
    /Applied migration was modified: 0001_integrity_indexes\.sql/,
  );
});

test("untracked historical migration records block the plan", () => {
  assert.throws(
    () => createMigrationPlan({
      migrations,
      appliedRows: [{ name: "0000_removed_migration.sql", sha256: "c".repeat(64) }],
      trackingTableExists: true,
      databaseIdentity: identity,
    }),
    /missing from this checkout/,
  );
});

test("inconsistent tracking state and non-public schema are rejected", () => {
  assert.throws(
    () => createMigrationPlan({
      migrations,
      appliedRows: [{ name: "0001_integrity_indexes.sql", sha256: "a".repeat(64) }],
      trackingTableExists: false,
      databaseIdentity: identity,
    }),
    /tracking table does not exist/,
  );
  assert.throws(
    () => createMigrationPlan({
      migrations,
      appliedRows: [],
      trackingTableExists: true,
      databaseIdentity: { ...identity, schema: "private" },
    }),
    /explicit public schema/,
  );
});

test("invalid migration filenames, duplicate files, and malformed hashes are rejected", () => {
  assert.throws(
    () => createMigrationPlan({
      migrations: [{ name: "../unsafe.sql", sha256: "a".repeat(64), sql: "" }],
      trackingTableExists: true,
      databaseIdentity: identity,
    }),
    /Invalid migration filename/,
  );
  assert.throws(
    () => createMigrationPlan({
      migrations: [
        { name: "0001_example.sql", sha256: "a".repeat(64), sql: "" },
        { name: "0001_example.sql", sha256: "b".repeat(64), sql: "" },
      ],
      trackingTableExists: true,
      databaseIdentity: identity,
    }),
    /Duplicate migration filename/,
  );
  assert.throws(
    () => createMigrationPlan({
      migrations: [{ name: "0001_example.sql", sha256: "not-a-digest", sql: "" }],
      trackingTableExists: true,
      databaseIdentity: identity,
    }),
    /Invalid SHA-256/,
  );
});
