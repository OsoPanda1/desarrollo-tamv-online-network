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

The companion repository separately contains Auth0/OIDC, Supabase-backed TAMV ID/member registry, ORCID linking, federated metadata search, DOI audit and VETRA workflows. These are separate applications, not automatically one runtime. Identity, data, APIs, authorization and deployment must be federated explicitly; copying screens or linking domains is not secure integration. See [the federation contract](docs/architecture/federation-contract.md).

## HCU observatory and institutional interface

The active `/hcu` route defaults to an interactive perspective-projected 3D field. It uses the public graph returned by the PostgreSQL application layer and supports orbit rotation, zoom, domain focus, layer controls, selection, and descriptive analytics. The former 2D scheme and record list remain as alternate reading modes.

The institutional Living Universe under `WEBINSTITUCIONAL-TAMVONLINE/web/mapa.html` has its own browser-rendered canvas and the corpus `WEBINSTITUCIONAL-TAMVONLINE/web/assets/mapa/graph.js`. That static documentary corpus is not automatically synchronized with the application's PostgreSQL graph. The 3D layout and metrics are descriptive encodings, not causal predictions or evidence of independent validation. See [HCU observatory v2 architecture](docs/architecture/hcu-observatory-v2.md).

## Support and donation checkout

The shared navigation, institutional landing sections, application footer, and research-theme invitation link to `/apoyar`. The route is deliberately transparent when no payment provider is configured: it does not collect payment details or claim that a transaction took place.

- `TAMV_DONATION_URL` is an optional server-side hosted-checkout URL; leave it empty until the recipient, terms, fees, and reporting process are ready.
- Redirects require HTTPS and a pre-approved host. GitHub links are accepted only in the `/sponsors/<account>` form; new providers require an explicit reviewed allowlist update in `app/apoyar/page.tsx`.
- The default support route offers institutional contact and governance information instead of inventing bank details or simulating a payment.
- Never expose checkout session secrets, private donation records, donor identities, or payment-provider credentials in a public repository or client-side bundle.

## Developer onboarding and adoption

The public developer entry point is [the developer guide](/desarrolladores). It documents the public research topics/projects endpoints, HCU graph and JSON-LD/CSV exports, and distinguishes public reads from authenticated write routes.

- [Public API quickstart](docs/api/public-api-quickstart.md) — reproducible `curl` examples, response boundaries, and license/provenance notes.
- [OpenAPI 3.1 contract](public/openapi.yaml) — machine-readable specification for current public read endpoints; session-protected write routes are intentionally not documented as anonymous integrations.
- [CONTRIBUTING](CONTRIBUTING.md) — setup, review expectations, security handling, accessibility, and evidence requirements.
- [Developer adoption strategy](docs/strategy/developer-adoption-latam.md) — proposed LATAM/international onboarding, contributor pathways, experiments, and privacy-respecting measurements.
- [Platform excellence roadmap](docs/strategy/tamv-platform-excellence-roadmap.md) — prioritized product, academic, security, operations, and adoption acceptance criteria.
- [HTML hub audit, 2026-11-23](docs/audit/2026-11-23-tamv-html-hub-audit.md) — measured findings from the standalone HTML snapshot, including its embedded-asset cost and local-only interactions.

The adoption plan is a strategy, not evidence that a campaign or partnership has run. Views, clones, contributions, retention, and conversion must remain “not measured” until instrumentation or a reproducible manual process provides the numbers.

## Local development

Use a supported Node.js LTS and pnpm compatible with the lockfile.

    pnpm install --frozen-lockfile
    cp .env.example .env.local
    pnpm test
    pnpm typecheck
    pnpm build
    pnpm dev

## Operational health endpoints

- `GET /api/health` — application liveness. This is intentionally independent of PostgreSQL so a database outage does not cause a healthy application process to be treated as dead.
- `GET /api/health/ready` — readiness probe. Executes `SELECT 1` against PostgreSQL with a 1.5-second response budget and a driver-level query timeout; returns HTTP 200 only when `DATABASE_URL` is configured and the database responds within budget, otherwise HTTP 503. A timed-out query may finish or be cancelled later at the driver/pool layer; the HTTP response itself is bounded.
- Both endpoints send `Cache-Control: no-store`. Readiness failures return a generic dependency state and never include connection strings, database hosts, exception text or credentials.
- These endpoints are operational signals, not a full synthetic transaction, authentication check, schema migration validation or proof that every feature is healthy.

## Database operations

- `PG_POOL_MAX` configures the maximum PostgreSQL connections per Node.js process. The default is 3; valid values are integers from 1 through 20. Choose the value against the provider connection limit, serverless instance concurrency and whether the database URL uses a connection pooler.
- `pnpm db:preflight` — read-only schema and integrity diagnostics; set `DATABASE_URL` explicitly to a disposable/test database first.
- `pnpm db:preflight -- --strict` — exits unsuccessfully if schema checks or integrity diagnostics find issues.
- `pnpm db:migrate` — applies checksummed migrations only after the strict preflight passes. Do not run this against production until a backup restore has been rehearsed and the exact target database is confirmed.

Do not commit .env.local, credentials, private keys, database dumps or real user data. Review [database migration guidance](docs/database/migrations.md) before applying migrations; migrations assume the existing schema is present and do not bootstrap a blank database. A successful build does not prove authorization, database workflows or production integrations work.

## Security and release gates

The project maintains separate controls for application identity, data integrity, supply chain, privacy and operational recovery. See:

- [Triple hardening standard](docs/security/triple-hardening.md)
- [Evidence-based release readiness gates](docs/security/release-readiness.md)
- [Baseline technical audit](docs/audit/2026-11-baseline.md)

A release is not production-ready merely because workflows or checklists exist. Record passing CI, dependency audit, CodeQL, secret scan, authorization tests, database recovery evidence and a smoke test for the exact deployed commit. If the runner provides no executable logs or the deployment version cannot be confirmed, mark validation as blocked rather than passed.

## Triple hardening

1. Cryptographic/data plane: TLS, managed encryption at rest, authenticated encryption where justified, key rotation, integrity digests and backup recovery.
2. Application/identity plane: deny-by-default authorization, server-side validation, session protection, rate limits, safe redirects, audit events and supply-chain checks.
3. Governance/operations plane: consent, privacy/retention, moderation/appeals, release approvals, incident response and evidence-backed claims.

A hash is not encryption, a digital signature, a trusted timestamp, or proof that a claim is true.

## Evidence policy

Keep facts, self-reported declarations, model outputs, simulations, proposals and independently verified evidence distinct. External records should retain provider, canonical URL, retrieval time, identifier, license/terms where applicable and validation status. Do not infer peer review, legal ownership, patentability, organizational eligibility or impact from the mere existence of a URL, DOI or repository.

Do not publish invented member counts, traffic, conversions or ecosystem maturity percentages. Until telemetry is instrumented and validated, state “not yet measured”.

## Community discovery

External links are discovery resources only. No affiliation, endorsement, data sharing or permission to reproduce third-party content is implied. Prefer official APIs/feeds and honor terms, licenses and access controls.

## Institutional attribution

TAMV materials identify Edwin Oswaldo Castillo Trejo, also known by the creative signature Anubis Villaseñor. Public claims must remain bounded by their available evidence.
