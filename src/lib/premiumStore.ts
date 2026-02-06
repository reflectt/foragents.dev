import { promises as fs } from 'fs';
import path from 'path';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

// File-backed fallback store for local dev / no DB.
// Note: in serverless prod, filesystem may be ephemeral; this is an MVP fallback.
const PREMIUM_STATE_PATH = path.join(process.cwd(), 'data', 'premium-state.json');

type PremiumStateFile = {
  agents: Record<
    string,
    {
      isPremium: boolean;
      premiumExpiresAt?: string | null;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      status?: string | null;
      updatedAt?: string;
    }
  >;
  processedStripeEventIds: Record<string, string>; // eventId -> processedAt ISO
};

async function readFileState(): Promise<PremiumStateFile> {
  try {
    const raw = await fs.readFile(PREMIUM_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as PremiumStateFile;
    return {
      agents: parsed.agents || {},
      processedStripeEventIds: parsed.processedStripeEventIds || {},
    };
  } catch {
    return { agents: {}, processedStripeEventIds: {} };
  }
}

async function writeFileState(state: PremiumStateFile): Promise<void> {
  await fs.mkdir(path.dirname(PREMIUM_STATE_PATH), { recursive: true });
  await fs.writeFile(PREMIUM_STATE_PATH, JSON.stringify(state, null, 2));
}

export async function isStripeEventProcessed({
  supabase,
  eventId,
}: {
  supabase: SupabaseClient | null;
  eventId: string;
}): Promise<boolean> {
  if (!eventId) return false;

  if (supabase) {
    // stripe_events table is introduced in migration 005_stripe_events_idempotency.sql
    const { data, error } = await supabase
      .from('stripe_events')
      .select('event_id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      // If the table isn't present yet, fall back to file-based idempotency.
      console.warn('stripe_events lookup failed; falling back to file store:', error.message);
    } else {
      return !!data;
    }
  }

  const state = await readFileState();
  return !!state.processedStripeEventIds[eventId];
}

export async function markStripeEventProcessed({
  supabase,
  event,
}: {
  supabase: SupabaseClient | null;
  event: Stripe.Event;
}): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('stripe_events').insert({
      event_id: event.id,
      type: event.type,
      livemode: event.livemode,
      created: new Date(event.created * 1000).toISOString(),
      processed_at: new Date().toISOString(),
    });

    if (!error) return;

    // Unique violation => already processed
    const code = (error as { code?: string } | null)?.code;
    if (code === '23505') return;

    console.warn('stripe_events insert failed; falling back to file store:', error.message);
  }

  const state = await readFileState();
  state.processedStripeEventIds[event.id] = new Date().toISOString();
  await writeFileState(state);
}

export async function setAgentPremiumByHandleFile({
  agentHandle,
  isPremium,
  premiumExpiresAt,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
}: {
  agentHandle: string;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string | null;
}) {
  const cleanHandle = agentHandle.replace(/^@/, '').trim();
  const state = await readFileState();
  state.agents[cleanHandle] = {
    isPremium,
    premiumExpiresAt: premiumExpiresAt ?? null,
    stripeCustomerId: stripeCustomerId ?? null,
    stripeSubscriptionId: stripeSubscriptionId ?? null,
    status: status ?? null,
    updatedAt: new Date().toISOString(),
  };
  await writeFileState(state);
}

export async function getAgentPremiumByHandle({
  supabase,
  agentHandle,
}: {
  supabase: SupabaseClient | null;
  agentHandle: string;
}): Promise<{ isPremium: boolean; premiumExpiresAt?: string | null } | null> {
  const cleanHandle = agentHandle.replace(/^@/, '').trim();

  if (supabase) {
    const { data, error } = await supabase
      .from('agents')
      .select('is_premium,premium_expires_at')
      .eq('handle', cleanHandle)
      .maybeSingle();

    if (!error && data) {
      return { isPremium: !!data.is_premium, premiumExpiresAt: data.premium_expires_at };
    }
  }

  const state = await readFileState();
  const agent = state.agents[cleanHandle];
  if (!agent) return null;
  return { isPremium: !!agent.isPremium, premiumExpiresAt: agent.premiumExpiresAt };
}
