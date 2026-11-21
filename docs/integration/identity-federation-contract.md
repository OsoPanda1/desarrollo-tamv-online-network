# Identity and data federation contract — core + institutional companion

Status: proposed integration contract. This file does not implement OIDC federation, validate remote tokens, or merge account stores.

## Systems and trust boundary

- Core application: Next.js, Better Auth and PostgreSQL/Drizzle in this repository.
- Institutional companion: separate Auth0/OIDC and Supabase-backed identity/member workflows in OsoPanda1/tamvonline-weboficial.com.
- Until an explicit protocol is implemented and tested, these are separate security domains. A link between pages, shared display name, TAMV ID, ORCID, or ISNI is not proof that two sessions belong to the same person.

## Required architecture decision

Choose one canonical identity provider for cross-application sign-in. If Auth0 is selected, the core must act as an OIDC relying party using the maintained provider integration and the companion/Auth0 tenant as issuer. If Better Auth remains canonical, the companion must validate a documented OIDC issuer and audience rather than trusting core cookies or accepting arbitrary Supabase user IDs. Do not implement both directions simultaneously without an approved trust model.

## Token acceptance rules

The consuming application must validate, using a maintained OIDC/JWT library:
- exact issuer (iss) against a configured allowlist;
- intended audience (aud) and authorized party (azp) where applicable;
- signature against issuer JWKS, allowed algorithms only, and key rotation;
- expiration (exp), issued-at (iat), not-before (nbf) when present, and clock-skew policy;
- nonce/state/PKCE for browser authorization-code flows;
- exact redirect URI registered with the provider;
- account status, required authentication strength and revocation/logout behavior.

Never accept an ID token as an API access token. Never trust a JWT merely because it decodes. Never accept an arbitrary JWKS URL or issuer supplied by a request.

## Account linking and TAMV ID

- Use the immutable pair (issuer, subject) as the external identity key. Email, display name, ORCID and ISNI are attributes, not primary account-link keys.
- Require proof of control of both accounts before linking; require recent reauthentication for sensitive linking/unlinking.
- Keep a server-side mapping from external subject to local user ID. Do not expose internal IDs or tokens unnecessarily.
- TAMV ID is a product identifier, not a bearer credential and not a substitute for OIDC subject validation.
- ORCID/ISNI verification must be stored separately from a user-declared value, including source, retrieval time, result and status.
- Prevent account enumeration and email-based automatic account merging.

## Authorization and data ownership

Authentication does not imply authorization. Each service retains local authorization decisions and checks the local record owner, role, consent and state for every operation. The companion's admin role must not automatically become a core admin role. Map roles through a versioned, explicit allowlist and default to the least-privileged local role.

Do not share Better Auth cookies with Auth0, copy raw session tokens between services, or store long-lived access/refresh tokens in browser local storage. Prefer authorization-code flow with PKCE, secure HttpOnly cookies and server-side token handling.

## Logout, revocation and incidents

Define front-channel/back-channel logout support, local session invalidation, provider token revocation where supported, key rotation, account unlinking, lost-account recovery and breach response before enabling production federation. A provider outage must not silently grant elevated access or bypass local checks.

## Versioned API boundary

Cross-application service calls must use a dedicated audience, short-lived service credentials or workload identity, explicit scopes, request IDs, timeouts, bounded payloads and audit events. Do not reuse a user's browser cookie as a service-to-service credential. Each endpoint must document schema version, data classification, purpose, retention, rate limits and error semantics.

## Rollout sequence

1. Approve canonical issuer, audience, callback domains, account ownership and role mapping.
2. Register separate development, preview and production clients with exact redirect URIs.
3. Implement login, callback, session renewal, logout and account-linking tests in a feature flag.
4. Test invalid issuer/audience/signature, expired tokens, replay, revoked accounts, role mismatch and provider outage.
5. Pilot with non-privileged accounts and audit events; never migrate administrator privileges automatically.
6. Reconcile accounts with explicit user confirmation and a reversible migration plan.
7. Enable production only after security review and rollback rehearsal.

## Acceptance criteria

Federation is not complete until automated tests prove the token-validation matrix, account-linking proof, role isolation, logout/revocation behavior, audit traceability, and failure-closed behavior. A shared profile page or matching email is not sufficient evidence.
