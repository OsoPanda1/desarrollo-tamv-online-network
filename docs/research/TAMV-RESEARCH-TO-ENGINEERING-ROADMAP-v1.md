# TAMV Online Network — Research-to-Engineering Roadmap

**Version:** 1.0 · **Updated:** 2026-11-23 · **Status:** initial literature synthesis; full-text review pending.

This document translates relevant scholarly literature into testable engineering and governance work for the TAMV federation. Literature relevance is not evidence that TAMV has implemented, deployed, certified, or independently validated a control.

## Research corpus

Undermind workspace: [TAMV Online Network — Investigación científica aplicada y evolución de producción](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53)

Completed deep searches:
- [IA confiable, agentes y seguridad de producción](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2FIA%20confiable%2C%20agentes%20y%20seguridad%20de%20producci%C3%B3n) — 297 relevant works in returned results.
- [Arquitecturas soberanas, gobernanza IA y ecosistemas digitales](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2FArquitecturas%20soberanas%2C%20gobernanza%20IA%20y%20ecosistemas%20digitales) — 469 relevant works in returned results.

Additional searches launched:
- [Federated interoperability, identity and API contracts](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Ffederacion%2FInteroperabilidad%20federada%2C%20identidad%20y%20contratos%20de%20API)
- [Open research infrastructure, provenance and verifiable evaluation](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Finvestigacion-abierta%2FInfraestructura%20cient%C3%ADfica%20abierta%2C%20procedencia%20y%20evaluaci%C3%B3n%20verificable)
- [Community platform governance and Latin American digital sovereignty](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Fgobernanza-comunitaria%2FGobernanza%20de%20plataformas%20comunitarias%20y%20soberan%C3%ADa%20digital%20latinoamericana)

**Research limitation:** Undermind reported its free usage limit had been reached; full-text PDF reading and new searches pause until approximately 2026-11-24 00:00 UTC. This initial synthesis uses the returned search summaries, abstracts and bibliographic metadata, not a completed full-text review.

## Findings translated into implementation requirements

### 1. AI agents and Isabella tool security

Indirect prompt injection has been demonstrated in real LLM-integrated applications [Abd23]. AgentDojo offers a benchmark for attacks and defenses in tool-using agents [Deb24]. Design-time defenses, privilege control and information-flow control are promising research directions, but guarantees depend on their threat model and evaluation setup [Deb25, Shi25, Cos25].

Requirements:
- Keep authorization outside the model. A deterministic policy layer must authorize each tool, resource, argument and side effect.
- Default-deny; least privilege; short-lived credentials; never put secrets in prompts, model memory or broadly accessible traces.
- Treat retrieved web pages, files, user-generated content and other agents' messages as untrusted input.
- Require human approval for irreversible or high-impact actions.
- Validate schemas and business semantics; syntactically valid JSON is not proof of authorization or correctness.
- Version adversarial tests and evaluate utility, data leakage, unauthorized actions, fallback safety and recovery independently.
- Never claim universal immunity to prompt injection.

### 2. GitHub CI/CD and supply-chain security

Research on GitHub workflow analysis highlights workflows as a security boundary where untrusted event data, tokens and secrets can interact [Mur23]. Apply:
- Pin third-party Actions to full commit SHAs and review updates.
- Minimize `GITHUB_TOKEN` permissions.
- Isolate untrusted PR validation from secrets and privileged deployment workflows.
- Separate preview and production environments; protect release branches and production approvals.
- Run typecheck, tests, production build, dependency audit, secret scanning and static analysis; preserve actionable logs and bind results to commit SHAs.
- Do not diagnose a failed check without logs. A failed status is a release blocker, not a root-cause explanation.

### 3. Identity federation and API contracts

Formal analysis of OpenID Connect and research on OAuth compliance show that secure federation depends on correct protocol implementation, not merely choosing a standard [Fet17, Phi22]. Self-sovereign identity research also reports continuing challenges around interoperability, revocation and adoption [Sat24].

Requirements:
- Each system remains authoritative for its own data and permissions.
- Validate OIDC issuer, audience, signature, expiry, state/nonce as applicable, and key rotation; link identities by `(issuer, sub)`, not email.
- Enforce server-side object-level authorization and scopes; never trust client-supplied roles.
- Use versioned contracts, idempotency, rate limits, timeouts, correlation IDs and consistent error models.
- No shared session cookies, blind token forwarding or direct writes into another service's database.
- Start with read-only adapters; expand write capabilities only after threat modelling, contract tests and recovery design.

### 4. Open research, provenance and community data

FAIR describes findability, accessibility, interoperability and reuse; it does not require every dataset to be public [Wil16]. CARE complements FAIR with collective benefit, authority to control, responsibility and ethics, especially for Indigenous data futures [Car21]. RO-Crate supports packaging research artefacts and metadata [Soi21], including provenance of workflow runs [Leo23].

Requirements:
- Distinguish public metadata from personal data, secrets, restricted community material and copyrighted assets.
- Record source, version, timestamp, declared authorship, license, transformations and validation evidence.
- Use DOI, ORCID and ROR only where identifiers exist and are verified; never imply accreditation or peer review without evidence.
- Consider RO-Crate/PROV for experiment, dataset and workflow provenance.
- Apply appropriate consent and community review to culturally sensitive material.
- A hash alone does not establish authorship, trusted time, scientific quality or institutional endorsement.

### 5. Governance and accountability

End-to-end algorithmic auditing research supports lifecycle documentation and evaluation [Raj20]. Research on multi-level platform governance frames power allocation and community decision-making as design choices, not automatic consequences of decentralization [Jha21].

Requirements:
- Publish a responsibility matrix for proposal, review, approval, execution, appeal and audit.
- Version policies and model changes; record impact assessments and accountable owners.
- Provide traceable complaints, corrections and appeals.
- Separate moderation, appeal, audit and infrastructure administration where feasible.
- Publish indicators with definitions and methodology; do not present projections as realized impact or revenue.

## Priority backlog

| Priority | Work | Required evidence before closure |
|---|---|---|
| P0 | CI and secret hardening | Successful commit-bound checks, workflow permission review, no secrets in untrusted workflows |
| P0 | Isabella tool authorization | Policy matrix, negative tests, adversarial regression suite |
| P0 | Federation identity boundary | OIDC/OAuth validation tests and cross-object authorization tests |
| P1 | Read-only service adapters | Versioned API contracts, contract tests, timeout and failure behavior |
| P1 | Provenance metadata | Source/version/license/review state for each research artefact |
| P1 | AI audit trail | Versioned evaluations, incident records, release thresholds |
| P2 | CARE/FAIR and community governance | Access, consent, appeal and community review policies |
| P2 | Sustainability | Actual costs, transparent scenarios and measured usage; no unsupported claims |

## Non-negotiable distinctions

1. Catalogued ≠ integrated ≠ verified.
2. Authentication ≠ authorization.
3. Model capability ≠ authority to execute.
4. Hash ≠ signature, trusted timestamp or accreditation.
5. Public source code ≠ unrestricted license to reuse.
6. Research literature ≠ validation of TAMV's implementation.
7. A red CI status ≠ diagnosed root cause.
8. Eight listed repositories ≠ eight production-ready integrations.

## Seed bibliography

- [Abd23] *Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection*. DOI: 10.1145/3605764.3623985.
- [Deb24] *AgentDojo: A Dynamic Environment to Evaluate Attacks and Defenses for LLM Agents*. DOI: 10.48550/arXiv.2406.13352.
- [Deb25] *Defeating Prompt Injections by Design*. DOI: 10.1109/SaTML68715.2026.00040.
- [Shi25] *Progent: Securing AI Agents with Privilege Control*. https://arxiv.org/abs/2504.11703
- [Cos25] *Securing AI Agents with Information-Flow Control*. DOI: 10.48550/arXiv.2505.23643.
- [Rob24] *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*. DOI: 10.6028/nist.ai.600-1.
- [Mur23] *ARGUS: A Framework for Staged Static Taint Analysis of GitHub Workflows and Actions*. https://www.semanticscholar.org/paper/f133e893a8ef96c61a4f63525910c8c0350e1c6b
- [Raj20] *Closing the AI accountability gap: defining an end-to-end framework for internal algorithmic auditing*. DOI: 10.1145/3351095.3372873.
- [Fet17] *The Web SSO Standard OpenID Connect: In-depth Formal Security Analysis and Security Guidelines*. DOI: 10.1109/CSF.2017.20.
- [Phi22] *OAuch: Exploring Security Compliance in the OAuth 2.0 Ecosystem*. DOI: 10.1145/3545948.3545955.
- [Wil16] *The FAIR Guiding Principles for scientific data management and stewardship*. DOI: 10.1038/sdata.2016.18.
- [Car21] *Operationalizing the CARE and FAIR Principles for Indigenous data futures*. DOI: 10.1038/s41597-021-00892-0.
- [Soi21] *Packaging research artefacts with RO-Crate*. DOI: 10.3233/DS-210053.
- [Leo23] *Recording provenance of workflow runs with RO-Crate*. DOI: 10.1371/journal.pone.0309210.
- [Sat24] *A Taxonomy of Challenges for Self-Sovereign Identity Systems*. DOI: 10.1109/ACCESS.2024.3357940.
- [Jha21] *Decentralizing Platform Power: A Design Space of Multi-Level Governance in Online Social Platforms*. DOI: 10.1177/20563051231207857.

## Next review gate

After Undermind's quota resets, read full text for the highest-priority papers, complete the three running searches, and build a matrix mapping each evidence-backed recommendation to a TAMV repository/component, test, result, commit and deployment URL. No control is closed until it has implementation evidence.
