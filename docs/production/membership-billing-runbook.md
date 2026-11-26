# TAMV memberships — production and billing runbook

**Prepared:** 2026-11-23  
**State:** implementation branch; not evidence of a successful deploy or live Stripe account.

## Product contracts

- Individual membership: **MXN $229 / month**.
- Business membership: **MXN $699 / organization / month**.
- Billing is recurring through Stripe Checkout Sessions in subscription mode; cancellation and payment-method management use Stripe Customer Portal.
- A signed Stripe webhook is the authority for membership state. A browser redirect to the success URL does not activate membership.
- The course `/formacion` is gated by an active or trialing subscription and saves per-module progress under the authenticated user.
- Collaboration benefits provide a path to apply and are subject to project review and capacity. No investment, financing, acceptance, or investor meeting is guaranteed.
- AI Lounge is an independent third party. TAMV has not configured or verified an affiliate partnership, invitation entitlement or included AI Lounge Pro access. The current integration links to the public site only.

## Product boundaries that must remain visible

- The business plan is billed per organization name but, in this release, the subscription and course entitlement are tied to the contracting user account. Organization workspaces, employee invitations, seat management and transfers are **not implemented**.
- AI Lounge is a third-party service. This repository has no confirmed commercial agreement, referral code, entitlement API or included paid pass. Only public links and guidance are part of this release.
- Project collaboration is an application/selection pathway, not an automatic assignment to paid work, a guaranteed contract or a guaranteed investor introduction.

## Future institutionalization and ROR objective

The public page at /institucionalizacion documents a possible future destination for net operating revenue: legal and administrative formalization of TAMV and preparation of evidence for a Research Organization Registry (ROR) record. Any allocation requires a governance decision, an approved budget, transparent accounts and professional review. No current membership fee is contractually reserved for that purpose, and no date or ROR inclusion is guaranteed. The ROR identifier itself is free; legal and evidence-preparation costs are separate. This goal is not a substitute for the live-billing launch gate.

## Required environment variables

Set through the deployment secret manager, never commit real values:

| Variable | Purpose | Required for |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with SSL/pooling appropriate for the provider | Database, memberships, progress |
| `BETTER_AUTH_SECRET` | High-entropy Better Auth secret (at least 32 random characters) | Authentication |
| `BETTER_AUTH_URL` | Canonical application URL used by authentication | Authentication |
| `APP_URL` | Canonical HTTPS origin for checkout return/portal URLs | Billing |
| `STRIPE_SECRET_KEY` | Server-only `sk_test_...` or `sk_live_...` key | Checkout and portal |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the exact Stripe webhook endpoint | Webhook processing |
| `TAMV_BILLING_MODE` | `disabled`, `test`, or `live`; default is disabled | Checkout kill switch |
| `TAMV_MEMBERSHIP_TERMS_VERSION` | Approved version identifier: `TAMV-MEMBERSHIP-TERMS-2026-11-23-v1` | Live checkout only |
| `TAMV_MEMBERSHIP_PRIVACY_APPROVED` | Set to `true` only after the definitive notice is approved | Live checkout only |
| `TAMV_MEMBERSHIP_LEGAL_APPROVED` | Set to `true` only after the legal operator/entity and terms review | Live checkout only |
| `TAMV_MEMBERSHIP_TAX_APPROVED` | Set to `true` only after the price/tax treatment is determined for the actual operator | Live checkout only |
| `TAMV_MEMBERSHIP_REFUNDS_APPROVED` | Set to `true` only after cancellation, refund and support policies are finalized | Live checkout only |
| `STRIPE_AUTOMATIC_TAX_ENABLED` | Optional Stripe Tax activation; defaults off | Optional tax calculation |
| `STRIPE_TAX_BEHAVIOR` | `inclusive` or `exclusive` when automatic tax is enabled | Optional tax calculation |

`TAMV_BILLING_MODE=disabled` disables new checkout by default. `test` is for non-production deployments with a test key. `live` requires a live key; production checkout additionally requires the approved terms version and explicit privacy, legal, tax and refunds approval flags. These flags are deployment gates, not a substitute for legal or tax review. The Customer Portal must be configured in Stripe to permit the intended cancellation and payment-method flows.

## Database migration

After successful CI and before enabling billing, run the repository migration workflow with the intended `DATABASE_URL`:

```sh
pnpm db:preflight
pnpm db:migrate
pnpm db:preflight
```

Migration `0003_memberships_billing.sql` is additive: subscriptions, idempotent webhook receipt records and member-course progress. The migration runner uses an advisory lock and refuses to modify the hash of an already applied migration. Back up the target database and verify the target environment before applying.

## Stripe setup

1. In Stripe test mode, create/verify the product and subscription flows through Checkout. The implementation currently creates recurring price data inline for the two fixed plans; the application, not the browser, chooses the allowed prices.
2. Register a webhook endpoint at `https://<APP_URL>/api/webhooks/stripe` and configure `STRIPE_WEBHOOK_SECRET` for that endpoint.
3. Subscribe the endpoint to at least `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.payment_failed`, `invoice.paid` and `invoice.payment_succeeded`.
4. Configure the Customer Portal cancellation behavior and verify whether cancellation is immediate or at period end. Test failed renewal, cancellation, a repeated webhook delivery and webhook delivery out of order.
5. Configure Mexican tax registrations/tax behavior and determine whether advertised prices include or exclude tax before live mode. Do not enable `STRIPE_AUTOMATIC_TAX_ENABLED=true` until Stripe Tax is configured and the tax behavior is explicitly set.
6. Complete the legal operator identity, definitive privacy notice, cancellation/refund policy, support process, and any consumer-law disclosures. Only then approve the version flags and use live credentials.

## Validation and acceptance criteria

- `pnpm install --frozen-lockfile` succeeds with pnpm 12.3.4.
- `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
- Stripe test checkout produces one subscription at MXN 229 or 699, not a client-supplied amount.
- The webhook rejects an invalid signature and a stale timestamp; repeated event IDs are idempotent.
- Subscription events change the stored state monotonically, including cancellation and failed renewal.
- Users cannot read another account's membership or course progress; a non-member receives 403 from course-progress API and sees the gate page.
- Course progress survives sign-out/sign-in; portal session creation is restricted to the signed-in owner and selected plan.
- Test checkout return alone never activates access; only a verified Stripe webhook changes entitlement.
- The readiness endpoint's database probe is not a substitute for checking that migrations and auth/billing configuration are in place.
- Vercel preview and production build evidence is captured before merging or declaring deployment complete.

## Current blockers that cannot be closed from code alone

- This connector cannot provide or create the operator's Stripe keys, webhook secret, tax registration, portal configuration, or live-mode approval.
- The current Vercel/Stripe account links must be verified by the repository owner.
- The privacy/terms pages in this branch state the outstanding legal decisions. Do not set approval flags until the responsible operator has completed those reviews.
- A repository-root `LICENSE` is present and contains Apache License 2.0; `LICENSE-DOCS` contains CC BY 4.0 and `LICENSES.md` documents their intended scopes. This corrects an older audit statement that the root license was absent. The files do not establish ownership or clearance of every contribution, trademark, external repository, cultural record, or media asset. Review rights and file-specific notices before redistribution or commercial use.
- No preview build or browser E2E is considered passed until CI/Vercel reports it and the relevant routes are exercised.
