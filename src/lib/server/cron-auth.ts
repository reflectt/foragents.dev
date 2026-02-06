import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron auth for production hardening.
 *
 * Policy:
 * - Allow requests that originate from Vercel Cron (x-vercel-cron: 1)
 * - OR allow Authorization: Bearer <CRON_SECRET>
 *
 * Note: The Vercel cron header is assumed to be injected by the platform.
 */
export function requireCronAuth(req: NextRequest): { authorized: true } | { authorized: false; response: NextResponse } {
  const isVercelCron = (req.headers.get('x-vercel-cron') || '').toLowerCase();
  if (isVercelCron === '1' || isVercelCron === 'true') {
    return { authorized: true };
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      ),
    };
  }

  const authHeader = req.headers.get('authorization') || '';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { authorized: true };
}
