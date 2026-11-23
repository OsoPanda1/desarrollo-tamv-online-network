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



## Research update — 23 November 2026

The three specialized Undermind searches are now marked **completed**. Their results are based on available abstracts and metadata; full-text PDF review remains pending because the free reading quota was still active.

### Federated interoperability and API contracts

The search returned 209 relevant works. Main conclusion: a shared catalog or identity provider does not itself create trust. The resource-owning domain must verify authorization for each operation.

- Follow OAuth 2.0 Security BCP, restrict tokens to intended resources, and evaluate mTLS-bound tokens or DPoP based on a threat model; do not add mechanisms without validating provider support. [Lod25]
- Preserve service ownership of data and avoid cross-service database writes; microservice data coordination has persistent consistency and transaction challenges. [Lai21]
- Version API contracts, preserve backward compatibility, communicate changes and test consumers against providers. Interviews across 11 companies identified outdated consumers and change-impact analysis as practical challenges. [Ler23]
- Event-driven systems commonly face schema, payload size, ordering, audit and debugging problems. [Lai24]
- Consumer-driven contract testing can detect syntactic incompatibilities before production. [Sch25c]
- Differential regression tests across 17 versions of Azure APIs detected 14 regressions; this supports testing both API specifications and service behavior, but does not guarantee exhaustive detection. [God20]
- Zero-trust federation using attestation has proof-of-concept evidence only; this is not evidence that TAMV itself is Zero Trust. [Poi25b]

**Implementation decision:** versioned OpenAPI contracts, read-only adapters first, consumer/provider contract tests in CI, idempotency, rate limits, timeouts, correlation IDs and recovery behavior. For asynchronous messaging, assume at-least-once delivery and make consumers idempotent unless stronger guarantees are proven for the specific system.

### Open research infrastructure and provenance

The search returned 189 relevant works. Mature practices include DOI for outputs and versions when applicable, ORCID for people, ROR for organizations, interoperable metadata, W3C PROV for provenance and RO-Crate for packaging research artefacts and execution context. Retain source language and evaluate discovery in Spanish and Portuguese.

FAIR should be treated as an incremental diagnostic, not a universal score: tools and metrics may diverge, so publish the criteria, version, scope and results of each assessment. GRADE should not be used as a universal quality scale for a general technology platform. Verifiable credentials and trust registries remain better treated as scoped pilots than replacements for provenance or governance.

**Implementation decision:** build a metadata register that records source, version, license, language, relationships, review state and validation evidence; support interoperable export; pilot RO-Crate/PROV on selected projects; document the criteria used for any FAIR assessment.

Relevant references surfaced: [Bat23b], [Bil15], [Soi21], [Can24], [Car20], [Mea19], [Gou23], [Hen20], [Leb13], [Leo23], [Ces24], [Pet20], [Bar20], [Bie25].

### Community governance and Latin American digital sovereignty

The search returned 232 relevant works. Research supports the plausibility of territorially grounded federations that share infrastructure and learning while preserving local authority over priorities, labor and data. Evidence is moderate for contextual organizational mechanisms but insufficient to claim general scalability, sustainability or proven impact: much of the literature consists of qualitative case studies in an emerging field.

- The CoopCycle Argentina case identifies implementation opportunities and constraints; it does not prove direct transferability to TAMV. [Kas24]
- Studies of worker-owned and solidarity-economy technologies in Latin America describe political, economic and technical challenges in context. [Gro23], [Man24], [Fol26b], [Alv26b], [Ben26]
- Research on network sovereignty in rural Mexico and Tanzania highlights community participation, local knowledge, digital education and economic ownership. [Par21]
- Studies of Indigenous community networks in Chiapas and Oaxaca describe community participation in infrastructure design and governance. [Ros21]
- The Oyster Model emphasizes reciprocal relationships among teams, partners, contributors, users and allies as part of sustaining community cultural knowledge infrastructure. [Fen25]
- A failed Brazilian platform-cooperativism case warns that dependence on global infrastructure can constrain practical autonomy. [Est25]

**Implementation decision:** define local, federated and shared-infrastructure decision rights; publish a responsibility matrix, appeal mechanism and review cadence; measure effective participation, decision concentration, appeal times, technical continuity and provider dependence. Do not claim community representation, effective sovereignty, sustainability or social impact without explicit indicators and evaluation.

### Additional bibliography (DOIs surfaced by Undermind)

- [Lod25] *Best Current Practice for OAuth 2.0 Security*. https://doi.org/10.17487/rfc9700
- [Lai21] *Data Management in Microservices: State of the Practice, Challenges, and Research Directions*. https://doi.org/10.48550/arXiv.2103.00170
- [Lai24] *An Empirical Study on Challenges of Event Management in Microservice Architectures*. https://doi.org/10.1145/3776581
- [Ler23] *Microservice API Evolution in Practice: A Study on Strategies and Challenges*. https://doi.org/10.1016/j.jss.2024.112110
- [Poi25b] *Building a Zero Trust Federation*. https://doi.org/10.1109/JSAC.2025.3560014
- [Sch25c] *Ensuring Syntactic Interoperability Using Consumer-Driven Contract Testing*. https://doi.org/10.1002/stvr.70006
- [God20] *Differential regression testing for REST APIs*. https://doi.org/10.1145/3395363.3397374
- [Par21] *Digital empowerment for whom? An analysis of ‘Network sovereignty’ in low-income, rural communities in Mexico and Tanzania*. https://doi.org/10.1080/1369118X.2021.1928264
- [Ros21] *From community networks to shared networks: the paths of Latin-Centric Indigenous networks to a pluriversal internet*. https://doi.org/10.1080/1369118X.2022.2085614
- [Fen25] *The Oyster Model: understanding community roles in sustaining digital cultural knowledge infrastructures*. https://doi.org/10.1007/s10502-025-09510-z
- [Fol26b] *Beyond platform capitalism: Digital solidarity economy and free culture networks in Argentina and Brazil*. https://doi.org/10.14763/2026.1.2061
- [Alv26b] *Engineering platform cooperativism: Contributions from the Brazilian solidarity economy*. https://doi.org/10.14763/2026.1.2051
- [Ben26] *Building Worker-Owned Technologies in Latin America: Shared Learning, Intersectionality, and Collective Futures*. https://doi.org/10.1163/24714607-bja10222
- [Man24] *Cooperativismo de plataformas e federações de cooperativas: unindo forças na busca por soberania digital e autonomia no trabalho no contexto Norte-Sul*. https://doi.org/10.18617/liinc.v20i2.7294

### Validation gate

The next step is full-text review of [Deb24], [Abd23], [Fet17], [Soi21], [Can24], [Car20] and the API/event-management papers once Undermind reading becomes available. Map each accepted finding to a TAMV component, test, result, commit and deployment evidence. A recommendation is not implemented merely because it appears in this document.
