# TAMV Online Network — Evidence-to-Production Research Plan

**Version:** 1.0  
**Prepared:** 2026-11-23  
**Status:** implementation plan; scholarly review is in progress. This document is not a security certification, deployment attestation, or claim that all recommendations are implemented.

## Purpose

Convert research into testable engineering decisions for TAMV Online Network without turning aspirational architecture into unsupported production claims. This plan applies to the Next.js/TypeScript application, PostgreSQL/Drizzle data layer, Better Auth session boundary, public API, HCU observatory, research/proposal workflows, membership/course functionality, and any future identity federation or AI tools.

The primary operational rule is:

> A paper or standard can justify a design hypothesis; only code review, automated tests, controlled experiments, and deployment evidence can demonstrate that TAMV implements it correctly.

## Evidence model

Every relevant capability must be assigned one of these states:

1. **Proposed** — a design intention, not yet implemented.
2. **Implemented** — code exists and has been reviewed, but runtime behavior may remain untested.
3. **Tested** — reproducible test evidence exists for the stated scenario and commit.
4. **Deployed** — an identified deployment runs a specific commit.
5. **Production-verified** — the exact deployment has passed required security, workflow, recovery, observability and operational checks.

A DOI, repository URL, ORCID/ISNI identifier, checksum, passing unit test, successful build or HTTP 200 is not independently sufficient to prove institutional legitimacy, scientific validity, cryptographic authenticity, data quality or end-to-end production readiness.

## Research findings with actionable implications

### 1. AI-agent and tool security

**Ferrag et al. (2025), “From Prompt Injections to Protocol Exploits: Threats in LLM-Powered AI Agents Workflows.”**  
[DOI: 10.1016/j.icte.2025.12.001](https://doi.org/10.1016/j.icte.2025.12.001)

The review describes risks across input manipulation, model/context compromise, privacy/system attacks and agent-protocol integration. Its examples show why a safe-looking prompt or model response cannot replace authorization and validation at the tool boundary. Some proposed protocol mitigations are threat-to-control recommendations rather than experimentally established guarantees; reported attack success rates across different studies are not directly comparable.

**Engineering decisions**
- Treat retrieved web pages, external metadata, user documents and model-generated tool arguments as untrusted input.
- Validate every tool call against a server-side schema and policy; do not allow the model to grant itself permissions.
- Keep read, write, publish, delete, payment and administration capabilities separate.
- Use least privilege, scoped credentials, short credential lifetimes, rate limits, request budgets and idempotency where applicable.
- Record actor, operation, target resource, authorization decision, outcome and correlation ID; exclude secrets and unnecessary personal data.
- Require explicit human approval for consequential or hard-to-reverse actions. Approval does not replace authorization.
- Red-team direct and indirect prompt injection, adaptive attacks, malicious documents and tool-protocol abuse.

**Chhabra et al. (2025/2026), “Agentic AI Security: Threats, Defenses, Evaluation, and Open Challenges.”**  
[DOI: 10.1109/ACCESS.2026.3675554](https://doi.org/10.1109/ACCESS.2026.3675554)

The survey emphasizes that autonomy, memory and tool access can turn model errors into external side effects. It supports defense in depth: bounded tools, runtime policy enforcement, sandboxing, monitoring, human oversight and process-aware evaluation. The survey also notes limitations of static filters, benchmark fidelity, sandboxing and human confirmation.

**Engineering decisions**
- Evaluate intermediate actions and tool calls, not only the final answer.
- Test unauthorized access, unsafe redirects, repeated actions, malformed tool inputs and attempts to cross user/tenant boundaries.
- Maintain kill switches and rollback/recovery paths for any future agentic workflow.
- Do not describe Isabella or TAMV as autonomous authority. Model capability, authorization, execution and evidence remain distinct.

**Yi et al. (2024), “Jailbreak Attacks and Defenses Against Large Language Models: A Survey.”**  
[DOI: 10.48550/arXiv.2407.04295](https://doi.org/10.48550/arXiv.2407.04295)

Use this survey as a threat taxonomy and evaluation input, not as proof that any single guardrail blocks jailbreaks. Prompt-level filters should be treated as one layer among server-side permissions, validation, monitoring and adversarial testing.

### 2. Federated identity and digital public infrastructure

**Degen & Teubner (2024), “Wallet wars or digital public infrastructure? Orchestrating a digital identity data ecosystem from a government perspective.”**  
[DOI: 10.1007/s12525-024-00731-1](https://doi.org/10.1007/s12525-024-00731-1)

The study analyzes identity ecosystems as coordinated networks of issuers, wallet providers, relying parties, users and orchestration/regulatory roles. It identifies tensions between usability, security/privacy, market diversity, sovereignty and monetization. Its empirical context is Germany and natural-person identity wallets; transfer to Latin America requires local validation.

**Engineering decisions**
- Define explicit issuer, verifier, relying-party, platform-operator and user responsibilities before federating identity.
- Validate token issuer, audience, signature, expiry and intended use; map external identity to a stable local subject without treating a provider login as blanket authorization.
- Keep local authorization, consent, revocation and account recovery under explicit policy.
- Use data minimization and purpose limitation; do not request or store identity attributes merely because a provider exposes them.
- Specify interoperability at technical, semantic and governance levels, and document who resolves disputes and security incidents.

**Giannopoulou (2023), “Digital Identity Infrastructures: A Critical Approach of Self-Sovereign Identity.”**  
[DOI: 10.1007/s44206-023-00049-z](https://doi.org/10.1007/s44206-023-00049-z)

Treat self-sovereign identity as a governance and power-distribution question as well as a technical pattern. Avoid claims that decentralization automatically produces user control, privacy or accountability; verify actual trust anchors, revocation, recovery, usability and institutional responsibilities.

### 3. Research provenance and persistent identifiers

**Cousijn et al. (2021), “Connected Research: The Potential of the PID Graph.”**  
[DOI: 10.1016/j.patter.2020.100180](https://doi.org/10.1016/j.patter.2020.100180)

Persistent identifiers and explicit metadata relationships can connect people, organizations, publications, datasets, software and funders. The value depends on metadata quality, reliable identifiers, declared relationships and sustainable community governance. A visible identifier or URL alone does not verify an underlying claim.

**Engineering decisions**
- Store canonical identifier, source provider, retrieval time, record version, license/terms where applicable and verification status.
- Preserve relationship provenance: who asserted the relationship, when, based on which source, and whether the provider confirms it.
- Distinguish syntactic validation (format/check digit), provider resolution, record matching, owner authorization and independent verification.
- Do not infer peer review, institutional incorporation, funding, affiliation or scientific impact from a DOI, ORCID, ISNI or ROR identifier alone.
- Make external metadata refreshes traceable and idempotent; do not silently overwrite user-curated claims.

### 4. Public-interest AI governance

**Züger & Asghari (2022), “AI for the public: How public interest theory shifts the discourse on AI.”**  
[DOI: 10.1007/s00146-022-01480-5](https://doi.org/10.1007/s00146-022-01480-5)

Use public-interest analysis to ask who benefits, who bears risks, who can contest decisions, and which public values are preserved. This is a governance lens, not a technical control or proof of impact.

**Engineering decisions**
- Publish scope, limitations, conflicts of interest, moderation/appeal pathways and data-use boundaries.
- Ensure proposal and review workflows distinguish self-declared statements from moderator-reviewed or independently verified claims.
- Make the platform’s claims and release status understandable to researchers, developers, territorial communities and potential supporters.
- Avoid presenting a proposed collaboration or external link as an endorsement, partnership or guaranteed opportunity.

## Priority implementation backlog

| Priority | Work item | Acceptance evidence |
|---|---|---|
| P0 | Recover actionable GitHub Actions failure diagnostics | Step-level logs or reproducible local CI output; cause documented without guesswork |
| P0 | Align CodeQL action major versions | Workflow uses a consistent pinned CodeQL action release; a successful run is recorded |
| P0 | Re-establish reproducible release gates | Frozen pnpm install, tests, typecheck, build, dependency audit, CodeQL and secret scan pass on the same candidate SHA |
| P0 | Verify Vercel project ownership/linkage for this repository | Project ID, repository link, production branch, root directory and deployment SHA confirmed |
| P0 | Keep payment live mode disabled until end-to-end verification | Stripe test checkout, signature-verified webhook, idempotency, subscription state, cancellation and owner-only portal tests |
| P0 | Confirm database recovery and migration process | Disposable-database preflight, migration, postflight and successful restore drill |
| P1 | Authorization matrix for all sensitive routes | Tests cover anonymous, owner, other user, moderator/editor/admin and revoked session |
| P1 | External identity federation contract | Issuer/audience/signature/expiry tests, stable subject mapping, revocation and local authorization tests |
| P1 | Research provenance schema | Tests for source, retrieval time, version, license, relationship provenance and verification state |
| P1 | AI-tool security contract for future integrations | Tool allowlist, typed arguments, policy gate, rate/budget limits, audit events and adversarial tests |
| P1 | HCU evidence semantics | Versioned schema with source, scale/unit, provenance, uncertainty and explicit distinction between simulation and observed data |
| P2 | Accessibility and multilingual verification | Keyboard-only flow, reduced-motion behavior, responsive checks, ES/EN parity and documented assistive-technology testing |
| P2 | Adoption measurement | Privacy-respecting event definitions, baseline and reporting window; publish “not measured” until telemetry is verified |

## Production release procedure

1. Freeze the candidate commit; do not release from an unreviewed working tree.
2. Run pnpm install --frozen-lockfile, pnpm test, pnpm typecheck, pnpm build and pnpm audit --prod --audit-level high.
3. Review CodeQL and secret-scanning results. A missing log or a failed workflow with no steps is **blocked/unknown**, not passed and not automatically an application defect.
4. Verify all production environment variables in the platform secret manager. Never copy secret values into issues, commits, logs or this document.
5. Confirm the Vercel project is linked to the intended repository and branch. Deploy a preview first and record its deployment URL and commit SHA.
6. Test health/readiness, authentication, ownership boundaries, public API, proposal/moderation flows, HCU, course entitlements and all error states.
7. Test database migration and restore in a disposable environment before touching production data.
8. Keep Stripe in test mode until checkout, signed webhook delivery, duplicate/reordered events, renewal failures, cancellation and entitlement revocation pass.
9. Promote only the approved SHA. Verify the deployed SHA, runtime logs, domain and critical user journeys.
10. Record results, exceptions, owner and expiry. Roll back or halt if identity, privacy, data integrity, payment or secret handling fails.

## Current limitations and non-claims

- This document does not certify that TAMV is legally incorporated or registered with ROR.
- A ROR identifier is not a business-incorporation certificate; the ROR registry has its own inclusion criteria.
- Research references are not endorsements of TAMV and do not independently validate TAMV's architecture.
- A code path, test fixture or workflow file does not prove runtime behavior.
- The repository's public visibility does not grant a software license. The root-license decision remains a maintainer/legal decision.
- No adoption, conversion, latency, availability or impact percentage should be published unless backed by measured, reproducible evidence.
- A green CI run is necessary but not sufficient for production release.

## Research workspace

The associated Undermind workspace contains two ongoing deep searches:
- Architectures, AI governance and digital ecosystems.
- Trustworthy AI, agent workflows and production security.

Workspace: https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53

The bibliography and this plan should be updated when those searches complete, with the final selected papers read in full text and their limitations recorded.