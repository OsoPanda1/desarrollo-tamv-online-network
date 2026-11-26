-- Shared fixed-window counters for unauthenticated public endpoints.
-- The primary key makes the increment in lib/rate-limit/server.ts atomic across
-- serverless instances. Identity keys use HMAC-SHA-256 with the secret
-- TAMV_RATE_LIMIT_SALT; raw client IPs are never persisted. The server fails closed
-- if the per-environment secret is absent/too short. Apply only with scripts/db-migrate.mjs after a tested backup.
CREATE TABLE IF NOT EXISTS public.tamv_rate_limit_counters (
  bucket TEXT NOT NULL,
  window_start_ms BIGINT NOT NULL,
  hits BIGINT NOT NULL DEFAULT 1 CHECK (hits > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, window_start_ms)
);

CREATE INDEX IF NOT EXISTS tamv_rate_limit_counters_window_idx
  ON public.tamv_rate_limit_counters (window_start_ms);
