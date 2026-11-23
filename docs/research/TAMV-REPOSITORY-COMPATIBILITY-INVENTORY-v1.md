# TAMV Online Network — Repository Compatibility Inventory

**Date:** 2026-11-23  
**Status:** Initial read-only inventory based on GitHub repository metadata, root directory listings and package manifests. Not a complete source audit or build verification.

## Executive finding

The eight projects are not one deployable application or a homogeneous monorepo. They use different runtimes, frameworks, package managers, identity/data layers and release processes. The safer integration model is an explicit federation of independently owned services, not shared databases or indiscriminate code copying.

## Repository inventory

| Repository | Observed stack | Scripts / structure observed | Integration consequence |
|---|---|---|---|
| [desarrollo-tamv-online-network](https://github.com/OsoPanda1/desarrollo-tamv-online-network) | Next.js, React 19, TypeScript; PostgreSQL/Drizzle and Better Auth dependencies | pnpm; typecheck, test, build, DB preflight/migration | Candidate core service. Preserve DB and auth boundaries. |
| [tamvonline-weboficial.com](https://github.com/OsoPanda1/tamvonline-weboficial.com) | Next.js, React 19, TypeScript; Stripe dependency | pnpm; typecheck, build, site/app validation, route smoke tests | Separate institutional app and release process; integrate through versioned public APIs. |
| [litle-atlas-suite](https://github.com/OsoPanda1/litle-atlas-suite) | Vite/TanStack Start, React 19, TypeScript; Supabase client and Drizzle dependencies | Bun lockfile; lint, test, build | Independent Atlas workspace; establish API contract and provenance before syncing content. |
| [WEBINSTITUCIONAL-TAMVONLINE](https://github.com/OsoPanda1/WEBINSTITUCIONAL-TAMVONLINE) | Static HTML, bilingual i18n; repository metadata declares MIT | No root package.json observed in root listing; README and LICENSE exist | Static publishing surface, not a runtime API provider. Use generated metadata artefacts or a separate API. |
| [tamv-core-atlas](https://github.com/OsoPanda1/tamv-core-atlas) | Vite/TanStack Start; npm workspace named tamv-core-atlas | lint, typecheck, build, Atlas discovery/build/validation scripts | Isolate discovery/build from execution of discovered code; export normalized metadata through a defined contract. |
| [heptafederate-heart-3f66f855](https://github.com/OsoPanda1/heptafederate-heart-3f66f855) | Vite/TanStack Start; root package manifest and workspace layout closely resemble tamv-core-atlas | Similar lint, typecheck, build and Atlas workspace scripts | Potential code/architecture overlap based on manifests and root listings only. Compare history and source before deciding whether these are distinct products, a fork or duplicated work. |
| [metodo4l](https://github.com/OsoPanda1/metodo4l) | Turborepo workspaces, Next.js 15, React 18, Prisma, Express and Stripe | npm workspaces; build, lint, typecheck, database and curriculum sync scripts | Distinct runtime and older React/Next generation; integrate curriculum through APIs/events rather than direct dependency sharing. |
| [litle-verified-trust](https://github.com/OsoPanda1/litle-verified-trust) | Vite/TanStack Start, React 19; Supabase and AI SDK dependencies | Bun; build, lint and format observed; no test script shown in package manifest | Treat as proposed evidence/provenance service until trust semantics and tests are defined. Root listing contains a .env path: potential secret exposure requiring immediate owner review. |

## P0 security follow-up: .env in litle-verified-trust

The default-branch root directory listing includes a path named .env. This is a risk indicator, not proof that a live secret was committed. No secret values were retrieved or reproduced.

1. An authorized maintainer should inspect the file locally without copying values into issues, logs or chat.
2. If it contains real credentials, revoke/rotate them immediately and check provider audit logs.
3. Remove the file from the repository; ensure .env* is ignored while retaining only a redacted .env.example.
4. Scan current tree and Git history. Removing a file in a later commit does not invalidate exposed credentials or erase historical blobs.
5. Check CI logs, build artefacts and deployment logs for accidental disclosure.
6. Record remediation evidence without including secret values.

Do not assume secret scanning has passed; a prior check was reported as failing, and detailed logs were unavailable.

## Licensing gate

Repository API metadata returned explicit repository-level licenses for WEBINSTITUCIONAL-TAMVONLINE (MIT) and metodo4l (CC0-1.0). It did not return an explicit repository-level license for the other six repositories. This does not prove every file lacks a license, but cross-repository code reuse should remain blocked until actual LICENSE/NOTICE files, assets and dependency terms are reviewed. A public repository is not blanket permission to copy code, logos, content or cryptographic components.

## Cross-runtime interoperability rules

1. **Contract first:** define a versioned OpenAPI contract for each synchronous service boundary and validate request/response schemas.
2. **Read-only first:** start with discovery and read APIs. Do not introduce cross-database writes.
3. **Explicit identity:** validate OIDC issuer, audience, signature, expiry and relevant state/nonce checks. Link users by (issuer, sub), never email alone. Keep workload identity separate from end-user identity.
4. **Versioned events:** if asynchronous integration is needed, define schema version, producer, event ID, timestamp, correlation ID, idempotency and replay policy.
5. **First-class provenance:** Atlas records should include canonical source URL, observed commit/version, license status, discovery timestamp and validation state.
6. **Never execute discovered code:** repository discovery must treat external source content as untrusted data.
7. **Evidence-based status:** distinguish catalogued, contracted, adapter implemented, contract tested and verified. Verification requires commit-bound tests and deployment evidence.
8. **No inferred health claims:** repository presence or a URL does not prove a service is healthy.

## Recommended order of work

### P0 — Security and release evidence
- Resolve the possible .env exposure in litle-verified-trust.
- Retrieve actionable CI, CodeQL and secret-scan logs and diagnose failed checks by commit SHA.
- Review actual licenses before any shared implementation or asset transfer.
- Do not add empty test scripts merely to make CI green.

### P1 — Compatibility and contracts
- Compare tamv-core-atlas and heptafederate-heart-3f66f855 for shared history, duplicated source, divergent features and ownership.
- Create OpenAPI specifications for catalog, institutional metadata and Atlas read endpoints.
- Add consumer-driven contract tests and backward-compatibility checks.
- Define a canonical metadata and provenance envelope.

### P2 — Controlled federation
- Implement one read-only adapter at a time.
- Add authentication/authorization negative tests, rate limits, timeouts, correlation IDs and observability.
- Only after evidence is stable, consider versioned event publication and limited write workflows with idempotency and recovery.
- Publish measured status with SHA, test result, environment and deployment URL.

## Evidence limitations

This inventory reflects repository metadata, root listings and package manifests fetched from default branches. It is not a complete source audit, vulnerability scan, legal opinion, successful build or production validation. The .env finding is only a path-level signal. Similarity between the Atlas/Kodex projects is a manifest/tree observation, not a conclusion that the repositories are duplicates.
