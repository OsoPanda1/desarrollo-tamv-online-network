# Institutional research federation bridge v1.0.0

## Purpose

`POST /api/v1/research/federated` is a read-only bridge from the TAMV core application to public research metadata. When configured, it reuses the public research endpoint in `OsoPanda1/tamvonline-weboficial.com` (`POST /api/research/search`) and that application's existing OpenAlex, Crossref, DataCite, OpenAIRE Graph and PubMed/NCBI search behavior instead of sharing a database or copying provider code. When the institutional URL is absent, research queries use the direct anonymous metadata providers documented below; organization queries have no direct fallback.

## Deployment configuration

Set the server-only environment variable `TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL` to the exact public HTTPS URL of the institutional application's `/api/research/search` endpoint. Do not set it to an Auth0 callback, a private API route, a user-controlled URL, or a preview that is not intended for production. No actual deployment URL is hardcoded in source because the current Vercel project/domain association could not be independently verified in this session.

The validator requires HTTPS, rejects credentials, explicit ports, query strings, fragments, IP literals, localhost/local/internal/test names, and any path other than `/api/research/search`. Only deployment configuration chooses the institutional destination; request bodies accept a search query and a declared search type but no URL or host.

A missing or whitespace-only variable enables the direct anonymous research fallback and returns HTTP 200 with provider states. An explicitly invalid configured value still returns HTTP 503 `provider_configuration_invalid`; it is not silently replaced by the fallback. A configured upstream timeout, rate limit, non-success status, malformed payload or invalid metadata remains an error. `type: "organizations"` continues to use only this already verified institutional mechanism and returns HTTP 503 `provider_not_configured` when it is absent. No ROR endpoint is fabricated by the core application.

## Direct anonymous research fallback

The server-only `lib/ecosystem/public-research-providers.ts` module has a complete fixed HTTPS destination allowlist. Request data is encoded with `URLSearchParams` or a bounded JSON search field and can never select a host, path, redirect target or credential. No API key, cookie, session or authorization header is used.

| Provider | Verified anonymous request | Boundary |
|---|---|---|
| Zenodo | `GET https://zenodo.org/api/records?q=...&size=4&sort=mostrecent` | Public record metadata only. |
| Figshare | `POST https://api.figshare.com/v3/items/search` with `{"search_for":"...","limit":4}` | Public item metadata only. |
| DataCite | `GET https://api.datacite.org/dois?query=...&page[size]=4` | DOI registry metadata only. |
| OSF | `GET https://api.osf.io/v2/preprints/?filter[title]=...` | **Title-filtered metadata bridge, not full-text search.** |
| CERN Open Data | `GET https://opendata.cern.ch/api/records?q=...&size=4` | Public open-data record metadata only. |

Each provider has an independent `AbortSignal` timeout of 4 seconds, `credentials: "omit"`, `redirect: "error"`, `cache: "no-store"`, and a streamed response limit of 256 KiB. The existing route enforces the 3–180 character query limit. The fallback emits at most 4 normalized records per provider and 24 overall, deduplicated by `provider:id`. Each record includes `retrievedAt` and an explicit `evidenceClass`; the aggregate response also includes `retrievedAt`.

Provider states are `ok`, `empty` or `unavailable`, with `count` equal to the unique normalized records actually emitted for that provider. Empty responses are distinct from transport, timeout, redirect, malformed JSON, malformed record containers, locked/oversized bodies and other unusable responses. `Promise.all` retains successful providers when another fails. Raw upstream bodies and exception messages are never returned. Result URLs must be credential-free public HTTPS URLs on non-IP, non-local hostnames; an absent or unsafe URL becomes an empty string.

DOI, URL and license fields are projected only when the source actually declares them. Direct adapters do not infer open access from a license, peer review from a publication type, authorship from unrelated fields, or any quality, endorsement or partnership. No ISNI, Frontiers or WEF search API is invented; they are omitted rather than represented as working search connectors.

## Request and response

Request JSON:
- `query`: required, 3–180 characters after trimming.
- `type`: optional, `research` or `organizations`; defaults to `research`.

The configured adapter validates the institutional response and returns a bounded projection of public research records and provider statuses. It rejects mismatched query/type, malformed JSON, oversized bodies and invalid HTTPS result URLs. It uses an explicit 9-second timeout, no cookies or authorization headers, rejects redirects, and does not store records or forward user session credentials. The direct fallback normalizes each provider's declared metadata into the same record shape under the stricter per-provider limits above.

## HTTP semantics

- `200`: valid institutional metadata, or direct anonymous research metadata when the institutional URL is absent; per-provider `empty`/`unavailable` states are included and do not discard successful public providers.
- `400`: invalid UTF-8, malformed JSON or unreadable request body.
- `413`: request larger than 2 KiB.
- `415`: content type is not `application/json`.
- `422`: JSON does not match the accepted query contract.
- `502`: configured institutional upstream failure or invalid/oversized institutional response.
- `503`: explicitly invalid institutional configuration, configured institutional rate limit, or organization search without the institutional bridge.
- `504`: configured institutional upstream timeout.

Responses use `Cache-Control: no-store` because search terms may be sensitive. Upstream response bodies and raw errors are not echoed.

## Trust boundary

This bridge imports public metadata only. Search-result rank is not a quality score; a result does not establish author identity, ownership, peer review, scientific validity, accreditation, endorsement, partnership, legal licensing rights, access rights or independent source verification. Creator/author names, DOI, URL and license values are source-declared fields, not independently verified attribution. A missing license grants no permission; a declared license is not a TAMV reuse grant, and linked materials can have separate terms. The two applications keep their own authentication, sessions, databases and authorization policies. The bridge never writes to either application.
Search text is forwarded to the configured institutional endpoint or, when that endpoint is absent, to the fixed direct anonymous research providers. Those services can process and retain request logs under their own policies. Do not submit personal, confidential or sensitive terms. The core route uses `Cache-Control: no-store`; it cannot dictate external retention.
The route rejects a supplied browser `Origin` that differs from the request origin (HTTP 403). Requests without an `Origin` remain supported for command-line and server-to-server clients. This is a cross-origin abuse mitigation, not authentication or distributed rate limiting.

## Release gate

Before production use, run CI/type checks/build and verify both the direct anonymous research fallback and, when used, the exact configured institutional endpoint on a preview. Exercise research and organization queries plus missing/invalid configuration, upstream timeout, rate limit, malformed payload and provider partial failure. Save the exact commits, HTTP status, latency and provider status counts in the deployment verification record. Institutional configuration is required for organization search, not for the direct research fallback. No integration state should advance until those checks pass.
Before public production, apply `migrations/0004_public_rate_limits.sql` and verify the shared PostgreSQL limiter on `POST /api/v1/research/federated` (`20 requests / 10 minutes` per client identity, HTTP 429 plus `Retry-After`). The counter is atomic across serverless instances; it is not a process-local `Map`. An edge/WAF limit remains recommended and must be tested with the underlying store unavailable, because the application limiter fails closed with HTTP 503 rather than silently becoming unlimited.
