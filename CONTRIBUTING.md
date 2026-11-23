# Contributing to TAMV Online Network / Cómo contribuir

TAMV Online Network is an independent Mexican initiative connecting research, digital infrastructure, AI governance and living territorial memory. Contributions are welcome when they improve reproducibility, clarity, interoperability, accessibility or accountability.

TAMV is evolving. A public project record does not imply production readiness, peer review, accreditation or third-party endorsement. Read the project maturity and limits before relying on a component.

## Where to start / Por dónde empezar

1. Read [the README](README.md), [the developer API guide](docs/api/public-api-quickstart.md), and [the architecture boundaries](docs/architecture/federation-contract.md).
2. Choose a small, verifiable issue: documentation, Spanish/English parity, accessibility, test coverage, source provenance, safe error handling, or a narrowly scoped feature.
3. Open or review an [issue in GitHub](https://github.com/OsoPanda1/desarrollo-tamv-online-network/issues) before large refactors so the intended result and acceptance criteria are clear.
4. Reproduce the problem and record environment, steps, actual result, expected result and relevant logs. Remove tokens, personal data and production identifiers.
5. Submit a focused pull request with tests, screenshots when the change is visual, migration/backout notes when data or schema is affected, and the evidence needed to reproduce the outcome.

## Local workflow

Use a supported Node.js LTS and the repository's pinned pnpm version. Configure a disposable development database; do not point local experiments or migrations at production.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill only the required values with local/test credentials.
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

Some pages and APIs depend on PostgreSQL and a configured Better Auth secret. A healthy frontend build does not prove database, authentication, authorization or production integrations work.

## Pull-request checklist

- [ ] The problem and user benefit are described in plain language.
- [ ] Scope is bounded; unrelated formatting/refactors are separate.
- [ ] Tests cover relevant behavior and error cases.
- [ ] `pnpm test`, `pnpm typecheck` and `pnpm build` are run when the environment supports them; results are reported honestly.
- [ ] Public API changes document response shape, status codes, auth boundary and rate limits.
- [ ] Database changes include a migration, preflight/rollback notes and backup-restore consideration.
- [ ] New claims cite canonical sources and distinguish declaration from independent validation.
- [ ] English and Spanish interfaces stay semantically aligned.
- [ ] Keyboard, reduced-motion, narrow-screen and accessible-name behavior are checked for UI changes.
- [ ] No secrets, private records, personal information or provider tokens are committed.
- [ ] External assets and dependencies have compatible licenses and a documented purpose.
- [ ] The PR explains any unmet checks or deployment requirement.

## Licensing and permission to reuse

A root `LICENSE` file was not found during the repository audit dated 2026-11-23. Until the copyright holder selects and publishes a license, do not assume the code is permissively licensed or that public access grants permission to redistribute, modify, sublicense or incorporate it into a product. Read [the licensing status note](docs/governance/licensing-status.md).

`CITATION.cff` helps attribute the repository but does not grant reuse rights. Project records and individual documents may declare a separate license; such a declaration must not be applied to the entire codebase or to images/models by implication. If a proposed contribution introduces third-party code or assets, document the source and compatible license. Maintainers should resolve code licensing before advertising broad external reuse or an unrestricted developer ecosystem.

## Research integrity and provenance

Keep facts, author declarations, hypotheses, simulation outputs and independently verified evidence separate. For new source records, preserve the canonical URL, identifier, retrieval date, license/terms where relevant, inspected version and validation status. A hash identifies bytes; it does not establish that a claim is true. A DOI or ORCID record does not by itself demonstrate peer review, accreditation or impact.

## Security and privacy

Do not include credentials, dumps, personal data or undisclosed vulnerabilities in public issues or pull requests. Use GitHub's private vulnerability-reporting mechanism from the repository Security area when available, or contact the maintainers privately through a verified institutional contact channel. Do not assume a secret or private report has been received until an explicit acknowledgment exists.

## Review and recognition

Submitting a PR is not a guarantee of acceptance or a response deadline. Maintainers should state the reason for changes, rejection or deferral, identify any remaining work, and preserve author attribution. Recognition may appear in release notes when appropriate and with the contributor's consent.

## Guía breve en español

- Empieza por [la guía de API](docs/api/public-api-quickstart.md) y el README.
- Elige una incidencia pequeña y reproducible antes de proponer una reescritura amplia.
- Explica el problema, los pasos para reproducirlo y un criterio de aceptación verificable.
- Acompaña cambios de código con pruebas; los cambios visuales también necesitan capturas en un entorno de navegador autorizado.
- No compartas secretos, datos personales, dumps ni credenciales.
- Distingue claramente lo propuesto, implementado, desplegado y verificado.
- La recepción de una contribución no garantiza su aceptación; las decisiones deben estar justificadas y conservar la atribución.
