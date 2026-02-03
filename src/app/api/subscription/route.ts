import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');

  if (!handle) {
    return NextResponse.json(
      { error: 'Agent handle is required' },
      { status: 400 }
    );
  }

  const cleanHandle = handle.replace(/^@/, '').trim();
  const supabase = getSupabase();

  if (!supabase) {
    // Return mock data if no database
    return NextResponse.json({
      status: 'inactive',
      message: 'Database not configured',
    });
  }

  try {
    // Get agent with subscription info
    const { data: agent, error } = await supabase
      .from('agents')
      .select(`
        id,
        handle,
        is_premium,
        premium_expires_at,
        stripe_customer_id
      `)
      .eq('handle', cleanHandle)
      .single();

    if (error || !agent) {
      return NextResponse.json({
        status: 'inactive',
        message: 'Agent not found',
      });
    }

    // Get subscription details if they exist
    let subscriptionDetails = null;
    if (agent.stripe_customer_id) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', agent.stripe_customer_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscriptionDetails = sub;
    }

    return NextResponse.json({
      status: agent.is_premium ? (subscriptionDetails?.status || 'active') : 'inactive',
      currentPeriodEnd: subscriptionDetails?.current_period_end || agent.premium_expires_at,
      cancelAtPeriodEnd: subscriptionDetails?.cancel_at_period_end || false,
      agentId: agent.id,
      hasStripeCustomer: !!agent.stripe_customer_id,
    });
  } catch (error) {
    console.error('Subscription lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up subscription' },
      { status: 500 }
    );
  }
}
