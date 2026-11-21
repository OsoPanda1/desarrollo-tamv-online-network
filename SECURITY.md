# Security Policy

TAMV Online Network accepts responsible reports of vulnerabilities affecting this repository and its deployed services.

## Reporting

Please use GitHub's **Report a vulnerability** workflow in the repository's Security tab when private vulnerability reporting is enabled. If that option is unavailable, contact the repository maintainers through a verified, current channel listed in the repository profile and request a private reporting channel. Do not publish exploit details, credentials, personal data, or proof-of-concept payloads in public issues.

Include:
- affected component, route, commit or release;
- impact and realistic attack prerequisites;
- minimal reproduction steps that do not access other people's data;
- logs or screenshots with secrets and personal information removed;
- any suggested mitigation.

Do not test against systems or accounts you do not own or have explicit permission to assess.

## Response objectives

These are target service levels, not a guarantee:
- acknowledge a report within 5 business days;
- triage severity and scope within 10 business days;
- coordinate remediation, validation, and disclosure with the reporter.

Critical issues that expose credentials, permit unauthorized access to sensitive data, or enable remote code execution should be escalated as soon as practicable.

## Scope and limitations

The policy covers this repository and services explicitly operated by its maintainers. Third-party providers, companion repositories, and deployments have their own security boundaries and reporting processes. A passing CI workflow does not constitute a penetration test, security certification, or proof that production configuration is safe.

Never include real secrets in issues, pull requests, commits, CI logs, or sample environment files.
