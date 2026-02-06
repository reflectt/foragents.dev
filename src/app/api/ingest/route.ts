import { NextRequest, NextResponse } from 'next/server';
import { runIngestion } from '@/lib/ingest-runtime';
import { requireCronAuth } from '@/lib/server/cron-auth';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';

export const maxDuration = 60; // Allow up to 60 seconds for ingestion

export async function POST(req: NextRequest) {
  const auth = requireCronAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    console.log('Starting news ingestion...');
    const { items, stats } = await runIngestion();
    
    // Save to Supabase (admin) if configured
    const supabase = getSupabaseAdmin();
    let saved = 0;

    if (supabase) {
      // Upsert items to news table
      for (const item of items.slice(0, 100)) { // Limit to 100 newest
        const { error } = await supabase
          .from('news')
          .upsert({
            id: item.id,
            title: item.title,
            summary: item.summary,
            source_url: item.source_url,
            source_name: item.source_name,
            tags: item.tags,
            published_at: item.published_at,
          }, { onConflict: 'id' });
        
        if (!error) saved++;
      }
    }
    
    console.log('Ingestion complete:', { ...stats, saved });
    
    return NextResponse.json({
      success: true,
      stats,
      saved,
      supabaseConfigured: !!supabase,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { 
        error: 'Ingestion failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET || '';

  // Vercel Cron triggers GET requests. It includes a header that we can use to
  // distinguish cron traffic from normal public traffic.
  // Note: This header can be spoofed, so keep CRON_SECRET enabled for manual POSTs.
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';

  // If this is a Vercel Cron invocation, run ingestion (still requires cron auth policy).
  if (isVercelCron) {
    const auth = requireCronAuth(req);
    if (!auth.authorized) return auth.response;

    try {
      console.log('Starting news ingestion (vercel cron GET)...');
      const { items, stats } = await runIngestion();

      // Save to Supabase (admin) if configured
      const supabase = getSupabaseAdmin();
      let saved = 0;

      if (supabase) {
        for (const item of items.slice(0, 100)) {
          const { error } = await supabase
            .from('news')
            .upsert(
              {
                id: item.id,
                title: item.title,
                summary: item.summary,
                source_url: item.source_url,
                source_name: item.source_name,
                tags: item.tags,
                published_at: item.published_at,
              },
              { onConflict: 'id' }
            );

          if (!error) saved++;
        }
      }

      console.log('Cron ingestion complete:', { ...stats, saved });

      return NextResponse.json({
        success: true,
        stats,
        saved,
        supabaseConfigured: !!supabase,
        timestamp: new Date().toISOString(),
        via: 'vercel-cron',
      });
    } catch (error) {
      console.error('Ingestion error:', error);
      return NextResponse.json(
        {
          error: 'Ingestion failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  // Otherwise, return status (no auth) so humans can verify the endpoint.
  return NextResponse.json({
    endpoint: '/api/ingest',
    methods: ['POST (manual)', 'GET (vercel cron)'],
    description: 'Triggers RSS feed ingestion for news items',
    auth: {
      post: CRON_SECRET ? 'Bearer token required (CRON_SECRET)' : 'none (CRON_SECRET not set)',
      get: 'Vercel Cron (x-vercel-cron header)',
    },
    schedule: 'Every 2 hours via Vercel Cron',
  });
}
