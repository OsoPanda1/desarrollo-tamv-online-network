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
