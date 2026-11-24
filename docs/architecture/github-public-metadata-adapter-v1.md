# GitHub public repository metadata adapter v1.0.0

## Purpose

The route `GET /api/v1/ecosystem/metadata` reads public repository metadata from GitHub's REST API for the eight repositories listed in `lib/ecosystem/registry.ts`. It is the first executable, read-only cross-repository adapter. It does not clone source code, call arbitrary URLs, use GitHub credentials, or write to a source repository.

## Data and request boundary

- Source selection is derived exclusively from the reviewed, static ecosystem registry.
- Every upstream request targets the fixed origin `https://api.github.com` and the GitHub repository metadata endpoint.
- Redirects are rejected. Repository input supplied by a request caller is never accepted.
- Next.js upstream fetch caching is explicitly enabled and revalidated every 900 seconds to reduce repeated anonymous GitHub API calls; the public response cache policy is separately limited to 300 seconds with a 600-second stale-while-revalidate window.
- Requests are bounded by a 4.5-second timeout.
- Upstream response bodies are limited to 64 KiB before JSON parsing.
- Only a small allow-list of public metadata fields is projected into the API response.
- No authorization header, session, access token or private database credential is sent.
- Individual source failures do not erase successful results from other repositories.

## Response semantics

Each system reports `sourceMetadataStatus`:

- `metadata_available`: GitHub returned valid public metadata for the expected repository identity.
- `not_found`: GitHub returned 404 or the payload indicated that the repository is private. This deliberately does not distinguish private from nonexistent.
- `rate_limited`: GitHub returned HTTP 429 or an explicit exhausted unauthenticated rate limit.
- `timeout`: the request timed out or was aborted.
- `upstream_error`: the upstream request failed or returned another non-success response.
- `invalid_response`: invalid registry URL, invalid/oversized JSON, invalid payload shape, or repository identity mismatch.

The endpoint intentionally returns HTTP 200 with per-system results even when some upstreams fail. This represents the status of metadata retrieval, not health of any deployed web application.

## Security and trust boundaries

A reachable GitHub API repository record does not prove that the application is deployed, the default branch builds, any runtime endpoint is reachable, identity federation works, data synchronization exists, the repository is licensed for reuse, or a contributor's claims are true. The endpoint does not advance `integrationState` in the canonical registry. Catalog state changes require recorded contract and end-to-end evidence tied to a commit SHA.

## Caching and operational limits

The response advertises a 300-second shared-cache lifetime and 600-second stale-while-revalidate window. The Next.js source-data cache is revalidated every 900 seconds, so source metadata may be up to 15 minutes old. `checkedAt` records when the response snapshot was assembled; it is not proof that GitHub was contacted at that exact time. The upstream call timeout and response-size limit keep one slow or malformed source from consuming unbounded time or memory. Monitor actual Vercel behavior and GitHub rate-limit responses after deployment; source code alone is not deployment evidence.

## Verification record

Before marking this adapter deployed or contract-tested, run the repository test suite, TypeScript checks and production build; then deploy a preview and capture the status code, response schema, per-system results, cache headers and commit SHA. Do not publish access tokens or raw upstream error bodies in evidence records.
