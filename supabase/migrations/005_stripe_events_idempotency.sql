-- Stripe webhook idempotency
-- Created: 2026-02-06

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  created TIMESTAMPTZ,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at ON stripe_events (processed_at DESC);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert/read all events (webhooks)
CREATE POLICY "Service role full access stripe_events" ON stripe_events
  FOR ALL
  USING (true)
  WITH CHECK (true);
