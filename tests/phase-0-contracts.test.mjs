import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(path, import.meta.url), "utf8")

test("Phase 0 quality gates use a pinned package manager and reproducible commands", async () => {
  const pkg = JSON.parse(await read("../package.json"))
  const ci = await read("../.github/workflows/ci.yml")

  assert.equal(pkg.packageManager, "pnpm@12.16.1")
  assert.equal(pkg.scripts.test, "node --experimental-strip-types --test tests/*.test.mjs")
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit")
  assert.match(pkg.scripts.build, /next build/)
  assert.match(ci, /pnpm install --frozen-lockfile/)
  assert.match(ci, /pnpm test/)
  assert.match(ci, /pnpm typecheck/)
  assert.match(ci, /pnpm build/)
  assert.match(ci, /pnpm audit --prod --audit-level high/)
})

test("Phase 0 security workflows are defined and least-privileged", async () => {
  const codeql = await read("../.github/workflows/codeql.yml")
  const secrets = await read("../.github/workflows/secret-scan.yml")

  assert.match(codeql, /security-extended/)
  assert.match(codeql, /security-events:\s*write/)
  assert.match(secrets, /fetch-depth:\s*0/)
  assert.match(secrets, /GITLEAKS_ENABLE_UPLOAD_ARTIFACT:\s*"false"/)
  assert.match(secrets, /GITLEAKS_ENABLE_COMMENTS:\s*"false"/)
  assert.match(secrets, /persist-credentials:\s*false/)
})

test("database migration application requires an exact reviewed plan digest", async () => {
  const migrate = await read("../scripts/db-migrate.mjs")
  const contract = await read("../scripts/db-migration-contract.mjs")
  const migration = await read("../migrations/0004_public_rate_limits.sql")

  assert.match(migrate, /--apply requires the exact 64-character digest/)
  assert.match(migrate, /default_transaction_read_only = on/)
  assert.match(migrate, /pg_try_advisory_lock/)
  assert.match(migrate, /strict database preflight did not pass/)
  assert.match(migrate, /plan digest does not match/)
  assert.match(contract, /Applied migration was modified/)
  assert.match(contract, /missing from this checkout/)
  assert.match(migration, /PRIMARY KEY \(bucket, window_start_ms\)/)
  assert.match(migration, /TAMV_RATE_LIMIT_SALT/)
})

test("example environment uses inert placeholders and keeps sensitive switches off", async () => {
  const env = await read("../.env.example")
  assert.match(env, /^TAMV_RATE_LIMIT_ENABLED=false$/m)
  assert.match(env, /^TAMV_PASS_ENABLED=false$/m)
  assert.match(env, /^TAMV_BILLING_MODE=disabled$/m)
  assert.match(env, /^LGS_FOUNDER_ACCESS_ENABLED=false$/m)
  assert.match(env, /^LGS_FOUNDER_SECURITY_REVIEW_APPROVED=false$/m)
  assert.match(env, /^TAMV_RATE_LIMIT_SALT=replace-with-/m)
  assert.doesNotMatch(env, /^NEXT_PUBLIC_(?:DATABASE_URL|.*PRIVATE_KEY|.*SECRET)=/m)
})
