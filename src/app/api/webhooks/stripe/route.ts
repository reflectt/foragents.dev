import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const event = constructWebhookEvent(payload, signature, webhookSecret);
  
  if (!event) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session, supabase);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, supabase);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: SupabaseClient | null
) {
  const agentId = session.metadata?.agentId;
  const customerId = session.customer as string;

  if (!agentId || !supabase) return;

  // Link customer to agent
  await supabase
    .from('agents')
    .update({ 
      stripe_customer_id: customerId,
      is_premium: true,
    })
    .eq('id', agentId);

  console.log(`Checkout complete for agent ${agentId}`);
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient | null
) {
  if (!supabase) return;

  const agentId = subscription.metadata?.agentId;
  const customerId = subscription.customer as string;
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  // Upsert subscription record
  await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      agent_id: agentId,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  // Update agent premium status
  if (agentId) {
    await supabase
      .from('agents')
      .update({ 
        is_premium: isActive,
        premium_expires_at: isActive 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      })
      .eq('id', agentId);
  } else if (customerId) {
    // Fallback: find agent by customer ID
    await supabase
      .from('agents')
      .update({ 
        is_premium: isActive,
        premium_expires_at: isActive 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      })
      .eq('stripe_customer_id', customerId);
  }

  console.log(`Subscription ${subscription.id} updated: ${subscription.status}`);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient | null
) {
  if (!supabase) return;

  const customerId = subscription.customer as string;

  // Mark subscription as canceled
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Remove premium status from agent
  await supabase
    .from('agents')
    .update({ 
      is_premium: false,
      premium_expires_at: null,
    })
    .eq('stripe_customer_id', customerId);

  console.log(`Subscription ${subscription.id} deleted`);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: SupabaseClient | null
) {
  if (!supabase) return;

  const customerId = invoice.customer as string;

  // Update subscription status
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  console.log(`Payment failed for customer ${customerId}`);
}
