# Database migrations and integrity

## Contract

- Migrations are forward-only, versioned SQL files named `NNNN_description.sql` in `migrations/`.
- Never edit a migration after it has been applied. The runner stores the SHA-256 digest and refuses to rerun a file whose content changed.
- Apply migrations deliberately with `pnpm db:migrate` from a trusted operator environment. CI and application startup must not mutate production schema automatically.
- The runner uses a PostgreSQL advisory lock and a transaction per migration. It logs filenames and safe status only; it does not print DATABASE_URL.
- Keep a tested backup and a reviewed rollback/recovery plan before any production migration.

## Read-only preflight

Run `pnpm db:preflight` against the intended database before any migration. It verifies required table/column presence and reports orphan/duplicate counts without printing row contents or changing data. Use `pnpm db:preflight -- --strict` to return a failing exit code when integrity findings exist. A non-strict run is diagnostic only; warnings still require review.

## First migration

`0001_integrity_indexes.sql` adds non-unique indexes to improve owner-scoped queries, evidence version lookup, event history, appeals and HCU run retrieval. It does not delete, rewrite or validate existing data. It assumes the tables/columns in the current Drizzle schema already exist; it is not an initial schema bootstrap.

## Second migration

`0002_public_query_indexes.sql` adds indexes for public research-topic/project/publication listings, researcher directory reads, HCU graph queries, and topic-scoped proposal/interest lookups. It is additive and does not add constraints or rewrite rows. Apply it through the same strict-preflight migration runner only after a backup/restore rehearsal and query-plan review on a disposable database.

## Third migration

`0003_memberships_billing.sql` adds membership subscriptions, signed-webhook event ledger, and member course progress tables with plan/status/currency/terms checks. It is additive and does not enable live billing by itself.

## Fourth migration

`0004_public_rate_limits.sql` adds `public.tamv_rate_limit_counters` with a `(bucket, window_start_ms)` primary key so the shared limiter increments atomically across instances. Bucket identifiers use **HMAC-SHA-256** with the secret `TAMV_RATE_LIMIT_SALT`; the salt must be unique per environment, secret, high-entropy and at least 32 characters. There is no default/fallback salt. Raw IP addresses are not persisted.

**Deployment ordering is mandatory:** before deploying a build to Vercel production (where the shared limiter is enabled automatically unless deliberately disabled) or setting `TAMV_RATE_LIMIT_ENABLED=true` elsewhere, verify the intended database and then run `pnpm db:preflight`, `pnpm db:migrate`, and `pnpm db:preflight` again from the trusted operator environment. Take and verify a recoverable backup first. The migration must be applied only through `scripts/db-migrate.mjs`, which enforces the repository's preflight, advisory lock, transaction, and SHA-256 checksum safeguards. Do not apply the SQL manually. A missing migration or missing/weak salt causes the limiter to fail closed and protected routes can return HTTP 503; that is an operational block, not a reason to silently bypass the limiter.

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
