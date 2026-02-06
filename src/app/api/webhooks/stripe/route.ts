import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Legacy route (kept for backward compatibility).
 * Prefer POST /api/stripe/webhook.
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const event = constructWebhookEvent(payload, signature, webhookSecret);
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const result = await handleStripeWebhookEvent({ event, supabase });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
