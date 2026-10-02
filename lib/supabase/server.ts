import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { assertDatabaseSafety } from './database-safety';

let cachedServerClient: SupabaseClient | null = null;

/**
 * Creates or retrieves a server-side Supabase client with administrative privileges.
 * Strictly forbidden to be imported or executed on the client side.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  assertDatabaseSafety();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

  cachedServerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedServerClient;
}
