# TAMV Online Network — Research-to-Engineering Roadmap

**Version:** 1.0 · **Date:** 2026-11-23 · **Status:** initial synthesis; full-text review pending.

This roadmap translates scholarly literature into testable requirements for TAMV's federated systems. The existence of a paper or standard does not prove TAMV's implementation, deployment, compliance, certification, or impact.

## Research workspace and current coverage

Workspace: [TAMV Online Network — Investigación científica aplicada y evolución de producción](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53)

Completed deep searches:
- [IA confiable, agentes y seguridad de producción](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2FIA%20confiable%2C%20agentes%20y%20seguridad%20de%20producci%C3%B3n): 297 relevant works returned.
- [Arquitecturas soberanas, gobernanza IA y ecosistemas digitales](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2FArquitecturas%20soberanas%2C%20gobernanza%20IA%20y%20ecosistemas%20digitales): 469 relevant works returned.

New deep searches launched:
- [Federated interoperability, identity and API contracts](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Ffederacion%2FInteroperabilidad%20federada%2C%20identidad%20y%20contratos%20de%20API)
- [Open research infrastructure, provenance and verifiable evaluation](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Finvestigacion-abierta%2FInfraestructura%20cient%C3%ADfica%20abierta%2C%20procedencia%20y%20evaluaci%C3%B3n%20verificable)
- [Community governance and Latin American digital sovereignty](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Fgobernanza-comunitaria%2FGobernanza%20de%20plataformas%20comunitarias%20y%20soberan%C3%ADa%20digital%20latinoamericana)

**Evidence limitation:** Undermind reported that the free usage limit had been reached; PDF full-text reading and new searches pause until approximately 2026-11-24 00:00 UTC. This initial synthesis is based on search summaries, abstracts and bibliographic metadata, not a completed full-text review.

## 1. Agent security and Isabella

Indirect prompt injection has been demonstrated in real LLM-integrated applications [Abd23]. AgentDojo provides a benchmark for evaluating attacks and defenses in tool-using agents [Deb24]. Design-time defenses, privilege control and information-flow control are promising, but results depend on their threat model and evaluation environment [Deb25, Shi25, Cos25].

Requirements:
- The model proposes actions; a deterministic policy layer authorizes each tool, argument, resource and side effect.
- Default-deny, least privilege, short-lived credentials; never expose secrets to prompts, memory or broadly accessible traces.
- Treat retrieved webpages, files and inter-agent messages as untrusted.
- Require human approval for irreversible or high-impact operations.
- Validate schema and business semantics; valid JSON does not establish correctness or authorization.
- Maintain versioned adversarial tests for prompt injection, data leakage, unauthorized actions, fallback behavior and recovery.
- Never claim universal immunity to prompt injection.

## 2. GitHub CI/CD and supply-chain security

Research on GitHub workflow analysis treats workflows as a security boundary where untrusted event data, tokens and secrets can interact [Mur23].

Requirements:
- Pin third-party Actions to full commit SHAs and review updates.
- Minimize `GITHUB_TOKEN` permissions.
- Isolate untrusted PR checks from secrets and privileged deployment workflows.
- Separate preview and production environments.
- Preserve commit-bound logs for typecheck, tests, production build, dependency audit, secret scanning and static analysis.
- A failed status is a release blocker, not a root-cause diagnosis; diagnose only from evidence.

## 3. Federated identity and APIs

Formal analysis of OpenID Connect and research on OAuth compliance show that secure federation depends on correct implementation, not merely selecting a standard [Fet17, Phi22]. Self-sovereign identity literature identifies persistent interoperability, revocation and adoption challenges [Sat24].

Requirements:
- Each system remains authoritative for its own data and permissions.
- Validate issuer, audience, signature, expiry, state/nonce where applicable, and key rotation; map identities by `(issuer, sub)`, not email.
- Enforce server-side object authorization and scopes; never trust client-supplied roles.
- Use versioned contracts, idempotency, rate limits, timeouts, correlation IDs and consistent error handling.
- No shared session cookies, blind token forwarding or direct writes into another service's database.
- Start with read-only adapters; expand only after threat modelling, contract tests and recovery design.

## 4. Open research and provenance

FAIR promotes findability, accessibility, interoperability and reuse, but does not mean all data must be public [Wil16]. CARE complements FAIR with collective benefit, authority to control, responsibility and ethics, particularly for Indigenous data [Car21]. RO-Crate supports packaging research artefacts and metadata [Soi21] and recording workflow provenance [Leo23].

Requirements:
- Distinguish public metadata from personal data, secrets, restricted community material and copyrighted assets.
- Record source, version, date, declared authorship, license, transformations and validation evidence.
- Use DOI/ORCID/ROR only when identifiers exist and are verified.
- Consider RO-Crate/PROV for experiments, datasets and workflow runs.
- Apply appropriate consent and community review to culturally sensitive material.
- A hash alone does not establish authorship, trusted time, scientific quality or endorsement.

## 5. Governance and accountability

End-to-end algorithmic auditing research supports lifecycle documentation and evaluation [Raj20]. Research on multi-level platform governance treats power allocation and community decision-making as explicit design choices [Jha21].

Requirements:
- Publish a responsibility matrix for proposal, review, approval, execution, appeal and audit.
- Version policies and model changes; record impact assessments and accountable owners.
- Provide traceable complaints, corrections and appeals.
- Separate moderation, appeals, audit and infrastructure administration where feasible.
- Publish indicators with definitions and methodology; distinguish projections from measured impact or revenue.

## Priority backlog and acceptance evidence

| Priority | Work | Evidence required to close |
|---|---|---|
| P0 | CI and secrets | Successful commit-bound checks; reviewed workflow permissions; no secrets in untrusted workflows |
| P0 | Isabella tool authorization | Policy matrix, negative tests, adversarial regression suite |
| P0 | Federation identity | OIDC/OAuth validation and cross-object authorization tests |
| P1 | Read-only adapters | Versioned contracts, contract tests, timeout and failure behavior |
| P1 | Provenance | Source, version, license and review status for each artefact |
| P1 | AI audit trail | Versioned evaluations, incidents and release thresholds |
| P2 | CARE/FAIR governance | Access, consent, appeals and community-review policies |
| P2 | Sustainability | Actual costs and transparent scenarios; no unsupported claims |

## Non-negotiable distinctions

1. Catalogued ≠ integrated ≠ verified.
2. Authentication ≠ authorization.
3. Model capability ≠ authority to execute.
4. Hash ≠ signature, trusted timestamp or accreditation.
5. Public source code ≠ unrestricted license to reuse.
6. Published research ≠ validation of TAMV implementation.
7. Red CI status ≠ diagnosed root cause.
8. Eight catalogued repositories ≠ eight production-ready integrations.

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

After the quota resets, read full text for the highest-priority papers, complete the three new searches, and map each evidence-backed recommendation to a TAMV repository/component, test, result, commit and deployment URL. No control is closed without implementation evidence.
