import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { agentHandle } = await req.json();

    if (!agentHandle) {
      return NextResponse.json(
        { error: 'Agent handle is required' },
        { status: 400 }
      );
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
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
