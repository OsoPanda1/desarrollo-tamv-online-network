# Production release-readiness gates

Status: operational checklist. This document is not evidence that a gate has passed.

## Release decision rule

A release is **blocked** until each applicable gate has an owner and a verifiable result for the exact candidate commit. A green build alone does not establish secure authorization, data integrity, identity federation, recovery capability, or production health.

## Gate matrix

| Gate | Required evidence | Block condition |
|---|---|---|
| Source integrity | Reviewed PR, immutable commit SHA, no unreviewed generated files | Unknown source or unreviewed security-sensitive change |
| Dependencies | Frozen install, production dependency audit, Dependabot alerts reviewed | Install drift or unresolved high/critical advisory without documented exception |
| Code quality | Test suite, TypeScript check, production build, CodeQL and secret scan pass | Missing runner evidence, failed checks, or unresolved secret exposure |
| Configuration | Production values stored in platform secret manager; no placeholder secrets; canonical HTTPS origin verified | Missing/weak auth secret, wrong origin, or privileged credential exposed to client |
| Database | Exact target confirmed; read-only preflight clean; backup restored successfully to disposable environment | Unknown schema, strict preflight findings, or untested recovery |
| Migration | Migration applied to disposable copy first; checksum recorded; query plan reviewed; operator approval logged | Migration requires unreviewed destructive change or target is ambiguous |
| Authorization | Tests cover anonymous, owner, other user, reviewer/moderator, administrator and revoked session | Any cross-user access or role bypass |
| Privacy and workflow | Publication consent, withdrawal, appeal, retention and deletion transitions verified | Published private data, consent ignored, or appeal state inconsistent |
| Runtime | Liveness/readiness, auth, primary workflows and error paths smoke-tested on deployment candidate | Only static checks available or production URL/version unconfirmed |
| Observability | No secrets in logs; request/trace correlation; alert route tested | Sensitive values logged or critical failures are invisible |
| Recovery | Restore drill, incident contact, rollback/forward-repair plan documented | Backup exists but restore is not demonstrated |
| Federation | Issuer/audience/signature/expiry validation; stable subject mapping; local authorization and revocation tested | Shared cookies, trusted identity headers, or unverified tokens used as authority |

## PostgreSQL pool sizing

PG_POOL_MAX controls the maximum connections per Node.js process. The application defaults to 3 and accepts integers from 1 through 20. Choose a value based on the provider connection limit, whether DATABASE_URL uses a pooler, and the maximum number of simultaneously warm serverless instances.

A useful planning bound is:

**maximum application connections ≈ instances × PG_POOL_MAX + migration/operator connections**

This is a capacity estimate, not a guarantee: provider-side poolers and other applications also consume connections. Do not raise the pool maximum to mask slow queries. Check query plans, connection saturation, and timeout metrics first.

Readiness and observability probes now record the exact `pg_backend_pid()` before running `SELECT 1`. If the 1.5 s outer budget expires, a separate short-lived client calls `pg_cancel_backend(pid)` and the pooled client is always released. The response stays 503 with no driver text; liveness remains independent of the database. This is cancellation evidence at the application level, not a substitute for staging saturation tests or provider-side connection limits.

## Build evidence gate

Run the build with the exact ordered command:

```bash
node scripts/write-build-evidence.mjs --clear && next build && node scripts/write-build-evidence.mjs
```

The first command removes stale evidence without failing when it is absent. Evidence is generated only after a successful Next.js build, written to a temporary file, and atomically renamed to `public/build-evidence.json`. The public endpoint carries `Cache-Control: no-store`. Review the generated artifact and its diff; do not treat its presence as proof that CI, security review, or deployment passed.

Both UI consumers accept only schema version 1, `status: "generated"`, `algorithm: "SHA-512"`, and a 128-character lowercase hexadecimal digest. Missing or malformed evidence stays unpublished. The digest covers selected Next.js build artifacts only, not the complete deployment, and it is not a digital signature or trusted timestamp.

## Required evidence record

For each release, record:

- candidate commit SHA and PR;
- exact deployment/environment and deployed commit;
- CI, dependency audit, CodeQL and secret-scan run URLs/statuses;
- database preflight output with credentials and personal data omitted;
- migration names/checksums and operator approval, if applicable;
- authorization/privacy test results;
- backup restore drill date and result;
- known limitations, exceptions, owner and expiry date.

Never paste DATABASE_URL, tokens, cookies, user records, or raw private logs into this record.

## Immediate stop conditions

Stop rollout and use the incident process if there is suspected credential exposure, unauthorized cross-user data access, publication without consent, unexpected schema drift, integrity-check failure, or evidence that the deployed commit differs from the approved candidate.
