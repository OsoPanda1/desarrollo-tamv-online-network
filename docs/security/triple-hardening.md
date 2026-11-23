# TAMV Triple Hardening Standard

Status: implementation standard, not a security certification. Scope: application, companion site, APIs, databases, CI/CD, AI agents and evidence records.

Triple hardening means three independently reviewed control planes. It does not mean stacking three encryption algorithms over the same payload. Each layer should address different failure modes and remain operable during key loss, provider outage and incident response.

## Plane A — cryptography, storage and evidence

- Enforce HTTPS/TLS at edge and service boundaries; reject insecure production origins.
- Use managed encryption at rest. Add application-level authenticated encryption only for sensitive fields with a documented threat model.
- Prefer standard AEAD such as AES-256-GCM or ChaCha20-Poly1305 through maintained platform libraries. Generate a unique nonce per encryption under each key; authenticate record ID, tenant, schema version and purpose as associated data.
- Store keys in managed KMS/secret infrastructure, separately from ciphertext. Never commit keys or expose them in client bundles.
- Version encrypted envelopes and document rotation, migration, revocation and recovery. Fail closed on authentication-tag errors.
- Use SHA-256 or stronger digests for content change detection. A digest is not encryption, a signature, trusted time or proof of authorship.
- Sign institutional decisions only with controlled signing keys and canonical payloads. Include key ID, algorithm, timestamp source, schema version and revocation status.
- Do not claim post-quantum security unless interoperable PQC is implemented and tested with a real key lifecycle.
- Encrypt backups, restrict access, monitor and test restoration.

## Plane B — application, identity and execution

- Deny by default. Authenticate before private reads and authorize each operation against owner, role, state and tenant.
- Use HttpOnly, Secure production cookies, appropriate SameSite policy, root path and session rotation after authentication/privilege changes.
- Validate request bodies and query parameters server-side; bound payload size, pagination, timeouts and outbound requests.
- Prevent IDOR/BOLA by checking ownership on every resource lookup. Unguessable IDs are not authorization.
- Rate-limit login, registration, search, proposals, appeals, AI inference, exports and notifications.
- Defend against CSRF, open redirects, XSS, SQL injection, SSRF, unsafe uploads, prompt injection and resource exhaustion.
- Treat retrieved documents and user content as untrusted data, never as system instructions. Keep AI tool permissions server-side, allowlisted and bounded; require human approval for consequential actions.
- Pin dependencies, scan vulnerabilities and secrets, generate an SBOM, and tie release artifacts to commits and workflow runs.

## Plane C — governance and operations

- Classify data; define purpose, consent, visibility, retention, deletion and appeal procedures.
- Record append-only security events with actor, action, target, timestamp, request/trace ID, outcome and reason. Never log passwords, bearer tokens or unnecessary sensitive content.
- Require review for security-sensitive changes and separate deployment privileges where feasible.
- Maintain incident response, vulnerability disclosure, backup/restore, continuity, provider outage and key-compromise runbooks.
- Track each control with owner, status, evidence, last-tested date and next review. Documentation alone is not proof of implementation.
- Maintain editorial corrections and provenance for institutional claims, public metrics, research evidence and AI summaries.

## Mandatory release gates

1. Clean install from committed lockfile.
2. Typecheck, lint, unit/integration tests and production build.
3. Migration apply and recovery test on a disposable database.
4. Authorization tests for anonymous, owner, other user, moderator and administrator.
5. Secret scan, dependency audit and confirmation privileged credentials remain server-only.
6. Route smoke tests and a health check that never leaks environment values.
7. Backup restoration drill and incident-runbook review before handling high-value records.

## AI policy

Agents may summarize, classify, retrieve, recommend and draft. They cannot grant themselves authority, bypass access controls, make governance decisions solely from model output, or execute irreversible actions without a separately authorized path. Record provider/model where available, policy version, retrieval sources, tool calls, approvals and uncertainty where proportionate.

## Claim boundaries

Do not claim “triple encrypted”, “zero trust”, “quantum secure”, “tamper-proof” or “certified” unless the precise implementation and evidence justify the claim. Map every standard control to code/configuration and tests before marking it implemented.
