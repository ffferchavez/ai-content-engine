import { createBrowserClient } from "@supabase/ssr";
import { readPublicSupabaseEnv } from "@/lib/env";

export function createClient() {
  const config = readPublicSupabaseEnv();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local (run `npm run verify:env`).",
    );
  }
  return createBrowserClient(config.url, config.anonKey);
}
