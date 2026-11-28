# Public API quickstart / Inicio rápido de API pública

This guide documents the read-only public endpoints present in the current repository. They return records from the configured application database; if PostgreSQL is not configured or unavailable, a route may return HTTP 503. The examples are reproducible request shapes, not a guarantee that a specific deployment is currently healthy.

## Base URL

Use the deployed application origin approved for your environment, or `http://localhost:3000` after local setup. Do not send production secrets in requests.

## Machine-readable contract

The public API is described in the [OpenAPI 3.1 specification](/openapi.yaml), also served as the repository file `public/openapi.yaml`. It documents the public read endpoints only; session-authenticated write routes are intentionally not advertised as anonymous integration endpoints.

## First requests

### 1. Project catalog

```sh
curl -fsS http://localhost:3000/api/v1/research/projects
```

Response shape: `version`, `records[]`, and an explanatory `note`. Records include bilingual titles/descriptions, maturity, limits and provenance fields. Verification status describes the record; it is not a security or impact certification.

### 2. Research topics

```sh
curl -fsS http://localhost:3000/api/v1/research/topics
```

Response shape: `version`, `records[]`, and `note`. Records describe editorial topics and contribution modes; they are not a guarantee that a project will be accepted or published.

### 3. HCU graph

```sh
curl -fsS http://localhost:3000/api/v1/hcu/graph
```

Response includes `version`, `modelVersion`, `domains[]`, `atoms[]`, `edges[]`, and a caveat. Coordinates and X/Y/Z parameters in the visualization are declared graph parameters; the public endpoint explicitly does not represent a causally validated map or measured impact.

### 4. JSON-LD catalog

```sh
curl -fsS http://localhost:3000/api/v1/exports/research
```

Returns a Schema.org-oriented `DataCatalog` containing public projects, topics and publications whose records are eligible for publication. It includes dataset items and licensing conditions.

### 5. Federated public research query

Research queries use the server-configured institutional API when `TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL` contains a verified public HTTPS URL ending in `/api/research/search`. When that variable is absent, the route falls back to direct anonymous metadata searches of Zenodo, Figshare, DataCite, OSF and CERN Open Data and returns HTTP 200 with per-provider states. An explicitly invalid configured URL still returns HTTP 503, and a configured institutional upstream failure remains an error. No URL can be supplied in the request.

The direct fallback uses fixed HTTPS destinations, omits credentials, rejects redirects, applies a 4-second timeout and 256 KiB response limit per provider, and returns at most 4 unique records per provider and 24 overall. One unavailable provider does not discard successful providers. OSF is a **title-filtered metadata bridge, not full-text search**.

```sh
curl -fsS http://localhost:3000/api/v1/research/federated \
  -H 'content-type: application/json' \
  -d '{"query":"memoria viva","type":"research"}'
```

Use `"type":"organizations"` only for the configured institutional provider's existing ROR organization search; without that configuration it returns HTTP 503. The direct research fallback does not invent an organization or ROR endpoint. The bridge reads public metadata only, does not share sessions or write access, and does not independently verify authorship, peer review, quality, endorsement, partnership, or reuse rights.
Search terms are forwarded to the selected institutional service or direct anonymous providers and may be processed under those providers' own retention policies. Do not send personal, confidential or sensitive data.
Browser requests with a supplied `Origin` must be same-origin. In production this route uses the shared PostgreSQL fixed-window limiter (`20 requests / 10 minutes` per client identity) and returns HTTP 429 with `Retry-After` and `X-RateLimit-*` headers when the quota is exhausted. Apply `migrations/0004_public_rate_limits.sql` before enabling it; if the shared store is unavailable the route returns 503 instead of becoming unlimited. An edge/WAF limit is still recommended in front of the application, and client identity depends on trusted proxy headers being normalized by the deployment.

Titles, creator/author names, DOI, URL and license values are source-declared metadata, not independently verified attribution. Result order is not a quality score. A public record or link does not establish peer review, endorsement, partnership or access rights. A declared license applies only as stated by its source; a missing license grants no permission, and linked materials may have separate terms. Preserve the source URL, declared license and `retrievedAt` when citing or reusing metadata.

### 6. CSV export

```sh
curl -fsS 'http://localhost:3000/api/v1/exports/research?format=csv' -o tamv-research-export.csv
```

Use the CSV for local exploration. Check the license declared for each record before redistributing the metadata or linked material.

### 7. Hugging Face public-metadata snapshot

```sh
curl -fsS http://localhost:3000/api/v1/huggingface
```

Returns a committed snapshot generated locally by the `hf` CLI from public Hub list commands. The route reads the local file only: no runtime Hub request, no token, no model weights, no inference output and no endorsement of the listed repositories. See [the evidence bridge notes](../evidence/README.md) and `pnpm hf:snapshot` to regenerate the snapshot.

### 8. Evidence receipt verification

```sh
curl -fsS -X POST http://localhost:3000/api/v1/evidence/receipts/verify \
  -H 'content-type: application/json' \
  --data-binary @tamv-cev-receipt.json
```

The endpoint is stateless. It validates the strict `tamv.evidence_receipt.v1` shape and recomputes the canonical SHA-256 digest. It does not receive evidence files, fetch declared URLs, persist the receipt, or establish authorship, ownership, truth, trusted time, review, accreditation, or payment eligibility. A `200` response means shape and payload integrity hold; file binding, registered origin, and human review are separate levels. Bodies are limited to 65536 bytes.

## Authentication boundary

| Route family | Access |
|---|---|
| `GET /api/v1/research/projects` | Public read |
| `GET /api/v1/research/topics` | Public read |
| `GET /api/v1/researchers` | Public read; only opt-in public profiles are returned |
| `GET /api/v1/hcu/graph` | Public read |
| `GET /api/v1/exports/research` and `?format=csv` | Public read/export |
| `GET /api/v1/huggingface` | Public read of a committed public-metadata snapshot; no runtime Hub call |
| `POST /api/v1/research/federated` | Public read-only query proxy; direct anonymous research fallback when the institutional URL is absent; organization search requires that URL |
| `POST /api/v1/evidence/receipts/verify` | Public stateless shape and integrity check; no file upload and no persistence |
| `POST /api/v1/research/proposals` | Authenticated session and same-origin request required; private by default |
| `POST /api/v1/research/interests` | Authenticated session and same-origin request required |
| `POST /api/v1/hcu/simulate` | Authenticated session and same-origin request required; rate and model-work limits apply |

Do not call authenticated write routes from arbitrary third-party origins. The routes intentionally require a browser session, origin checks and validation; they are not an anonymous public submission API. Inspect the route implementation and schema before building an integration against a write path.

## Suggested integration pattern

1. Request public JSON.
2. Validate `version` and the fields you need instead of assuming every optional source/license is populated.
3. Keep the source URL and the time/version of your retrieval.
4. Render missing licenses as unspecified rather than granting permission.
5. Keep simulator results separate from observed outcomes and do not treat graph edges as causal proof.

## Operational and license notes

- Public routes can return HTTP 503 when the database-backed catalog cannot be read.
- The route responses generally use `Cache-Control: no-store`; clients should not assume CDN caching.
- No authentication token is required for public reads; do not send credentials unnecessarily.
- Do not publish member counts, adoption claims or API availability percentages without verified measurement.
- A missing license is not an open license. A public URL is not proof the source supports a relationship.
- For local development see [CONTRIBUTING](../../CONTRIBUTING.md) and [README](../../README.md).
