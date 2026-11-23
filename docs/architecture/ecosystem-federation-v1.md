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
- This contract and its explicit state semantics.
- Catalog states are evidence-gated: `catalogued`, `contracted`, `adapter_implemented`, `verified`.
- No secrets, private URLs, tokens, or privileged configuration are returned.

The endpoint is intentionally a discovery document. It does not probe remote systems, does not claim that they are online, and does not establish identity or trust.

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
