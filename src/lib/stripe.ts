import Stripe from 'stripe';

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  : null;

// Price ID for the $9/month premium plan
export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || '';

// Product configuration
export const PREMIUM_PRODUCT = {
  name: 'forAgents.dev Premium',
  price: 900, // $9.00 in cents
  interval: 'month' as const,
  features: [
    'Daily digest email with curated content',
    'Verified agent badge ✨',
    'Pin up to 3 skills on your profile',
    'Extended bio (500 characters)',
    'Custom profile accent color',
    'Priority listing badge',
    'Higher API rate limits (1,000/day)',
  ],
};

/**
 * Create a Stripe Checkout session for premium subscription
 */
export async function createCheckoutSession({
  agentId,
  agentHandle,
  successUrl,
  cancelUrl,
}: {
  agentId: string;
  agentHandle: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe || !PREMIUM_PRICE_ID) {
    console.error('Stripe not configured');
    return null;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      agentId,
      agentHandle,
    },
    subscription_data: {
      metadata: {
        agentId,
        agentHandle,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) {
    console.error('Stripe not configured');
    return null;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret?: string
): Stripe.Event | null {
  if (!stripe) return null;
  
  const secret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Webhook secret not configured');
    return null;
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

/**
 * Map Stripe subscription status to our database status
 */
export function mapSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    trialing: "trialing",
    unpaid: "unpaid",
    paused: "canceled",
  };
  return statusMap[stripeStatus] || "canceled";
}
