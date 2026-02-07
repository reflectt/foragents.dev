import { NextRequest } from 'next/server';

jest.mock('@/lib/stripe', () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

import { createCheckoutSession } from '@/lib/stripe';
import { __resetRateLimitsForTests } from '@/lib/requestLimits';
import { POST as subscribePOST } from '@/app/api/subscribe/route';

describe('/api/subscribe', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    __resetRateLimitsForTests();
  });

  test('passes plan through to createCheckoutSession', async () => {
    (createCheckoutSession as unknown as jest.Mock).mockResolvedValue({ url: 'https://stripe.test/checkout' });

    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({ email: 'test@example.com', plan: 'annual' }),
    });

    const res = await subscribePOST(req);
    expect(res.status).toBe(200);

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'annual',
        agentHandle: 'test',
      })
    );
  });

  test('rejects overly large payloads', async () => {
    const bigEmail = `test@${'a'.repeat(5000)}.com`;

    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({ email: bigEmail, plan: 'monthly' }),
    });

    const res = await subscribePOST(req);
    expect(res.status).toBe(413);
  });
});
