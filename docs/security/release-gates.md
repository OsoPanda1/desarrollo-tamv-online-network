# Release gates — TAMV Online Network

This checklist is the release contract for changes entering `main` or production. A checklist is not a substitute for enforced branch protection: repository administrators must configure the required status checks and prevent bypass where the hosting plan permits it.

## Gate 0 — provenance

- Every change is associated with a reviewed pull request.
- The diff is scoped to the intended repository and branch.
- No credentials, private datasets, or user records are included.
- Dependencies are lockfile-controlled; install is reproducible with `pnpm install --frozen-lockfile`.

## Gate 1 — code quality

- `pnpm typecheck` passes.
- `pnpm build` passes with the supported Node/pnpm versions.
- Automated tests cover changed business logic and security boundaries.
- No knowingly failing check is waived without a documented, time-bounded exception.

## Gate 2 — security

- CodeQL results are reviewed; exploitable high/critical findings block release.
- Production dependency audit is reviewed; high/critical vulnerabilities are fixed, mitigated, or formally excepted with an owner and expiry.
- Authentication, authorization, CSRF/origin, rate limits, input size, and error paths are tested for affected routes.
- Secrets are stored in the deployment secret manager, rotated after exposure, and never committed.
- Database migrations are reviewed for privilege boundaries, constraints, data loss, and rollback feasibility.

## Gate 3 — data governance

- Private proposals and evidence remain private unless explicit consent and workflow state permit publication.
- Exports include only records explicitly eligible for public disclosure.
- Retention, deletion, access, and audit-event behavior are documented.
- Hash chains are described as tamper-evident within their trust boundary, not as proof of truth or non-repudiation by themselves.

## Gate 4 — production readiness

- Required environment variables are verified without printing their values.
- Deployment health, authentication, key user journeys, and error handling are smoke-tested.
- Monitoring and incident response contacts/processes are available.
- Rollback target and responsible operator are known.

## Exceptions

An exception must record: affected gate, business justification, threat/impact assessment, compensating controls, accountable owner, approval, expiry date, and closure evidence. “Temporary” exceptions without expiry are not accepted.

## Current evidence status

Adding these gates to the repository does not mean GitHub branch protection is enabled, that CI has passed, or that a production environment has been tested. Those states must be verified separately.
