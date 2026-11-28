-- Checkout bindings and subscription lifecycle events have independent ordering domains.
-- Existing subscription rows retain their status watermark; checkout ordering starts at zero.
ALTER TABLE public.membership_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_checkout_event_created integer NOT NULL DEFAULT 0
  CHECK (stripe_checkout_event_created >= 0);

-- The former status-only unique index also blocked replacement checkout after
-- an active/trialing period had expired. Checkout creation is serialized by the
-- account row lock and now evaluates current_period_end before reserving a plan.
DROP INDEX IF EXISTS public.membership_one_live_plan_per_user_idx;
CREATE INDEX IF NOT EXISTS membership_plan_history_idx
  ON public.membership_subscriptions (user_id, plan_id, created_at DESC);
