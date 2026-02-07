import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';
import { createPortalSession } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

const MAX_JSON_BYTES = 1_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`subscription:portal:${ip}`, { windowMs: 60_000, max: 15 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const { agentHandle } = await readJsonWithLimit<{ agentHandle?: unknown }>(req, MAX_JSON_BYTES);

    if (typeof agentHandle !== 'string' || !agentHandle.trim()) {
      return NextResponse.json({ error: 'Agent handle is required' }, { status: 400 });
    }

    const cleanHandle = agentHandle.replace(/^@/, '').trim();
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get agent's Stripe customer ID
    const { data: agent, error } = await supabase
      .from('agents')
      .select('stripe_customer_id')
      .eq('handle', cleanHandle)
      .single();

    if (error || !agent?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found for this agent' },
        { status: 404 }
      );
    }

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://foragents.dev';
    
    const session = await createPortalSession({
      customerId: agent.stripe_customer_id,
      returnUrl: `${baseUrl}/settings/billing`,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create portal session. Stripe may not be configured.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
