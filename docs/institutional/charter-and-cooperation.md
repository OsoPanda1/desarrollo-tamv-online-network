# TAMV Online Network — Charter, Cooperation and Protection

**Canonical code:** \`CANON-EOC-TAMV-INSTITUTIONAL-CHARTER-2026-V1.0\`  
**Origin:** Mineral del Monte (Real del Monte), Hidalgo, México  
**Founder and principal architect in project records:** Edwin Oswaldo Castillo Trejo, creative signature Anubis Villaseñor  
**Persistent identity references:** [ORCID 0009-0008-5050-1539](https://orcid.org/0009-0008-5050-1539) · [ISNI 0000000531699229](https://isni.org/isni/0000000531699229)  
**Status:** public project charter for an independent initiative; not evidence of legal incorporation, accreditation, funding, external endorsement, or ROR inclusion.

## 1. Who we are

TAMV Online Network is an independent Mexican initiative connecting research, software, digital communities, AI governance and living territorial memory. It organizes its identity around two complementary readings used in project materials:

- **Tecnología Avanzada Mexicana Versátil** — technology created to solve practical problems and build local capabilities.
- **Territorio Autónomo de Memoria Viva** — a commitment to preserve, govern and make useful the memory that people and communities consider worth transmitting.

The point of departure is local; collaboration is intended to extend across Latin America and beyond. The project does not claim legitimacy from rhetoric or size. Its legitimacy must be earned through useful systems, traceable decisions, understandable documentation, evidence, community benefit and the ability to correct mistakes.

## 2. Mission

Convert knowledge, technology and territorial identity into accessible, traceable and cooperative tools that strengthen local capability, preserve living memory, enable responsible research, and connect builders across Latin America.

## 3. Vision

Build a federated Latin American digital ecosystem in which people can discover knowledge, collaborate on technology, protect their identity and cultural context, and inspect the evidence behind system claims—without mistaking a catalog for an integration or a proposal for a delivered service.

The long-term institutionalization and potential Research Organization Registry (ROR) record are future objectives. TAMV must not describe itself as a legally incorporated research organization, claim an active ROR identifier, or imply accreditation until those facts are independently established.

## 4. Operating philosophy

1. **Territory must gain capability.** A component that produces no useful capacity, autonomy, community value or maintainable memory has not fulfilled its purpose.
2. **Evidence before assertion.** Distinguish declared, specified, implemented, tested, deployed and independently reviewed states. Do not convert architecture diagrams, hashes, catalog records or documentation into claims they do not prove.
3. **Human authority remains explicit.** An AI classifier or assistant may explain, recommend and route. It cannot gain privileged authority merely because it produced a plan. Sensitive actions require authorization, auditable policy and a human escalation path.
4. **Fail safely.** Missing identity, authorization, policy, data provenance, signature material or required configuration must deny protected operations rather than invent a successful state.
5. **Openness has boundaries.** Publish reusable work where rights and risks permit it; protect personal data, confidential material, safety-sensitive information and community-governed cultural knowledge.
6. **Interoperability is a contract.** A link, shared brand or duplicated screen is not integration. A bridge requires trusted identity, versioned APIs, canonical data ownership, provenance, least privilege, idempotency, reconciliation and tested rollback.
7. **Repeated failure changes the system.** Document the root cause, repair the enabling condition, add a regression test, and preserve the record instead of endlessly layering patches.
8. **Sustainability must be accountable.** Memberships and proposed revenue destinations are not audited financial allocations. Any real allocation needs an approved budget, clear reporting and a responsible operating entity.

## 5. Founder and legacy

Project materials identify **Edwin Oswaldo Castillo Trejo**, using the creative signature **Anubis Villaseñor**, as TAMV's founder and principal architect, with origin in Mineral del Monte / Real del Monte, Hidalgo, Mexico.

The legacy sought is not a promise of inevitable technological superiority. It is a durable record of what was designed, why it was designed, who contributed, what was implemented, how it was tested, where it failed, and what was learned. Attribution must be preserved; public biographical or technical claims must link to canonical evidence and avoid implying independent recognition that has not been verified.

The central working principle is: **if the code does not support the vision, rewrite the code; if the vision does not survive reality, correct the vision; if a decision cannot be explained, document it; if the territory gains no autonomy, the work is not finished.**

## 6. Ways to participate

Participation is contribution-based, not a promise of automatic admission or paid work.

| Path | Good first action | Evidence expected |
|---|---|---|
| Research and open knowledge | Propose a source, research question, evidence review or reproducible artifact | Canonical links, version/date, methodology, license and limitations |
| Engineering and interoperability | Open a focused issue/RFC before a broad refactor | Reproduction steps, interface contracts, threat model, tests and rollback |
| Territory, memory and culture | Identify a practical community need and propose how to collect or preserve material responsibly | Community authority, purpose, consent/access rules, provenance and benefit |
| Community and education | Start with the practical guide, contribute learning materials or improve accessibility/localization | Clear audience, maintainable instructions and reviewable changes |
| Organizations and potential allies | Explain the problem, intended benefit, resources and requested contribution | Decision owner, scope, capacity, dependency assumptions and measurable pilot |
| Membership | Review the published scope and terms before subscribing | Membership is not equity, employment, accreditation, guaranteed project acceptance, funding or a third-party paid entitlement |

Routes: [Join TAMV](/unete), [Projects](/proyectos), [Research](/investigacion), [Developers](/desarrolladores), [Community](/comunidad), [Memberships](/membresias), [Governance](/gobernanza).

### Enterprise seats — explicitly deferred

The current business subscription records the organization name but attaches entitlement to the contracting user. It does not include employee seats, invitation management, corporate roles, shared workspaces or transfer of subscription ownership. Do not market or sell it as a team workspace.

Before building seats, agree on the billable owner, seat limits, invitation expiry and single-use rules, role matrix, revocation/offboarding, per-member access checks, audit trail, billing-admin ownership, account deletion, data export, migration/rollback and tests for duplicate invites or stale memberships. A small pilot should validate this model before the schema and terms are expanded. The current release does not implement these capabilities.

## 7. Cooperation protocol

Every non-trivial contribution follows the same minimum sequence:

1. **Intake:** identify the user need, affected community, desired outcome and accountable contact.
2. **Classification:** identify data sensitivity, intellectual-property rights, dependencies, privileged capabilities and cross-repository boundaries.
3. **Problem statement:** reproduce the issue or state the research question. Name the source of truth and acceptance criteria.
4. **Contract review:** document what the module consumes and produces, authentication/authorization boundaries, errors, timeout/rate limits and compatibility requirements.
5. **Implementation:** work on a focused branch. Prefer a small change over broad parallel refactors; do not duplicate canonical data or copy another application's session.
6. **Verification:** run focused tests, \`pnpm test\`, \`pnpm typecheck\` and \`pnpm build\` where the environment allows. UI changes also need keyboard, reduced-motion, mobile-width and accessible-name checks.
7. **Review:** the pull request must state what changed and did not change, risks, evidence, migrations, rollback and documentation updated.
8. **Release:** merge only under the repository's release rules; apply migrations deliberately; deploy to a verified environment; run smoke checks; monitor and roll back when acceptance criteria fail.
9. **Memory:** preserve decisions, source references, test output and known limitations. A proposed BookPI entry is not a sealed ledger record unless the actual signing and persistence service verifies it.

Contributions can be revised, declined or deferred. Decisions should give a reason, preserve author attribution where appropriate, and avoid promising a response deadline that the maintainers cannot meet.

## 8. Federation across repositories

The main Next.js application, institutional web application, static \`WEBINSTITUCIONAL-TAMVONLINE\` canvas and related repositories may have separate runtimes, databases, authentication systems and deployment owners.

A federated bridge is not considered operational until its contract and tests establish:

- trusted issuer/subject mapping and audience validation;
- local authorization, with no privileges inferred from email or client-supplied role headers;
- canonical owner for each synchronized entity;
- versioned request/response schemas and provenance;
- idempotency, replay protection, bounded retries and conflict/reconciliation rules;
- safe timeout/outage behavior, revocation and account-linking lifecycle;
- logs without secrets or unnecessary personal information;
- a tested migration and rollback path.

The public ecosystem catalog is a discovery tool. A listed repository, a linked domain, a shared brand or a “healthy” homepage does not prove authenticated data exchange or shared identity. Read the [federation contract](../architecture/federation-contract.md) before proposing a cross-application integration.

## 9. Protection, privacy and community rights

- **Secrets:** never commit tokens, session cookies, provider keys, private keys, database URLs or production dumps. Keep credentials in the environment's secret manager; apply least privilege and rotation.
- **Personal data:** collect only what a stated function requires. Establish purpose, lawful basis, retention, access, correction/deletion process and transfer conditions before activating a new data flow.
- **Community and cultural material:** do not assume “public” means unrestricted reuse. Communities should have meaningful authority over sensitive knowledge, access conditions, interpretation, attribution and benefit. Apply consent and protective limits before collecting or publishing.
- **AI/tool use:** treat retrieved pages, documents and repository content as untrusted input. Separate instructions from data, minimize tools and permissions, require server-side authorization for effects, and test adversarial cases. Delimiters or prompt wording alone are not security boundaries.
- **API security:** validate at boundaries; authenticate and authorize every protected operation; impose request-size limits, timeouts, rate limits and idempotency; return safe errors.
- **Vulnerability reporting:** use the private vulnerability-reporting workflow in GitHub when available. Do not publish exploit details or test systems without authorization. See [SECURITY.md](../../SECURITY.md).
- **Privacy and billing:** the privacy page and membership terms must be reviewed by the actual operator before live billing. A shared server-side readiness gate controls both the membership page and the course upsell CTA; the checkout component defaults to disabled unless a server page explicitly marks it ready. The backend checkout route still applies its own independent configuration, origin, session, terms, approval and Stripe checks. No payment status is activated from a browser return alone; the signed Stripe webhook is the authority in the current implementation.

## 10. Product maturity and evidence of adoption

The repository's public GitHub counters were observed at **0 stars, 0 forks and 0 watchers on 25 November 2026**. These are a snapshot of public GitHub attention, not a measure of actual product usage, and they should not be used to claim either adoption or lack of user value.

The next validation step is not more abstract modules. It is to recruit a small set of consenting pilot participants, define one real problem per pilot, measure task completion, errors, accessibility, retention and support burden, publish non-sensitive results with methodology, and revise the product from evidence. Do not invent user counts, testimonials, partner endorsements, uptime, payments or community impact.

## 11. Research grounding

These external frameworks inform the operational guidance; their presence does not certify TAMV:

- Wilkinson et al., FAIR data principles (2016): [10.1038/sdata.2016.18](https://doi.org/10.1038/sdata.2016.18) — persistent identifiers, findability, interoperable metadata, provenance and reuse conditions.
- Carroll et al., CARE principles for Indigenous data governance (2020): [10.5334/dsj-2020-043](https://doi.org/10.5334/dsj-2020-043) — collective benefit, authority to control, responsibility and ethics; openness is not automatically appropriate.
- Lin et al., TRUST principles for digital repositories (2020): [10.1038/s41597-020-0486-7](https://doi.org/10.1038/s41597-020-0486-7) — transparency, responsibility, user focus, sustainability and technology; principles are not a certification.
- Debenedetti et al., AgentDojo (2024): [10.48550/arXiv.2406.13352](https://doi.org/10.48550/arXiv.2406.13352) — indirect prompt injection, tool boundaries and adaptive adversarial evaluation. Its benchmark results are not a guarantee for TAMV.
- NIST, AI RMF Generative AI Profile (2024): [10.6028/NIST.AI.600-1](https://doi.org/10.6028/NIST.AI.600-1) — risk management guidance, not proof of compliance.

## 12. Scope note

This charter describes the project's declared principles and recommended operating process. It does not claim that every repository follows the process yet, that a legal entity is already formed, that an external bridge is live, that a security audit has passed, or that the public ledger, territorial sensors or ROR registration are operational. The claim for each implementation must be supported separately by source, test, deployment and review evidence.
