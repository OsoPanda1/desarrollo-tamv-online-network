-- TAMV recurring memberships, Stripe event idempotency and gated course progress.
-- Additive migration: existing identities, research records and proposals are preserved.

CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  plan_id text NOT NULL CHECK (plan_id IN ('individual', 'business')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'trialing', 'past_due', 'unpaid', 'canceled',
      'incomplete', 'incomplete_expired', 'paused', 'checkout_failed', 'checkout_expired')),
  amount_mxn integer NOT NULL CHECK (amount_mxn IN (229, 699)),
  currency text NOT NULL DEFAULT 'mxn' CHECK (currency = 'mxn'),
  business_name text,
  business_website text,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_event_created integer NOT NULL DEFAULT 0 CHECK (stripe_event_created >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT membership_business_name_required
    CHECK (plan_id <> 'business' OR (business_name IS NOT NULL AND length(trim(business_name)) >= 2))
);

-- One live subscription of each plan per user; permits an individual and a business plan
-- to coexist for a founder who separately owns a business membership.
CREATE UNIQUE INDEX IF NOT EXISTS membership_one_live_plan_per_user_idx
  ON membership_subscriptions (user_id, plan_id)
  WHERE status IN ('pending', 'active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'paused');

CREATE INDEX IF NOT EXISTS membership_user_history_idx
  ON membership_subscriptions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS membership_status_period_idx
  ON membership_subscriptions (status, current_period_end);

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_course_progress (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS member_course_progress_once_idx
  ON member_course_progress (user_id, course_slug, module_id);

CREATE INDEX IF NOT EXISTS member_course_progress_course_idx
  ON member_course_progress (course_slug, module_id, completed_at DESC);
