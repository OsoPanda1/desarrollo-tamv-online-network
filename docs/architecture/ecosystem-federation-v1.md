# TAMV ecosystem federation contract v1.0.0

**Status:** implemented public discovery catalog; federation between the listed runtimes remains unverified unless a row is explicitly advanced with test evidence.

## Goal

Bring the eight repositories into one coherent ecosystem without forcing incompatible frameworks, identity stores, databases, or deployment lifecycles into one monolith. “One system” means consistent contracts, governance, discovery and data provenance—not one shared session cookie or one database.

## Systems of record

| System | Canonical responsibility | Initial integration posture |
|---|---|---|
| `desarrollo-tamv-online-network` | Core community/research app, PostgreSQL/Drizzle, Better Auth, projects/topics/proposals/moderation/HCU | Primary application; existing public API is the first read-only integration surface |
| `tamvonline-weboficial.com` | Institutional Next.js app, Auth0/OIDC, Supabase TAMV ID, ORCID, federated research metadata and VETRA | Keep identity and data isolated; expose only reviewed public metadata initially |
| `WEBINSTITUCIONAL-TAMVONLINE` | Static bilingual institutional website and machine-readable records | Canonical public institutional content only; ROR draft is not an issued identifier |
| `tamv-core-atlas` | Atlas ingestion/normalization/classification/graph pipeline | Treat generated outputs as versioned snapshots, not authoritative application records |
| `heptafederate-heart-3f66f855` | Core Kodex/Heptafederate application shell and Atlas workspace | Separate deployment and framework; no source-tree merge without a compatibility review |
| `metodo4l` | UTAMV Campus curriculum and learning routes | Import public curriculum metadata only; course entitlements remain local to the owning application |
| `litle-atlas-suite` | Literature and evidence-oriented workspace | Reference records and evidence metadata only until verification contract and licensing are reviewed |
| `litle-verified-trust` | Proposed trust/evidence verification layer | No cryptographic trust assertions until algorithms, key custody, signature verification and tests are independently reviewed |

## Implemented in the core repository

- Typed catalog: `lib/ecosystem/registry.ts`.
- Public discovery endpoint: `GET /api/v1/ecosystem`.
- Bounded read-only GitHub public metadata adapter: `GET /api/v1/ecosystem/metadata`.
- Configurable read-only bridge to the institutional research API: `POST /api/v1/research/federated`; it remains disabled until an operator configures the verified public endpoint.
- Stateless provenance validator: `POST /api/v1/provenance/validate` with a 64 KiB request-body limit, JSON-only input, and structured schema errors.
- This contract and its explicit state semantics.
- Catalog states are evidence-gated: `catalogued`, `contracted`, `adapter_implemented`, `verified`.
- No secrets, private URLs, tokens, or privileged configuration are returned.

The endpoint is intentionally a discovery document. It does not probe remote systems, does not claim that they are online, and does not establish identity or trust.

## Phase 1 partial implementation: institutional research query bridge

`POST /api/v1/research/federated` forwards a bounded public search query to the institutional app's `POST /api/research/search` route after the operator configures `TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL`. The request schema accepts only `query` and optional `type`; caller input cannot choose a host. The bridge uses HTTPS-only endpoint validation, rejects local/IP targets and redirects, omits cookies and credentials, limits the request to 2 KiB, limits upstream response bodies to 256 KiB, validates returned records and caps the upstream timeout at nine seconds.

This bridge does not share identity, sessions, databases or write privileges, and is intentionally disabled with HTTP 503 until the exact endpoint is configured. The current Vercel association for the institutional application has not been independently confirmed in this session, so no guessed URL is embedded in source. See [the bridge contract](institutional-research-federation-v1.md) and [its tests](../../tests/institutional-research-federation.test.mjs).

## Phase 1 partial implementation: public GitHub repository metadata

`GET /api/v1/ecosystem/metadata` makes bounded, credential-free read-only calls to GitHub's repository metadata API for the eight repositories in the static registry. It enforces a 4.5-second per-request timeout, a 64 KiB upstream response limit, redirect rejection, payload schema validation and repository identity matching. A failed source returns a per-repository status without erasing successful results from other sources.

The `metadata_available` result confirms only that GitHub returned public metadata for the expected repository. It does not mean the application deploys, its runtime is reachable, builds pass, identity is federated, data is synchronized, or content is licensed for reuse. The adapter does not modify the registry's `integrationState`. The route uses shared-cache headers to limit anonymous GitHub API usage; its behavior and rate-limit profile still require preview verification.

See [the adapter contract](github-public-metadata-adapter-v1.md) and [the adapter tests](../../tests/ecosystem-github-metadata.test.mjs). Phase 1 remains open until the contract is deployed and verified against a recorded commit and target environment.

## Identity and authorization

1. Keep Better Auth/PostgreSQL and Auth0/Supabase as separate security domains until a formal OIDC trust configuration has been deployed and tested.
2. A future OIDC bridge must validate signature against trusted issuer keys, issuer, audience, expiry, not-before, nonce/state/PKCE at the appropriate flow stage, and key rotation. Reject unsigned tokens, unknown issuers and algorithm confusion.
3. Map a federated subject by immutable `(issuer, sub)`; do not use email as a primary key.
4. Keep local application user IDs and permissions. External identity alone never grants moderator, reviewer, administrator, billing or export privileges.
5. Never share session cookies, Better Auth tokens, Auth0 tokens, Supabase service-role keys or database credentials between repositories.
6. Use server-to-server short-lived credentials, minimum scopes, request signing where required, replay protection, rate limits, timeouts and explicit revocation behavior.

## Data contracts and ownership

- Core application owns its users/sessions, projects, topics, proposals, moderation and HCU application records.
- Institutional app owns its TAMV ID/member registry and its VETRA workflows. ORCID verification must be represented separately from a manually declared ORCID.
- Static site owns approved public copy and its machine-readable institutional draft records.
- Atlas owns generated snapshots and their source commit/default-branch SHA, retrieval time, schema version and source URL.
- Método 4L owns curriculum versions, rubrics and learning artifacts.
- LITLE systems own their own evidence artifacts and verification outputs.
- No direct dual writes across databases. Prefer read-only API consumption first; later events must be versioned, idempotent, replay-safe and reconcilable.

Every synchronized record must preserve source URI, source system ID, retrieved/created timestamp, schema version, license/rights where applicable, validation status, and a content digest where integrity checking is useful. A digest alone is not proof of author, time, signature or quality.

## Phased rollout and release gates

### Phase 0 — discovery (implemented here)
- [x] Canonical public repository catalog.
- [x] Explicit distinction between catalogued and verified integration.
- [x] Versioned public discovery route.
- [ ] Verify endpoint on a deployed preview and record HTTP response.
- [x] Publish OpenAPI 3.1 contract for the public discovery endpoint.
- [x] Publish JSON Schema for provenance envelopes; it records provenance facts and does not assert signatures or trusted timestamps.
- [x] Add `contract_tested` as a distinct evidence state between adapter implementation and verified deployment.

The OpenAPI contract is at `docs/api/openapi-v1-ecosystem.yaml`; the provenance envelope schema is at `docs/architecture/provenance-record.schema.json`. The current test suite checks their presence and key invariants, but must still be executed in CI before the contract is considered tested.

### Phase 1 — read-only adapters
- [ ] Confirm public API route schemas and rate limits for each source.
- [ ] Add Zod validation for each remote payload and bounded request timeouts.
- [ ] Store source provenance and deduplicate by stable source ID + source URI.
- [ ] Test malformed, oversized, stale, unavailable and rate-limited responses.
- [ ] Never execute code discovered by Atlas.

### Phase 2 — identity federation
- [ ] Decide canonical OIDC issuer and client registrations.
- [ ] Document claims, audience, scopes, key rotation, account linking and logout.
- [ ] Implement server-side token validation and negative tests.
- [ ] Perform a security review before enabling cross-application sign-in.

### Phase 3 — controlled write/event flows
- [ ] Define event envelope, schema version, event ID, idempotency key, occurredAt, source, subject and payload hash.
- [ ] Add durable queue/outbox, retry/backoff, dead-letter visibility and reconciliation.
- [ ] Enforce per-object authorization and append-only audit events for sensitive transitions.
- [ ] Define deletion, retention, consent, appeals and incident response across owners.

### Phase 4 — trust and evidence
- [ ] Inventory cryptographic code and licensing for both LITLE repositories.
- [ ] Test signature verification with known positive/negative vectors and managed keys.
- [ ] Distinguish content digest, signature, trusted timestamp, attestation, peer review and accreditation.
- [ ] Do not mark a system `verified` without CI, integration-test and deployment evidence tied to a commit SHA.

## Vercel and deployment

Each Next.js app should deploy independently unless a deliberate monorepo migration is approved. Static site, TanStack Start apps, pipelines and curriculum workspace have different build/runtime requirements. For each Vercel project, verify repository linkage, root directory, package manager/lockfile, Node version, build command, environment variables, database migrations, preview smoke tests and domain configuration. Never place private keys, Supabase service-role secrets, OAuth client secrets or Stripe secrets in client-visible variables.

## License and provenance

Public repositories are not automatically licensed for copying or bundling. Before code-level consolidation, verify the root license and relevant asset/dependency licenses in each repository. Until that review is complete, integrate through public metadata and documented APIs; do not copy source code, logos, data or cryptographic implementations across repositories based only on repository visibility.

## Verification record template

For each adapter, record:

- repository and exact commit SHA;
- target environment and timestamp;
- contract/schema version;
- positive and negative test results;
- authorization and privacy checks;
- response latency/error behavior;
- operator/reviewer and known limitations.

Only then may its catalog state advance from `catalogued` to `contracted`, `adapter_implemented`, or `verified`.

## Provenance validation endpoint

`POST /api/v1/provenance/validate` validates a provenance envelope against the v1 Zod schema. It does not perform network requests, store submitted records, or upgrade a record's evidence state. A `200` means schema-valid input only; a `422` returns field-level validation issues; malformed JSON returns `400`; unsupported media type returns `415`; payloads larger than 65,536 bytes return `413`. Responses use `Cache-Control: no-store` and do not echo the submitted record.
