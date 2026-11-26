# TAMV Mind Maps — Implementation note v1

**Review date:** 2026-11-25  
**Repository branch:** `feat/research-evidence-media-atlas-v1`  
**Purpose:** add four source-linked, interactive mind maps across distinct information areas of TAMV Online Network.

## Placement

1. **Home / institutional site:** global and regional AI governance.
2. **Research index:** open research, evidence and verifiable memory.
3. **Practical guide:** Isabella AI security, oversight and responsible use.
4. **Ecosystem page:** federated services, Living Atlas and software supply-chain evidence.

## Interaction and accessibility

- Each map begins with four primary branches, collapsed subtopics, and a central control that expands or collapses all branches.
- Branch controls expose `aria-expanded` and `aria-controls`; links are keyboard reachable and use visible focus styling.
- Responsive layout changes from a two-column tree to a single-column flow on narrow screens.
- Reduced-motion preference disables expansion animation.
- Each subtopic links to source materials. Links are not a claim of endorsement by those sources.

## Research and claim boundaries

- The EU AI Act map links to the official regulation and the European Commission timeline; dates are phased and must be rechecked before a legal or operational decision.
- AESIA is described from its official institutional material and within its legal remit.
- UNESCO country profiles are contextual assessments, not substitutes for current national legislation.
- FAIR, TRUST and CARE inform data stewardship; they do not certify a record as true.
- W3C PROV and RO-Crate describe provenance or packaging; they do not independently validate the correctness of content.
- Agent-security branches describe design controls. They do not claim those controls are implemented or production-tested in Isabella.
- Federation branches describe expected integration controls. A shared catalog or linked repository does not establish interoperability by itself.
- SLSA, signatures, hashes and SBOMs are evidence inputs, not proof that software is harmless or vulnerability-free.

## Primary source links used in the maps

### AI governance
- European Commission AI Act implementation timeline: https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act
- EU Regulation 2024/1689 (consolidated): https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng
- AESIA institutional information: https://aesia.digital.gob.es/storage/media/informacion-institucional.pdf
- UNESCO Mexico profile: https://www.unesco.org/ethics-ai/es/mexico
- UNESCO Recommendation on AI ethics: https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence
- OECD AI Principles: https://oecd.ai/en/ai-principles

### Open research and evidence
- FAIR principles: https://doi.org/10.1038/sdata.2016.18
- TRUST principles: https://doi.org/10.1038/s41597-020-0486-7
- CARE principles: https://doi.org/10.5334/dsj-2020-043
- W3C PROV: https://www.w3.org/TR/prov-overview/
- RO-Crate: https://www.researchobject.org/ro-crate/
- FAIR assessment conundrum: https://doi.org/10.5334/dsj-2024-033
- SLSA: https://slsa.dev/spec/

### Isabella AI security
- OWASP Top 10 for LLM Applications: https://genai.owasp.org/llm-top-10/
- AgentDojo: https://arxiv.org/abs/2406.13352
- Progent: https://arxiv.org/abs/2504.11703
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Generative AI Profile: https://doi.org/10.6028/NIST.AI.600-1

### Federation and software supply chain
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html
- OAuth 2.0 Security Best Current Practice (RFC 9700): https://www.rfc-editor.org/rfc/rfc9700.html
- OWASP API Security: https://owasp.org/API-Security/
- OpenSSF: https://openssf.org/

## Validation still required

The connector can commit source files, but it does not substitute for a local or CI build. Required next checks are TypeScript typecheck, production build, automated tests, browser preview, keyboard/screen-reader review, and confirmation that links remain current. Do not merge while required checks are failing.


## Related Undermind literature reviews

These completed reviews informed the branch topics and the caveats above. Their summaries are based on available abstracts/metadata as well as the linked standards; they do not independently verify TAMV-specific implementation claims.

- [TAMV web research evidence and source citations](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Finvestigacion-abierta%2FTAMV%20web%20research%20evidence%20and%20source%20citations)
- [Accessible multimedia web experience and visual storytelling](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Finvestigacion-abierta%2FAccessible%20multimedia%20web%20experience%20and%20visual%20storytelling)
- [Open-source security assessment and verifiable software provenance](https://app.undermind.ai/projects/35383148-1cf7-4662-8e78-a2ce27051a53?path=%2Ffederacion%2FOpen-source%20security%20assessment%20and%20verifiable%20software%20provenance)

The literature review specifically recommends human review of alt text, captions and transcripts for all video media; privacy-conscious video activation; keyboard and assistive-technology testing; and treating automated security scores, signatures, provenance, external audits and certification as distinct claim types.


## Atlas/LITLE and repository linkage

The federation map now links directly to these repositories whose public status was confirmed through the connected GitHub account:

- TAMV Core Atlas: https://github.com/OsoPanda1/tamv-core-atlas
- Método 4L: https://github.com/OsoPanda1/metodo4l
- Web institucional: https://github.com/OsoPanda1/WEBINSTITUCIONAL-TAMVONLINE

It also links to the existing in-site routes `/arquitectura` and `/hcu`, and to `/api/v1/ecosystem/metadata`, the endpoint already consumed by `EcosystemMetadataBoard`. That endpoint provides repository source metadata; it is not a health check for deployed applications and does not prove cross-repository interoperability.

The connected GitHub account confirmed that several LITLE-related repositories have restricted/private visibility. Their contents are not linked as if publicly inspectable. The public map explains this limitation and points back to the metadata matrix instead of treating inaccessible code as verified.

**Integration boundary:** the mind-map structure itself is authored and versioned in the institutional website; it is not yet generated from Atlas/LITLE repository data. Genuine runtime federation still requires authorized access, versioned API/data contracts, permission checks, contract tests, observable status and deployment evidence for each connection.
