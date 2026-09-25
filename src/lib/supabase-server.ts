import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// =============================================================================
// ADMIN SESSION CLIENT
// =============================================================================
// This client acts as the SIGNED IN ADMIN, using the public anon key.
// It is deliberately weaker than the service role client: Row Level Security
// still applies, so even a bug here cannot expose other customers or bypass the
// security policies.
// =============================================================================

export async function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. The middleware refreshes the
          // session instead, so this can safely be ignored.
        }
      },
    },
  });
}