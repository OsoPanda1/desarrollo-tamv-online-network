-- Restricted LGS audit ledger. Apply only through scripts/db-migrate.mjs after a tested backup.
-- The ledger stores minimal structured events; do not put raw prompts, secrets or sensitive payloads in metadata.
CREATE TABLE IF NOT EXISTS public.lgs_audit_events (
  sequence INTEGER PRIMARY KEY CHECK (sequence > 0),
  event_id TEXT NOT NULL UNIQUE,
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  actor_ref TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('system.reviewed', 'risk.assessed', 'gate.checked', 'specification.viewed')),
  subject_ref TEXT NOT NULL CHECK (length(subject_ref) BETWEEN 1 AND 160),
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'failure')),
  policy_version TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  previous_hash TEXT NOT NULL CHECK (previous_hash ~ '^[0-9a-f]{64}$'),
  event_hash TEXT NOT NULL UNIQUE CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lgs_audit_events_occurred_at_idx
  ON public.lgs_audit_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS lgs_audit_events_actor_idx
  ON public.lgs_audit_events (actor_user_id, occurred_at DESC);

REVOKE ALL ON TABLE public.lgs_audit_events FROM PUBLIC;


-- Prevent accidental mutation through the application connection. A separately
-- governed retention procedure must be designed before any purge is permitted.
CREATE OR REPLACE FUNCTION public.lgs_reject_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'LGS audit ledger is append-only; UPDATE/DELETE is prohibited';
END;
$$;

DROP TRIGGER IF EXISTS lgs_audit_events_no_mutation ON public.lgs_audit_events;
CREATE TRIGGER lgs_audit_events_no_mutation
  BEFORE UPDATE OR DELETE ON public.lgs_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.lgs_reject_audit_mutation();


DROP TRIGGER IF EXISTS lgs_audit_events_no_truncate ON public.lgs_audit_events;
CREATE TRIGGER lgs_audit_events_no_truncate
  BEFORE TRUNCATE ON public.lgs_audit_events
  FOR EACH STATEMENT EXECUTE FUNCTION public.lgs_reject_audit_mutation();
