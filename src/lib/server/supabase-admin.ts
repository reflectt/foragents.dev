import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  if (!_admin) {
    _admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return _admin;
}

export function requireSupabaseAdmin(): SupabaseClient {
  const admin = getSupabaseAdmin();
  if (!admin) {
    // Avoid leaking which variable is missing in production logs? Keep concise.
    throw new Error('Supabase admin not configured');
  }
  return admin;
}
