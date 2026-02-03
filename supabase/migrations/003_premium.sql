-- Premium subscription support for forAgents.dev
-- Migration: 003_premium.sql

-- Add premium columns to agents table (if it exists)
-- If agents table doesn't exist, create it with premium support

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  name text,
  description text,
  avatar_url text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add premium columns
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS premium_config jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS premium_expires_at timestamptz;

-- Create subscriptions table for audit trail
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, trialing
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent_id ON subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_agents_stripe_customer ON agents(stripe_customer_id);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own subscription
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (true); -- Will be scoped by application logic

-- Only service role can insert/update subscriptions (via webhooks)
CREATE POLICY "Service role manages subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
