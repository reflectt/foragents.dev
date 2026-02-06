import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/portal-session
 *
 * Body:
 *  - agentHandle: string
 */
export async function POST(req: NextRequest) {
  try {
    const { agentHandle } = await req.json();

    if (!agentHandle) {
      return NextResponse.json({ error: 'agentHandle is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const clean = (agentHandle as string).replace(/^@/, '').trim();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('stripe_customer_id')
      .eq('handle', clean)
      .single();

    if (error || !agent?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found for this agent' }, { status: 404 });
    }

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
    console.error('Portal session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
