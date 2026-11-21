# TAMV Online Network

**Tecnología Avanzada Mexicana Versátil · Territorio Autónomo de Memoria Viva**

Independent Mexican initiative connecting research, technology, digital communities and living territorial memory through a Latin American perspective.

- Application: Next.js App Router, React and TypeScript.
- Data layer: PostgreSQL via Drizzle ORM.
- Authentication dependency: Better Auth; verify runtime configuration before production.
- Validation: Zod.
- Companion institutional repository: https://github.com/OsoPanda1/tamvonline-weboficial.com
- Deployment URL reported by GitHub metadata: https://desarrollo-tamv-online-network.vercel.app

## Current product areas

Institutional pages, researchers/developers, projects, research topics and proposals, moderation/appeals, HCU transformation map and simulation, research exports, and a curated community-discovery hub.

The companion repository separately contains Auth0/OIDC, Supabase-backed TAMV ID/member registry, ORCID linking, federated metadata search, DOI audit and VETRA workflows. These are separate applications, not automatically one runtime. Identity, data, APIs, authorization and deployment must be federated explicitly; copying screens or linking domains is not secure integration.

## Local development

Use a supported Node.js LTS and pnpm compatible with the lockfile.

    pnpm install --frozen-lockfile
    cp .env.example .env.local
    pnpm test
    pnpm typecheck
    pnpm dev

## Operational health endpoints

- `GET /api/health` — application liveness. This is intentionally independent of PostgreSQL so a database outage does not cause a healthy application process to be treated as dead.
- `GET /api/health/ready` — readiness probe. Executes a bounded `SELECT 1` against PostgreSQL and returns HTTP 200 only when `DATABASE_URL` is configured and the database responds; otherwise returns HTTP 503.
- Both endpoints send `Cache-Control: no-store`. Readiness failures return a generic dependency state and never include connection strings, database hosts, exception text or credentials.
- These endpoints are operational signals, not a full synthetic transaction, authentication check, schema migration validation or proof that every feature is healthy.

## Database operations

- `pnpm db:preflight` — read-only schema and integrity diagnostics; set `DATABASE_URL` explicitly to a disposable/test database first.
- `pnpm db:preflight -- --strict` — exits unsuccessfully if schema checks or integrity diagnostics find issues.
- `pnpm db:migrate` — applies checksummed migrations only after the strict preflight passes. Do not run this against production until a backup restore has been rehearsed and the exact target database is confirmed.

Do not commit .env.local, credentials, private keys, database dumps or real user data. Review docs/database/migrations.md before applying migrations; migrations assume the existing schema is present and do not bootstrap a blank database. A successful build does not prove authorization, database workflows or production integrations work.

## Triple hardening

1. Cryptographic/data plane: TLS, managed encryption at rest, authenticated encryption where justified, key rotation, integrity digests and backup recovery.
2. Application/identity plane: deny-by-default authorization, server-side validation, session protection, rate limits, safe redirects, audit events and supply-chain checks.
3. Governance/operations plane: consent, privacy/retention, moderation/appeals, release approvals, incident response and evidence-backed claims.

See docs/security/triple-hardening.md and docs/audit/2026-11-baseline.md. A hash is not encryption, a digital signature, a trusted timestamp, or proof that a claim is true.

## Evidence policy

Keep facts, self-reported declarations, model outputs, simulations, proposals and independently verified evidence distinct. External records should retain provider, canonical URL, retrieval time, identifier, license/terms where applicable and validation status. Do not infer peer review, legal ownership, patentability, organizational eligibility or impact from the mere existence of a URL, DOI or repository.

Do not publish invented member counts, traffic, conversions or ecosystem maturity percentages. Until telemetry is instrumented and validated, state “not yet measured”.

## Community discovery

External links are discovery resources only. No affiliation, endorsement, data sharing or permission to reproduce third-party content is implied. Prefer official APIs/feeds and honor terms, licenses and access controls.

## Institutional attribution

TAMV materials identify Edwin Oswaldo Castillo Trejo, also known by the creative signature Anubis Villaseñor. Public claims must remain bounded by their available evidence.
