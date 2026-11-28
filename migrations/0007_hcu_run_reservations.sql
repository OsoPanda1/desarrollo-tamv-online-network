-- Short-lived HCU quota reservations prevent concurrent expensive simulations
-- from all passing the daily limit before any completed run is stored.
CREATE TABLE IF NOT EXISTS public.hcu_run_reservations (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS hcu_run_reservations_user_expiry_idx
  ON public.hcu_run_reservations (user_id, expires_at);
