# TAMV Online Network — Baseline technical audit

Date: 2026-11-20  
Targets: OsoPanda1/desarrollo-tamv-online-network and companion OsoPanda1/tamvonline-weboficial.com  
Method: repository metadata, recursive file inventories and targeted source review. This is not a penetration test, runtime test, dependency audit or certification.

## Executive finding

The core repository contains a substantial Next.js App Router surface: institutional pages, researcher/project/proposal flows, moderation and appeals, HCU graph/simulation, Drizzle schema, Better Auth dependency and Zod validation. The companion site contains separate Auth0/Supabase identity and membership flows, research metadata integrations, ORCID linking, VETRA workflows, migrations and validation scripts.

The principal architectural risk is two related applications with overlapping identity/research/community capabilities but no proven end-to-end federation contract. Define canonical ownership of identity, member IDs, research records, moderation decisions, APIs and analytics before merging data or sessions.

## Findings and remediation

| ID | Severity | Evidence-based finding | Required remediation |
|---|---|---|---|
| AUD-01 | High | Core package metadata identifies the app as my-project version 0.1.0. | Normalize package name/version and metadata. |
| AUD-02 | High | Core inventory did not show root README, visible migration directory, test suite, CI workflow or environment example. | Add onboarding, environment contract, migrations, CI and tests; verify hidden configuration before asserting absence. |
| AUD-03 | High | Core uses Better Auth/Drizzle/PostgreSQL; companion uses custom Auth0/OIDC and Supabase REST credentials. | Choose canonical identity; define subject mapping, token audience, account linking, revocation and migration. Never share raw session cookies. |
| AUD-04 | High | Core schema includes user/session/account/verification and research entities; full referential integrity and access controls need migration/runtime review. | Version migrations; enforce foreign keys, uniqueness, indexes, constraints and least-privilege database roles. |
| AUD-05 | High | Proposal, moderation and appeal flows process sensitive user-generated records. File presence does not prove consistent authorization. | Test every handler for anonymous, cross-user, moderator and administrator access; add rate limits and audit trails. |
| AUD-06 | High | Companion Supabase helper uses privileged server credentials. Safety depends on server-only boundaries and caller authorization. | Keep credentials server-only; use least-privilege grants and verify no client bundle exposes privileged operations. |
| AUD-07 | Medium | Core package scripts expose dev/build/start but no explicit typecheck, test or validation gates. | Add reproducible typecheck/tests and gate pull requests on install, build, migration and route checks. |
| AUD-08 | Medium | Research, community, profile and VETRA concepts can duplicate or diverge across applications. | Publish canonical data dictionary, stable IDs, status state machines, provenance schema and versioned API contracts. |
| AUD-09 | Medium | Companion validation scripts are useful but static checks do not prove deployed runtime behaviour. | Add database integration, accessibility, route smoke and production synthetic tests. |
| AUD-10 | Medium | HCU simulations could be mistaken for empirical forecasts if assumptions are not prominent. | Label assumptions, source inputs, expose seed/version/uncertainty and separate simulated output from measured statistics. |
| AUD-11 | Medium | News, tutorials, forum discussions and research need a consistent editorial evidence model. | Track source, author, publication date, correction history, moderation status and license. |
| AUD-12 | Medium | A competitor/community directory can imply endorsement or encourage unauthorized copying. | Use original summaries and links; disclose independence and honor terms/licenses. |

## Priority plan

### P0 — release safety
1. Select canonical identity and define session boundaries.
2. Review every API handler for authentication, ownership, role checks, validation, CSRF/origin protections where applicable, rate limits and safe errors.
3. Enable secret scanning and dependency alerts; verify no secrets or personal data are committed.
4. Add CI gates for frozen install, typecheck, tests, build, migration validation and route smoke tests.
5. Validate production environment and database connectivity without revealing secret values.

### P1 — integrity and federation
1. Add versioned migrations and recovery/rollback guidance.
2. Define canonical entities for user, TAMV ID, project, proposal, evidence, discussion, category, moderation decision and audit event.
3. Define API contracts, event semantics and versioning between both applications.
4. Add idempotency, pagination, bounded queries, unique constraints and retention rules.
5. Store provenance: source URL, provider, retrieval time, digest, schema version and verification status.

### P2 — product and adoption
1. Deliver searchable, accessible community discovery.
2. Implement editorial feed, tags, saved topics, notification preferences and onboarding as real backed features.
3. Instrument privacy-minimizing analytics and obtain consent where required.
4. Audit accessibility, responsive layouts, performance and multilingual content.
5. Measure activation, returning users, successful searches, proposal completion and moderation time from real telemetry.

## Statistical integrity

Never invent member counts, active users, traffic, conversion, research impact or maturity percentages. Until validated telemetry exists, show “not yet measured”. Repository counts are not proof of real-world impact.

## Limitations

This review did not execute the application, install dependencies, run tests, inspect every route implementation, test database permissions, scan secrets or test the live deployment. Findings are prioritized hypotheses supported by repository structure and targeted source review; close them only with code and test evidence.


## Phase 1–3 remediation log (branch work; validation pending)

The following source-level findings were confirmed during the next pass and addressed in this branch. They are **code changes awaiting CI and runtime verification**, not certified remediations.

| ID | Severity | Confirmed issue | Change made | Residual validation |
|---|---|---|---|---|
| AUD-13 | High | Evidence attachment checked proposal state, selected a version, and inserted outside a transaction; concurrent writes could race state changes or duplicate version numbers. | Lock the owning proposal row and perform state check, version allocation and insert in one transaction. | Run concurrent integration tests against PostgreSQL; add a database uniqueness constraint for proposal/user/version in a reviewed migration. |
| AUD-14 | High | A published proposal's owner could not withdraw publication consent; the UI hid the consent control for published records. | Consent withdrawal now atomically changes the record to withdrawn/private, clears publication time, and records a provenance event; the owner UI exposes this control. | Test catalog/export removal, cached pages, concurrent publication/withdrawal, and third-party copies. External copies cannot be recalled by this application. |
| AUD-15 | Medium | Appeal records could remain in received after the proposal moved through appeal review, blocking a later appeal. | Synchronize appeal state to under_review and then resolved in the same moderation transaction; store resolution note/time. | Exercise all state transitions, recusal, repeat appeals and concurrent moderation with integration tests. |
| AUD-16 | Medium | Auth trusted origins were derived from Vercel hosts but did not explicitly normalize the canonical BETTER_AUTH_URL origin. | Normalize allowed origins, reject malformed/non-HTTPS production origins, include the configured canonical origin, and deduplicate the allowlist. | Validate login/callback/logout on production and preview domains; verify deployment variables and cookie behavior. |

## Security automation added in the branch

- .github/workflows/ci.yml: frozen pnpm install, TypeScript check, production build and high/critical production dependency audit.
- .github/workflows/codeql.yml: CodeQL JavaScript/TypeScript analysis with the extended query suite.
- .github/workflows/secret-scan.yml: Gitleaks secret scanning on pushes, pull requests and a weekly schedule.
- .github/dependabot.yml: weekly npm/pnpm dependency and GitHub Actions update proposals.
- .github/pull_request_template.md, SECURITY.md, .env.example, and docs/security/release-gates.md: review gates, safe environment template, disclosure guidance and release evidence requirements.

## Current validation status

- Source changes committed to the feature branch.
- CI and security workflows are configured, but this review has not independently observed successful runs for the current head.
- The only visible check observed during this pass was a pending Vercel check; this is not a successful build result.
- No PostgreSQL integration test, browser smoke test, penetration test, production deployment test, or third-party identity federation test has been executed from this session.
- Database migrations and declarative constraints remain an explicit gap: the current repository does not yet provide a verified, reproducible migration/recovery workflow. Do not deploy schema changes based only on TypeScript schema definitions.

## Next required sequence

1. Confirm CI, CodeQL, Gitleaks, dependency audit and Vercel checks on the latest PR head.
2. Establish a reproducible Drizzle migration workflow, then add constraints/indexes through reviewed forward and rollback plans.
3. Add integration tests for ownership/role boundaries, appeal lifecycle, publication consent, exports and HCU run isolation.
4. Test real authentication flows and all API routes using separate owner, other-user, reviewer, editor and administrator accounts.
5. Configure repository rules/branch protection to require successful checks and review; configuration files alone do not enforce merge policy.
6. Validate deployed observability, backup restoration, secret rotation and incident response before claiming production readiness.


## Phase 4–5 update: migration tooling and federation boundary

- Added a checksummed, transactional PostgreSQL migration runner using an advisory lock, a migration ledger and an explicit `pnpm db:migrate` command. It does not run automatically at app startup.
- Added migration 0001 with non-unique query indexes only. It assumes the existing schema is already present and has not been run against a database in this session. No foreign keys or unique constraints were added because existing data and deletion/retention semantics have not been verified.
- Added a core/companion identity federation contract defining OIDC validation, subject mapping, local authorization, account linking, logout/revocation and staged rollout. This is a design contract, not live federation.
- GitHub Actions run diagnostics for the observed CI, CodeQL and secret-scan attempts showed jobs finishing with `runner_id: 0` and empty step lists; log downloads were unavailable. This indicates the jobs did not provide executable validation evidence, so the failures cannot currently be attributed to TypeScript, dependency audit or scan findings. Repository Actions/runner availability and permissions must be checked by an administrator.
- A Vercel status check succeeded on the prior source-code head; the latest audit-documentation-only commit has a new pending Vercel check. The preview itself was not smoke-tested because the connected Vercel tool scope did not authorize access to the team deployment. No local build could be run from this environment because direct GitHub network access was unavailable.

## Corrected release status

The branch now has migration tooling, one non-destructive index migration, security workflows and a proposed federation contract. **None of these changes is production-validated yet.** Do not apply migration 0001 to a shared database until its actual schema is checked and a restore-tested backup exists. Do not claim successful CI, CodeQL, Gitleaks, deployment or OIDC federation until each has concrete passing evidence.


## Phase 6 update: test coverage and reference URL validation

- Added a native Node test suite for declared proposal state transitions, bounded proposal/moderation/appeal/simulation inputs, and unsafe reference URL rejection. The suite is wired into the CI job but has not been executed successfully in this session because GitHub Actions jobs had no assigned runner.
- Hardened the shared HTTP URL schema to reject non-HTTP(S) schemes, embedded URL credentials, localhost/local-domain references and common private/reserved IPv4 ranges; restricted IPv6 literals to the global-unicast prefix. This validation protects stored research references and evidence links; it is not a server-side fetcher and must not be treated as an SSRF defense for future outbound HTTP features.
- Wired the community page to the JSON source registry, removing duplicated inline source lists so editorial descriptions and link metadata have a single data source.
- Pinned workflow actions to immutable commit SHAs to reduce mutable-tag supply-chain risk.

Remaining limitation: tests, TypeScript check, production build, SQL migration application, database concurrency behavior, UI/browser behavior, live links and deployed authentication still require a functioning runner and controlled test environment.


## Phase 7 update: database preflight and final gates

- Added a read-only database preflight script and the `pnpm db:preflight` command. It checks required schema columns and reports counts for orphaned references and duplicate identity/evidence/active-appeal records without printing row contents or modifying data. The optional strict mode exits non-zero on integrity findings.
- CI now includes syntax checks for both database scripts and runs the native test suite before TypeScript/build validation. The dependency audit remains a deliberate high/critical severity release gate.
- Workflow actions are pinned to immutable commit SHAs. This reduces mutable-tag risk but does not replace reviewing upstream releases and transitive dependencies.
- No database preflight, migration, unit test, typecheck, production build, browser smoke test or deployed route test has passed in this session. The code is staged in the draft PR; execution is blocked by the current Actions runner behavior and lack of authorized Vercel deployment access.


## Continued implementation — data integrity and export hardening

- Expanded `scripts/db-preflight.mjs` to inspect ownership and relational integrity across research proposals/topics/projects, researcher profiles, collaboration interests, HCU domains/atoms/hyperedges/shocks/runs, duplicate evidence versions, duplicate profiles, active appeals, invalid workflow states, published records lacking public consent, invalid HCU coordinate ranges, and simulation horizons.
- Corrected the proposal consent column check to use the physical PostgreSQL name `share_consent`, matching Drizzle schema mapping. Corrected HCU bounds to the model's 0–100 scale. These corrections are important: without them, the preflight could report a false schema failure or reject valid seeded HCU values.
- Preflight sessions now set PostgreSQL's default transaction mode to read-only and impose a 15-second statement timeout. The migration runner refuses to apply migrations unless the strict preflight exits successfully.
- Research catalog CSV exports now neutralize formula-leading user-controlled values (including formula starters after control/space prefixes), while retaining CSV quote escaping. Added regression tests for formula injection and quoting.

## Validation status after continued changes

These additional checks and tests have been committed to the draft branch. They have not been executed in a working CI runner or against a real PostgreSQL instance in this session. The strict preflight deliberately fails closed on integrity findings; if it reports historical data issues, resolve them with a reviewed remediation plan rather than bypassing the gate. A clean preflight is necessary but not sufficient for applying constraints or declaring the system production-ready.


## Continued implementation — export and simulation abuse resistance

- Research CSV generation now uses a dedicated encoder that prefixes spreadsheet formula starters (including after leading control/space characters) before standard CSV quoting. Regression tests cover formula injection, quote escaping and empty values.
- HCU simulation now checks the user's daily run count before expensive graph loading and simulation, while retaining the transactional quota check after computation to handle races.
- Added explicit public graph limits (250 atoms, 1,000 edges), a work-budget estimate based on Monte Carlo runs, time horizon, graph size and average hyperedge fan-out, and a maximum source/target fan-out of 32 IDs per edge. Requests outside the budget fail before the simulation model runs.
- Expanded the database preflight to flag oversized or empty hyperedges so those records are reviewed before any future constraint migration.

This is application-level abuse resistance, not a substitute for platform-wide rate limiting, request concurrency controls, observability, or load testing. The regression tests and preflight still need to run in a functioning CI runner and controlled database environment.


## Continued implementation — event-chain ordering

- Moderation, appeal submission and consent-change handlers now generate event timestamps only after acquiring the proposal row lock and after reading the latest event. The new timestamp is forced to be at least one millisecond later than the latest recorded event, preventing concurrent requests with precomputed/equal timestamps from making `ORDER BY createdAt DESC` select an ambiguous prior hash.
- This protects new event writes from a known ordering race. It does not retroactively prove or repair historical event chains; a dedicated verifier/reconciliation pass and concurrency tests remain necessary before treating the event history as a tamper-evident audit record.
