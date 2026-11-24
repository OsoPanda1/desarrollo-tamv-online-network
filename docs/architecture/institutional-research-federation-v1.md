# Institutional research federation bridge v1.0.0

## Purpose

`POST /api/v1/research/federated` is a read-only bridge from the TAMV core application to the public research metadata endpoint in `OsoPanda1/tamvonline-weboficial.com` (`POST /api/research/search`). It reuses that application's existing OpenAlex, Crossref, DataCite, OpenAIRE Graph and PubMed/NCBI search behavior instead of sharing a database or copying provider code.

## Deployment configuration

Set the server-only environment variable `TAMV_INSTITUTIONAL_RESEARCH_SEARCH_URL` to the exact public HTTPS URL of the institutional application's `/api/research/search` endpoint. Do not set it to an Auth0 callback, a private API route, a user-controlled URL, or a preview that is not intended for production. No actual deployment URL is hardcoded in source because the current Vercel project/domain association could not be independently verified in this session.

The route remains disabled with HTTP 503 until the environment variable is configured. The validator requires HTTPS, rejects credentials, explicit ports, query strings, fragments, IP literals, localhost/local/internal/test names, and any path other than `/api/research/search`. Only deployment configuration chooses the destination; request bodies accept a search query and a declared search type but no URL or host.

## Request and response

Request JSON:
- `query`: required, 3–180 characters after trimming.
- `type`: optional, `research` or `organizations`; defaults to `research`.

The adapter validates the institutional response and returns a bounded projection of public research records and provider statuses. It rejects mismatched query/type, malformed JSON, oversized bodies and invalid HTTPS result URLs. It uses an explicit 9-second timeout, no cookies or authorization headers, rejects redirects, and does not store records or forward user session credentials.

## HTTP semantics

- `200`: valid response from the institutional search API, including any per-provider `unavailable` statuses in the source's result.
- `400`: invalid UTF-8, malformed JSON or unreadable request body.
- `413`: request larger than 2 KiB.
- `415`: content type is not `application/json`.
- `422`: JSON does not match the accepted query contract.
- `502`: upstream failure or invalid/oversized response.
- `503`: provider is not configured or is rate-limited.
- `504`: upstream timeout.

Responses use `Cache-Control: no-store` because search terms may be sensitive. Upstream response bodies and raw errors are not echoed.

## Trust boundary

This bridge imports public metadata only. Search-result rank is not a quality score; a result does not establish author identity, ownership, peer review, scientific validity, accreditation, legal licensing rights or independent source verification. The two applications keep their own authentication, sessions, databases and authorization policies. The bridge never writes to either application.
Search text is forwarded to the institutional endpoint and may then be sent to its configured external metadata providers. Do not submit personal, confidential or sensitive terms. The core route uses `Cache-Control: no-store`; it cannot dictate how external providers retain request logs.

## Release gate

Before production use, configure the exact institutional endpoint in the central Vercel project, run CI/type checks/build, and test successful research and organization queries plus upstream timeout, rate limit, malformed payload and provider partial failure on a preview. Save the exact commits, HTTP status, latency and provider status counts in the deployment verification record. No integration state should advance until those checks pass.
