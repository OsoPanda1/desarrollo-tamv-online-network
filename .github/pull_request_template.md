## Purpose and scope

Describe the user-visible or operational problem and the exact components changed.

## Risk and trust boundaries

- [ ] Authentication and authorization reviewed where relevant
- [ ] User-controlled input validated and bounded
- [ ] No secrets, tokens, personal data, or production records added
- [ ] Database changes are backward-compatible and include a migration/rollback plan
- [ ] External services, permissions, and data-sharing implications documented
- [ ] AI/tool execution (if applicable) has explicit allowlists and bounded authority

## Validation evidence

List the exact commands run and their results. Do not mark checks as passed unless they were executed.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Relevant automated tests
- [ ] Manual route/API smoke tests (if applicable)
- [ ] Dependency/security findings triaged

## Data and release safety

- [ ] Privacy, retention, consent, and export behavior reviewed
- [ ] Logs do not expose credentials or sensitive payloads
- [ ] Rollback and incident response considered
- [ ] Documentation and operational runbooks updated

## Known limitations

Record anything not tested, deferred, environment-dependent, or requiring maintainer configuration.
