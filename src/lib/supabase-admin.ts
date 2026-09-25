import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The "server-only" import above makes the build FAIL if this file is ever
// imported into browser code. That protects the secret service role key.

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The website can still run before Supabase is set up. In that case orders are
// validated and handled through WhatsApp instead of being stored.
export const isDatabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

let cached: SupabaseClient | null = null;

// Returns a server-only Supabase client, or null when it is not configured.
//
// The service role key bypasses Row Level Security, which is why it must stay
// on the server. It must never be given the NEXT_PUBLIC_ prefix, because any
// variable with that prefix is visible to every visitor.
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) return null;

  if (!cached) {
    cached = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cached;
}