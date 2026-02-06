import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isStripeEventProcessed,
  markStripeEventProcessed,
  setAgentPremiumByHandleFile,
} from '@/lib/premiumStore';
import { mapSubscriptionStatus } from '@/lib/stripe';

export async function handleStripeWebhookEvent({
  event,
  supabase,
}: {
  event: Stripe.Event;
  supabase: SupabaseClient | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // Idempotency
  const alreadyProcessed = await isStripeEventProcessed({ supabase, eventId: event.id });
  if (alreadyProcessed) return { ok: true };

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
        // Ignore unknown events; still mark processed for idempotency.
        break;
    }

    await markStripeEventProcessed({ supabase, event });
    return { ok: true };
  } catch (err: unknown) {
    console.error('Stripe webhook event handling failed:', err);
    return { ok: false, error: 'Webhook handler failed' };
  }
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: SupabaseClient | null
) {
  const agentId = session.metadata?.agentId;
  const agentHandle = session.metadata?.agentHandle;
  const customerId = (session.customer as string) || null;

  if (supabase) {
    if (!agentId) return;

    await supabase
      .from('agents')
      .update({
        stripe_customer_id: customerId,
        is_premium: true,
      })
      .eq('id', agentId);

    return;
  }

  // File fallback
  if (agentHandle) {
    await setAgentPremiumByHandleFile({
      agentHandle,
      isPremium: true,
      stripeCustomerId: customerId,
      status: 'active',
    });
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient | null
) {
  const agentId = subscription.metadata?.agentId;
  const agentHandle = subscription.metadata?.agentHandle;
  const customerId = (subscription.customer as string) || null;
  const mappedStatus = mapSubscriptionStatus(subscription.status);
  const isActive = mappedStatus === 'active' || mappedStatus === 'trialing';

  const currentPeriodEndIso = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  if (supabase) {
    await supabase
      .from('subscriptions')
      .upsert(
        {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          agent_id: agentId,
          status: mappedStatus,
          price_id: subscription.items.data[0]?.price.id,
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null,
          current_period_end: currentPeriodEndIso,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_subscription_id' }
      );

    if (agentId) {
      await supabase
        .from('agents')
        .update({
          is_premium: isActive,
          premium_expires_at: isActive ? currentPeriodEndIso : null,
          stripe_customer_id: customerId,
        })
        .eq('id', agentId);
    } else if (customerId) {
      await supabase
        .from('agents')
        .update({
          is_premium: isActive,
          premium_expires_at: isActive ? currentPeriodEndIso : null,
        })
        .eq('stripe_customer_id', customerId);
    }

    return;
  }

  if (agentHandle) {
    await setAgentPremiumByHandleFile({
      agentHandle,
      isPremium: isActive,
      premiumExpiresAt: isActive ? currentPeriodEndIso : null,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: mappedStatus,
    });
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient | null
) {
  const customerId = (subscription.customer as string) || null;
  const agentHandle = subscription.metadata?.agentHandle;

  if (supabase) {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.id);

    if (customerId) {
      await supabase
        .from('agents')
        .update({ is_premium: false, premium_expires_at: null })
        .eq('stripe_customer_id', customerId);
    }

    return;
  }

  if (agentHandle) {
    await setAgentPremiumByHandleFile({
      agentHandle,
      isPremium: false,
      premiumExpiresAt: null,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: 'canceled',
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: SupabaseClient | null) {
  if (supabase) {
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', invoice.subscription);
    }
    return;
  }

  // File fallback: we don't have enough info to map reliably without metadata.
}
