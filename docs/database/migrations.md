# Database migrations and integrity

## Contract

- Migrations are forward-only, versioned SQL files named `NNNN_description.sql` in `migrations/`.
- Never edit a migration after it has been applied. The runner stores the SHA-256 digest and refuses to rerun a file whose content changed.
- Apply migrations deliberately with `pnpm db:migrate` from a trusted operator environment. CI and application startup must not mutate production schema automatically.
- The runner uses a PostgreSQL advisory lock and a transaction per migration. It logs filenames and safe status only; it does not print DATABASE_URL.
- Keep a tested backup and a reviewed rollback/recovery plan before any production migration.

## First migration

`0001_integrity_indexes.sql` adds non-unique indexes to improve owner-scoped queries, evidence version lookup, event history, appeals and HCU run retrieval. It does not delete, rewrite or validate existing data. It assumes the tables/columns in the current Drizzle schema already exist; it is not an initial schema bootstrap.

## Important limitation

The repository did not contain a verified migration history at the time of this audit. Before running the migration against any shared database:

1. Confirm the database and environment are correct.
2. Compare actual table/column names against `lib/db/schema.ts`.
3. Take a recoverable backup and verify a restore to a disposable database.
4. Apply the migration to a disposable copy and test key queries.
5. Record the operator, commit SHA, database environment and result.

Foreign keys and unique constraints are intentionally not introduced until duplicate/orphan checks and deletion/retention semantics have been reviewed. A follow-up migration should add them using a documented cleanup plan and, where appropriate, PostgreSQL `NOT VALID` constraints followed by explicit validation.

## Recovery

Do not delete rows from `tamv_schema_migrations` to force a rerun. If a migration fails, inspect its exact error and database state, repair forward with a new migration when possible, and use the provider's verified restore process for data corruption. Indexes from migration 0001 can be removed individually with reviewed `DROP INDEX CONCURRENTLY` operations outside a transaction if rollback is necessary.

## Required next constraints

After data profiling and integration tests, evaluate:
- unique researcher profile per user;
- foreign keys for user-owned proposals, evidence, reviews, appeals, interests and simulation runs;
- unique proposal evidence version per proposal and owner;
- one active appeal per proposal;
- check constraints for role/status/visibility and bounded simulation fields.

Do not enable these constraints until the data has been checked and the account deletion/retention policy is explicit.
