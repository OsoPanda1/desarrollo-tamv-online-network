# LATAMV Governance System — Production Readiness Gates

**Status:** implementation work in progress; not approved for production.  
**Owner:** TAMV Online Network.  
**Scope:** release controls for the founder-only LGS workspace and its governance tooling.

This document is a release checklist, not a certificate, legal opinion, or assertion that any control has passed.

## Release policy

The workspace must remain unavailable unless every mandatory gate is evidenced. An email address is an identity attribute, not an authentication factor. `LGS_FOUNDER_ACCESS_ENABLED` must remain unset or `false` until the authorization path has been independently reviewed.

## Gate A — Confidentiality and repository hygiene

- [ ] Decide whether the repository may remain public.
- [ ] Review all commits and PR history for confidential material; removing a file from the current tree does not remove earlier public commits.
- [ ] If confidentiality is required, complete an approved history rewrite/rotation plan and verify the resulting remote history before publishing again.
- [ ] Store canonical private specification only in a server-side secret/configuration store; never use a `NEXT_PUBLIC_` variable.
- [ ] Confirm unauthorized users receive no specification content, metadata, previews, cached copies, or export endpoints.
- [ ] Check logs, error pages, source maps, build artifacts and analytics for accidental disclosure.

## Gate B — Founder authentication and authorization

- [ ] Use a verified identity provider account matching the configured founder identity.
- [ ] Enforce phishing-resistant MFA (passkey/WebAuthn or FIDO2) and fresh step-up authentication for sensitive access.
- [ ] Verify authorization from the server-side user record on every request; never trust client-provided roles or email claims alone.
- [ ] Keep access denied by default and require an explicit server-side feature flag.
- [ ] Test sign-out, session expiry, account disablement, role downgrade, session revocation and replay scenarios.
- [ ] Apply rate limiting, safe error messages, secure cookies, CSRF/origin protections and security event logging.
- [ ] Define a secure recovery path that does not bypass MFA or rely on email access alone.

## Gate C — Application and API security

- [ ] Confirm every page, server action, route handler, download, export and API independently enforces authorization.
- [ ] Apply least privilege to database credentials and deployment tokens.
- [ ] Validate all input at trust boundaries; bound request size, collection length and computational cost.
- [ ] Use parameterized database queries and transaction boundaries where appropriate.
- [ ] Do not log passwords, session tokens, access tokens, raw sensitive prompts or personal data unnecessarily.
- [ ] Complete dependency, secret, static-analysis and supply-chain scans; triage all high/critical findings.
- [ ] Verify security headers, CSP, cache-control for private responses, and that private pages cannot be indexed or cached publicly.

## Gate D — Integrity and evidence

- [ ] Execute canonicalization and Merkle inclusion test vectors, including malformed and adversarial inputs.
- [ ] Execute audit-chain tamper tests and verify chain sequence, previous-hash links and event hashes.
- [ ] Apply migration 0005 only after a tested backup and strict database preflight; verify the append-only trigger and least-privilege database grants.\n- [ ] Add authenticated signatures to checkpoints; hashing alone does not prove authorship.
- [ ] Anchor checkpoints with an independent witness or append-only external store to detect truncation/equivocation.
- [ ] Define durable retention, access control, backup, restoration and key rotation.
- [ ] Redact or pseudonymize actor/subject references and avoid placing sensitive data directly in immutable logs.
- [ ] Document algorithm versions, canonicalization rules, timestamp source and verification procedure.

## Gate E — Risk and lifecycle controls

- [ ] Treat numerical risk scores as triage only; rights, safety and oversight vetoes must remain non-compensatory.
- [ ] Require documented human review and authorized approval for high/critical use cases.
- [ ] Ensure every lifecycle gate blocks when evidence is missing, stale, invalid or not explicitly approved.
- [ ] Record risk owner, residual risk, expiry/review date, mitigation and rollback plan.
- [ ] Reassess after model, data, provider, purpose, prompt/tooling or deployment changes.

## Gate F — Build, test and deployment

- [ ] `pnpm install --frozen-lockfile` succeeds from a clean checkout.
- [ ] `pnpm test` passes, including Merkle, audit-chain, risk-engine and lifecycle-gate suites.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` passes.
- [ ] Dependency audit and secret scanning are reviewed; unresolved high/critical issues block release.
- [ ] Preview tests cover unauthenticated, wrong-account, unverified-email, non-admin, feature-flag-off, expired-session and MFA-not-satisfied cases.
- [ ] Manual accessibility, mobile/responsive, browser and cache-isolation tests pass.
- [ ] Rollback procedure is tested; release owner and incident contact are recorded.
- [ ] Production enablement is a separate, explicit change after independent review.

## Evidence status vocabulary

Use only these labels per control:

- **SPECIFIED** — written requirement exists.
- **IMPLEMENTED** — code/configuration exists in the named commit.
- **TESTED** — automated or manual test evidence is attached.
- **INDEPENDENTLY REVIEWED** — reviewer and scope are documented.
- **PRODUCTION VERIFIED** — evidence comes from the deployed production version.

Do not promote a control to a higher state without linked evidence, timestamp, tested commit and reviewer identity.

## Current known blockers

1. The PR has prior commits that contained specification documents. Since the repository is public, the historical blobs remain reachable until an approved history remediation is completed.
2. Founder MFA/step-up and its recovery procedure are not implemented and independently tested.
3. The canonical private specification secret must be configured in the deployment environment without exposing it to client bundles.
4. The risk engine, lifecycle gates and hash-linked audit-chain modules require CI execution and typecheck/build verification.
5. The restricted audit-ledger schema, migration and founder-gated API are implemented in the PR branch but are not yet applied to a database or verified in deployment. Signed checkpoints and independent witnesses are not implemented.
6. No production release is authorized by this checklist.

## Release decision

**Current decision: NO-GO.** Keep the access feature flag disabled until every mandatory gate is evidenced and the final production commit has passed review.
