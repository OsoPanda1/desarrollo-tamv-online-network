# Core ↔ institutional application federation contract

Status: target architecture and integration contract; **not proof of a live integration**.

Applications in scope:

- Core community/research app: OsoPanda1/desarrollo-tamv-online-network
- Institutional companion: OsoPanda1/tamvonline-weboficial.com

## Non-negotiable boundary

The core currently uses Better Auth with PostgreSQL/Drizzle. The companion has separate Auth0/OIDC and Supabase-backed TAMV ID/member workflows. Treat them as separate security domains until the following contract is implemented and tested. A shared brand, link, email address, copied profile, or client-supplied header does not establish identity or permission.

Do not share raw session cookies, Better Auth session tokens, Auth0 access tokens, Supabase service-role keys, or privileged database credentials between applications.

## Identity contract

1. Select one identity authority for federated sign-in and document issuer, discovery URL, audience, signing algorithms and key-rotation behavior.
2. Validate token signature against trusted issuer keys, issuer, audience, expiry, not-before and authorized client. Reject unsigned tokens, algorithm confusion, unknown issuers and malformed claims.
3. Map the external identity using the stable pair (issuer, subject); never use mutable email as the primary identity key.
4. Keep an application-local user ID. Linking accounts requires an authenticated session for both identities or a separately reviewed recovery flow.
5. Authorization remains local to each application. A valid identity token does not grant moderator, administrator, reviewer, or data-export permissions.
6. Define logout, token expiry, account disablement, unlinking, session revocation and incident-response behavior across both applications.
7. Use secure, HttpOnly, appropriately SameSite cookies; never attempt cross-domain session sharing through JavaScript-readable storage.

## Data ownership and provenance

Before synchronizing records, assign one canonical owner per entity:

| Entity | Required decision |
|---|---|
| TAMV ID/member identity | Issuer, immutable ID, lifecycle and merge policy |
| Researcher profile | Canonical record and ORCID/ISNI verification status |
| Project/topic/proposal | Owning application, status state machine and edit authority |
| Evidence/DOI/external metadata | Provider, canonical URL, retrieval time, license and validation state |
| Moderation/appeal | Authoritative decision source, appeal lifecycle and audit retention |
| Public metrics | Definition, time window, source query and last-verified timestamp |

Synchronize by versioned APIs or signed event contracts with idempotency keys, replay protection, bounded retries and dead-letter visibility. Do not dual-write directly to both databases without a reconciliation strategy.

## API contract

- Use versioned endpoints and explicit request/response schemas.
- Authenticate service-to-service calls with short-lived credentials and least privilege.
- Validate issuer/audience or service identity on every request; do not trust caller-provided role headers.
- Apply object-level authorization, request-size limits, rate limits, timeouts and safe error responses.
- Include correlation IDs, event ID, schema version, source system and occurred-at time.
- Make retries idempotent and define conflict resolution before enabling writes.
- Keep secrets server-only and rotate them without requiring client rebuilds where the platform supports runtime secrets.

## Rollout sequence

1. Document canonical identity and entity ownership.
2. Implement read-only identity verification in a non-production environment.
3. Add mapping and audit events; test duplicate, unlinked, disabled and revoked identities.
4. Integrate read-only metadata APIs with provenance and bounded caching.
5. Add writes only after idempotency, conflict handling, authorization and recovery tests pass.
6. Run a limited pilot with explicit rollback and reconciliation procedures.
7. Promote only after test evidence and owner approval.

## Acceptance tests

- invalid signature, wrong issuer/audience, expired token and unknown key are rejected;
- email changes do not create a second identity;
- a valid user cannot inherit another user's projects or moderation permissions;
- revoked/disabled identities lose access within the documented revocation window;
- duplicate event delivery does not duplicate records or audit transitions;
- provider timeout/outage fails safely and can be reconciled;
- provenance and consent survive synchronization and export;
- no credentials, session tokens or unnecessary personal data appear in logs.

Until these tests pass against both systems, describe federation as **planned/contracted**, not integrated or operational.
