// Server-only Supabase client with the service_role key.
// Bypasses RLS. NEVER import from a client component.
//
// Runtime guard: if this ever gets bundled into a browser build,
// throw immediately instead of silently using a missing key.
import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/service.ts must not be imported in the browser');
}

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
