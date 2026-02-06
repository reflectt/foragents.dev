import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _adminClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client.
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY when present (needed for Stripe webhooks / writes).
 * Falls back to SUPABASE_ANON_KEY for local/dev read-only usage.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  const key = serviceKey || anonKey;
  if (!url || !key) return null;

  if (!_adminClient) {
    _adminClient = createClient(url, key);
  }

  return _adminClient;
}
