import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from '@/lib/requestLimits';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const MAX_BODY_BYTES = 256_000;

/**
 * Legacy route (kept for backward compatibility).
 * Prefer POST /api/stripe/webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`stripe:webhook-legacy:${ip}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const payload = await readTextWithLimit(req, MAX_BODY_BYTES);
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
  } catch (error) {
    console.error('Stripe webhook error:', error);

    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : 500;
    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
