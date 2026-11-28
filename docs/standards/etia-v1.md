# Estándar TAMV de Integridad Abierta (ETIA) v1

**TAMV Open Integrity Standard (TOIS) v1**  
Identifier: `tamv.open_integrity.v1` · Version: `1.0.0` · Status: `public-draft`  
Canonical page: `https://tamv.online/estandar`

## 1. What this standard is

ETIA is a **declared-conformance evaluator**. It defines one JSON declaration that
describes a subject's classification, funding, publication and certification
claims, and one deterministic algorithm that reports structural completeness and
internal consistency.

It is not an ISO standard, not an accreditation scheme, not a certification body,
not a registry and not legal advice.

## 2. Non-goals

- It does not verify that a declaration is true.
- It does not resolve ROR, ISNI, ORCID, DOI, Handle or ARK identifiers.
- It does not fetch declared URLs or inspect evidence files.
- It does not query certifier registries or contact issuers.
- It does not issue, renew, suspend or revoke certifications.
- It does not determine tax deductibility, charitable status, sanctions exposure,
  export-control classification or data-protection compliance.
- It does not replace peer review, editorial review or a legal audit.

## 3. Blind spots this standard corrects

| Blind spot | Correction |
|---|---|
| "Open source" claimed with a non-OSI license | `classification.openness` fails unless the local license catalog marks the license OSI-approved. |
| Identifiers treated as quality signals | The report states that format validation does not prove registration, ownership or currency. |
| Certification claims without issuer, scope, evidence or validity | Every claim must name issuer, scheme, scope, evidence, status and, for third-party claims, a registry and validity window. |
| A subject certifying itself as a third party | `certification.<id>.issuer` fails when a third-party claim names the subject as issuer. |
| Indexing or registration described as "certification" | `certification.<id>.wording` fails on affirmative certification language for registration, indexing, badge or self-declaration claims. Negated statements ("this is not a certification") are not flagged. |
| Expired, suspended or revoked certificates presented as current | Expiry, issue-date and status checks fail the claim. |
| Fundraising without a legal vehicle or donor policies | `funding.legal_vehicle`, `funding.gift_policy`, `funding.donor_privacy`, `funding.sanctions` and `funding.transparency` become blocking checks. |
| Fiscal sponsorship with undefined scope | `funding.fiscal_host` requires a named sponsor and an agreement URL. |
| Data protection treated as universal | The declaration records jurisdiction, lawful basis and a statement URL; the evaluator does not resolve the applicable law. |
| Indigenous data handled with FAIR alone | `publication.indigenous_data` requires a CARE statement when involvement is declared. |
| Repository certification confused with dataset truth | The catalog and page state that CoreTrustSeal/ISO 16363 cover the repository, not each dataset. |
| WEF treated as a certifier | The reference catalog records that WEF publishes principles and reports and is not a standards body or certifier. |

## 4. Pillars

1. **Classification** — subject identity, locator, jurisdiction, identifiers,
   license, openness consistency and CRediT roles.
2. **Funding** — revenue model, legal vehicle, fiscal host, tax status, gift
   acceptance, donor privacy, sanctions, conflicts of interest, complaints,
   transparency, payment scope, restricted funds and currency.
3. **Publication** — repository, repository certification, persistent identifier,
   metadata schema, versioning, review, license, contributors, funding
   acknowledgement, data/code availability, ethics, Indigenous data,
   accessibility and language.
4. **Certification** — issuer independence, claim wording, evidence and validity,
   declared status, scope, public registry and redress.
5. **Cross-cutting** — provenance, data protection, privacy notice, terms, export
   control, software security, supply chain, accessibility, corrections and review
   recency.

Each check returns `pass`, `warn`, `fail` or `not_applicable`. A pillar is
`complete`, `conditional` or `blocked`. The report is `complete`, `conditional`
or `blocked` accordingly.

## 5. Evidence levels

| Level | Meaning | Emitted? |
|---|---|---|
| `declared` | The subject states the fact. Nobody checked it. | Yes |
| `documented` | A public document or URL exists. Its content is not verified. | Yes |
| `attested` | A third party states it issued or registered the fact, with linked evidence and registry. | Yes |
| `verified` | Reserved for reproducible external verification. | **Never** |

`report.verification` is the literal `"unverified"`. `report.evidenceCeiling` is
the weakest level among applicable checks.

## 6. Declaration data model

Schema id: `tamv.open_integrity.declaration.v1`. The authoritative definition is
`lib/standard/schema.ts` (Zod). A JSON Schema projection is served at
`GET /api/v1/standard/schema`; it cannot express every refinement (safe URLs,
checksums, cross-field dates) and says so in `$comment`.

Top-level keys:

```json
{
  "schemaVersion": "tamv.open_integrity.declaration.v1",
  "subject": { "...": "..." },
  "funding": { "...": "..." },
  "publication": { "...": "..." },
  "certificationClaims": [],
  "transparency": {},
  "legal": {},
  "security": {},
  "accessibility": {}
}
```

A complete fictional example lives at
`examples/standard-declaration.json` and is published at
`/standards/example-declaration.json`.

## 7. Algorithm

`evaluateDeclaration(declaration, { referenceDate? })` runs without network,
database, randomness or system-clock reads. It:

1. Builds classification, funding, publication, certification and cross-cutting
   checks from the validated declaration.
2. Assigns a status and an evidence level to every check.
3. Aggregates pillar summaries and the overall outcome.
4. Derives remediation items for warnings and blockers.
5. Serializes the report without the digest using `tamv-jcs-1` (sorted keys, NFC,
   no `undefined` properties).
6. Computes `sha256:` over those bytes with Web Crypto.
7. Returns the report with `digest`, `canonicalization` and `digestScope`.

Same declaration + same `referenceDate` ⇒ same report and digest. When
`referenceDate` is omitted, time-based checks (expiry, staleness) are not
evaluated and the report records `referenceDate: null`. The API supplies server
time and therefore includes it in the digest.

## 8. API contract

All routes are stateless and answer with `Cache-Control` and
`X-Content-Type-Options: nosniff`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/standard` | Catalog: pillars, levels, limitations, endpoints. |
| GET | `/api/v1/standard/references` | External systems with "does / does not do". |
| GET | `/api/v1/standard/schema` | JSON Schema projection (`application/schema+json`). |
| POST | `/api/v1/standard/evaluate` | Structural evaluation. |

`POST /api/v1/standard/evaluate`:

- Body: max 65,536 bytes, `application/json`.
- Rate limit scope: `standard-evaluate`, 60 requests per 10 minutes.
- `200` — `{ valid: true, report, note }`.
- `400` — `invalid_json`, `invalid_utf8`, `request_body_unreadable`.
- `413` — `payload_too_large`.
- `415` — `unsupported_media_type`.
- `422` — `schema_validation_failed` with `issues: [{ path, code, message }]`.
- `429` / `503` — shared rate limiter exceeded or unavailable (fail-closed).

The endpoint never echoes arbitrary payload fields; the report contains only
normalized, enumerated and evaluated values.

## 9. CLI

```bash
npm run standard:check -- examples/standard-declaration.json \
  --reference-date 2026-11-27T00:00:00Z
```

- `--json` prints the full report.
- Exit `0` = complete, `1` = conditional, `2` = blocked, `3` = schema or usage error.
- The CLI imports the same evaluator as the API and the browser component.

## 10. Tests

`tests/open-integrity-standard.test.mjs` covers:

- the example declaration, determinism and digest stability;
- the reserved `verified` level never being emitted;
- expired and future-dated evidence;
- affirmative overclaim vs negated certification language;
- OSI/openness consistency and malformed identifiers;
- self-certification, missing funding controls and missing jurisdictions;
- API 200/400/413/415/422 behavior, no payload echo and rate-limit registration;
- catalog, references and schema routes;
- sitemap, footer, header, CSS, OpenAPI, docs and example publication.

Run with:

```bash
npm test
npm run typecheck
```

## 11. Legal and jurisdictional gaps

The standard can require a declaration; it cannot make a jurisdiction uniform.
Fiscal sponsorship, charitable solicitation, donor deductibility, sanctions,
anti-money-laundering rules, export control and data protection vary by country
and sometimes by state. The declaration links policies and records jurisdiction
codes, but a lawyer or compliance officer must still review the actual operation.

ISO standards referenced here are usually paywalled and certification requires
accredited bodies. Holding a DOI, being indexed or appearing in a catalog is not
certification. A repository certification covers the repository, not the truth of
every dataset it stores.

## 12. What remains explicitly unverified

- Whether this repository has deployed the API in production.
- Whether any real organization's declaration would pass every check.
- Whether any cited identifier resolves to the declared entity.
- Whether any certification claim is currently valid.
- Whether any funding operation is lawful in its jurisdiction.

Those questions require external evidence and are out of scope by design.

## 13. Change control

- Vocabulary changes require a new standard version.
- Adding a check is a minor version when it cannot fail an existing valid
  declaration; otherwise it is a major version.
- Removing or weakening a check requires a documented rationale and a new
  version.
- Report digests are versioned by the `standard.version` field inside the
  digest scope.
