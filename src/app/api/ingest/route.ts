import { NextRequest, NextResponse } from 'next/server';
import { runIngestion } from '@/lib/ingest-runtime';
import { getSupabase } from '@/lib/supabase';

// Protect with a secret key
const CRON_SECRET = process.env.CRON_SECRET || '';

export const maxDuration = 60; // Allow up to 60 seconds for ingestion

export async function POST(req: NextRequest) {
  // Verify the request is authorized
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting news ingestion...');
    const { items, stats } = await runIngestion();
    
    // Try to save to Supabase if configured
    const supabase = getSupabase();
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
  // Allow checking status without auth
  return NextResponse.json({
    endpoint: '/api/ingest',
    method: 'POST',
    description: 'Triggers RSS feed ingestion for news items',
    auth: 'Bearer token required (CRON_SECRET)',
    schedule: 'Every 2 hours via Vercel Cron',
  });
}
