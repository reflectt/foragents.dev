import { NextRequest, NextResponse } from 'next/server';
import { requireCronAuth } from '@/lib/server/cron-auth';
import { requireSupabaseAdmin } from '@/lib/server/supabase-admin';
import { generateDailyDigest } from '@/lib/digest';

/**
 * Daily digest cron job
 * Triggered by Vercel Cron or external scheduler
 * 
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/digest",
 *     "schedule": "0 7 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  const auth = requireCronAuth(req);
  if (!auth.authorized) return auth.response;

  let supabase;
  try {
    supabase = requireSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Fetch premium subscribers
    const { data: premiumAgents, error: agentsError } = await supabase
      .from('agents')
      .select('id, handle, name, email')
      .eq('is_premium', true);

    if (agentsError || !premiumAgents || premiumAgents.length === 0) {
      return NextResponse.json({ 
        message: 'No premium subscribers found',
        count: 0 
      });
    }

    // Fetch new content from last 24h
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get new agents
    const { data: newAgents } = await supabase
      .from('agents')
      .select('handle, name, description')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    // Get trending agents (by view count - placeholder for now)
    const { data: trendingAgents } = await supabase
      .from('agents')
      .select('handle, name, description, avatar_url')
      .order('created_at', { ascending: false })
      .limit(5);

    // TODO: Fetch new skills, tools, etc. when those tables exist

    // Generate digest (email sending not implemented yet)
    const digest = generateDailyDigest();
    
    // TODO: Implement email sending
    // For now, just return the digest data
    const sentCount = 0;
    const errorCount = 0;

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      totalSubscribers: premiumAgents.length,
    });
  } catch (err) {
    console.error('Digest cron error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

// Also support POST for manual triggers
export const POST = GET;
