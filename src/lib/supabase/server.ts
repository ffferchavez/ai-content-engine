import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseEnv } from "@/lib/env";

/**
 * Server Supabase client (session cookies + RLS as the signed-in user).
 *
 * Bootstrap: `public.handle_new_user` on `auth.users` creates `profiles`, a default
 * `organizations` row ("My workspace"), and `organization_members` as `owner`.
 * Requires the migration applied in Supabase.
 */
export async function createClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without mutable cookies — proxy refreshes session.
          }
        },
      },
    },
  );
}
