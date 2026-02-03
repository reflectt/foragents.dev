-- Premium Features Migration
-- Created: 2026-02-03

-- Add premium columns to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS premium_config JSONB DEFAULT '{}';

-- Create subscriptions audit table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid')),
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_stripe_customer_id ON agents (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_premium ON agents (is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent_id ON subscriptions (agent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage subscriptions (webhooks)
CREATE POLICY "Service role full access" ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON COLUMN agents.is_premium IS 'Whether agent has active premium subscription';
COMMENT ON COLUMN agents.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN agents.premium_config IS 'Premium features config: {pinned_skills: [], custom_links: {}, accent_color: string, extended_bio: string}';
COMMENT ON TABLE subscriptions IS 'Audit trail for Stripe subscription events';
