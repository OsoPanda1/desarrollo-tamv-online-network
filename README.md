# TAMV Online Network

**Tecnología Avanzada Mexicana Versátil · Territorio Autónomo de Memoria Viva**

Independent Mexican initiative connecting research, technology, digital communities and living territorial memory through a Latin American perspective.

- Application: Next.js App Router, React and TypeScript.
- Data layer: PostgreSQL via Drizzle ORM.
- Authentication dependency: Better Auth; verify runtime configuration before production.
- Validation: Zod.
- Companion institutional repository: https://github.com/OsoPanda1/tamvonline-weboficial.com
- Deployment URL reported by GitHub metadata: https://desarrollo-tamv-online-network.vercel.app

## Licensing, citation and reuse

**Repository code license status: pending maintainer decision.** A root `LICENSE` file was not present in the repository tree during the 2026-11-23 audit. Public visibility is not a grant of rights to copy, modify, redistribute or use the code commercially. See [licensing status and required decision](docs/governance/licensing-status.md) before reusing the implementation.

- [CITATION.cff](CITATION.cff) provides citation metadata; it is not a license, peer-review claim, accreditation or evidence of production readiness.
- [Code of Conduct](CODE_OF_CONDUCT.md) defines respectful participation and research-integrity expectations.
- GitHub issue templates and [the pull-request template](.github/PULL_REQUEST_TEMPLATE.md) standardize reproducible bug reports, feature proposals, research contributions and review evidence.
- The license of code, documents, data, images, and model materials may differ. Check each source and its rights before reuse.

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

## Paid memberships, course access and external startup resources

**Implementation state:** the core membership/course implementation was merged through [PR #27](https://github.com/OsoPanda1/desarrollo-tamv-online-network/pull/27). A follow-up branch adds an exact React lockfile pin, regression checks, Vercel Connect/Chat SDK guidance and the future institutionalization/ROR roadmap; that follow-up is not yet merged or deployed. Billing remains deliberately disabled by default.

- `/membresias` — individual plan **MXN $229/month per user** and business plan **MXN $699/month per organization**. The application fixes the price server-side; the browser cannot supply or change it.
- `/formacion` — five practical modules: verifiable developer profile, auditable portfolio, startup problem validation, business model/roadmap, and evidence-based investor pitch. Access is checked on the server for an active/trialing membership; module completion is stored against the authenticated user.
- `POST /api/billing/checkout` — creates a Stripe recurring Checkout Session with current terms acceptance and a bounded session expiry.
- `POST /api/webhooks/stripe` — verifies the raw-body Stripe signature, uses idempotent event receipt storage, and synchronizes subscription status. A browser success redirect alone does not activate access.
- `POST /api/billing/portal` and `GET /api/billing/me` — authenticated subscription management and the current user's own billing status.
- `/api/memberships/course-progress` — checks membership entitlement server-side and persists the authenticated user's own progress.
- `/membresias/condiciones` and `/privacidad` — scope, recurring billing and data-treatment disclosures. Their production/legal fields require operator review; the live checkout stays blocked until explicit approval flags are configured.

**Important scope boundaries:** the business membership is currently attached to the contracting user account and organization name. Team seats, invitations, workspace administration and transferring membership to employee accounts are not implemented. TAMV offers a route to apply for collaboration, not guaranteed project acceptance, paid work or funding.

AI Lounge is an independent third-party platform. This branch provides public links and a profile/program discovery guide; it does not provide a paid pass, referral entitlement or a verified commercial partnership. External program eligibility and access remain subject to AI Lounge's current terms.

A future institutionalization goal is documented at [Institutionalization and ROR roadmap](/institucionalizacion) and [in the governance plan](docs/strategy/institutional-legalization-and-ror-roadmap.md). Future net membership revenue could contribute to legal and administrative costs only after a documented governance decision and transparent accounting. There is no fixed allocation or guarantee today. ROR IDs are free; a ROR ID is not legal incorporation and registry inclusion is curated.

See the [production and Stripe runbook](docs/production/membership-billing-runbook.md) and the [production/deployment audit](docs/audit/2026-11-23-production-deployment-memberships-audit.md) before configuring secrets, applying the migration or requesting a production release.

## Developer onboarding and adoption

The public developer entry point is [the developer guide](/desarrolladores). It documents the public research topics/projects endpoints, HCU graph and JSON-LD/CSV exports, and distinguishes public reads from authenticated write routes.

- [TAMV practical guide](/guia) — bilingual walkthrough of what TAMV is, how to explore its main sections, how to interpret catalog and implementation states, and how to make a responsible first contribution.

- [Public API quickstart](docs/api/public-api-quickstart.md) — reproducible `curl` examples, response boundaries, and license/provenance notes.
- [OpenAPI 3.1 contract](public/openapi.yaml) — machine-readable specification for current public read endpoints; session-protected write routes are intentionally not documented as anonymous integrations.
- [CONTRIBUTING](CONTRIBUTING.md) — setup, review expectations, security handling, accessibility, and evidence requirements.
- [Developer adoption strategy](docs/strategy/developer-adoption-latam.md) — proposed LATAM/international onboarding, contributor pathways, experiments, and privacy-respecting measurements.
- [Platform excellence roadmap](docs/strategy/tamv-platform-excellence-roadmap.md) — prioritized product, academic, security, operations, and adoption acceptance criteria.
- [Evidence-to-production research plan](docs/strategy/evidence-driven-research-to-production.md) — selected scholarly evidence translated into prioritized engineering controls, release gates, and explicit limitations.
- [HTML hub audit, 2026-11-23](docs/audit/2026-11-23-tamv-html-hub-audit.md) — measured findings from the standalone HTML snapshot, including its embedded-asset cost and local-only interactions.

The adoption plan is a strategy, not evidence that a campaign or partnership has run. Views, clones, contributions, retention, and conversion must remain “not measured” until instrumentation or a reproducible manual process provides the numbers.

## Vercel Connect, Chat SDK and provider credentials

The project maintains design documentation for secure optional connectors. These guides do **not** mean the Connect SDK or a chat bot has been installed or connected; the repository's Vercel project and provider connectors must be verified and configured before activating the integration.

- [Vercel Connect SDK and security model](docs/integrations/vercel-connect-sdk.md) — OIDC identity, temporary provider credentials, user/app subjects, least privilege and experimental MCP event limits.
- [Vercel Connect cost optimization](docs/operations/vercel-connect-cost-optimization.md) — token cache, refresh policy, trigger destinations, retries and observability.
- [Chat SDK with Vercel Connect](docs/integrations/chat-sdk-with-vercel-connect.md) — adapter examples, OIDC webhook trust boundaries, idempotency and rollout plan.
- [Lockfile incident report](docs/production/pnpm-lockfile-repair.md) — React 19.2.4 missing-dependency incident, current pin and required frozen-install verification.
- [Institutionalization and ROR roadmap](docs/strategy/institutional-legalization-and-ror-roadmap.md) — future legal and accounting pathway, evidence gates and ROR criteria.

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


## TAMV ecosystem federation

The ecosystem now has a canonical, public discovery catalog at `GET /api/v1/ecosystem`, backed by [the typed system registry](lib/ecosystem/registry.ts). It lists the core app, institutional Next.js app, static institutional site, Core Atlas, Heptafederate/Core Kodex, Método 4L, LITLE Atlas Suite and LITLE Verified Trust with explicit responsibilities and data boundaries.

- [Ecosystem federation contract v1.0.0](docs/architecture/ecosystem-federation-v1.md) defines identity boundaries, canonical data ownership, provenance, phased adapter rollout, licensing review and release gates.
- Catalog states distinguish `catalogued`, `contracted`, `adapter_implemented` and `verified`. A repository being listed is not proof of a live connection.
- The first increment is intentionally read-only discovery. It does not merge databases, share authentication sessions, synchronize records, or assert remote service health.
- Code-level consolidation remains subject to repository license, asset, dependency and cryptographic implementation review.

The endpoint and registry tests live in `tests/ecosystem-registry.test.mjs`. They must pass in CI and the endpoint must be smoke-tested on a deployed preview before the catalog is used as a production integration surface.

A stateless `POST /api/v1/provenance/validate` endpoint validates provenance envelopes against the v1 Zod schema. It enforces JSON input and a 64 KiB body limit, returns structured schema errors, does not persist or fetch submitted sources, and does not establish source truth or authorship. See the [OpenAPI contract](public/openapi.yaml) and [federation architecture](docs/architecture/ecosystem-federation-v1.md). Its route tests are in `tests/provenance-validation-route.test.mjs`.

A bounded read-only adapter at `GET /api/v1/ecosystem/metadata` retrieves public GitHub repository metadata for the same eight catalogued systems. It reports partial upstream failures without claiming that an application is deployed or healthy; it uses no GitHub credentials, does not fetch repository code, and does not change the catalog integration states. See [the adapter contract](docs/architecture/github-public-metadata-adapter-v1.md) and its tests in `tests/ecosystem-github-metadata.test.mjs`.

The read-only route `POST /api/v1/research/federated` can forward a bounded research or organization query to the institutional app’s public research API. It remains disabled until the server-only `TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL` variable is set to the verified HTTPS `/api/research/search` endpoint; no target hostname is hardcoded or supplied by clients. See [the federation bridge contract](docs/architecture/institutional-research-federation-v1.md) and `tests/institutional-research-federation.test.mjs`.

The metadata dashboard is available at `/ecosistema`, and the federated query form is embedded in `/investigacion`. Both interfaces distinguish source metadata from application health or scientific verification. Search terms are forwarded to the configured institutional service and may reach its metadata providers; do not submit personal or confidential data. Before public production, apply a distributed rate limit at the deployment edge; the core application does not claim that an in-memory counter would protect a serverless deployment.
