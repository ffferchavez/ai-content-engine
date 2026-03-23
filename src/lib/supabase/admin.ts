import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/lib/env";
import { getOptionalServiceRoleKey } from "@/lib/env/server";

/**
 * Service-role client for trusted server operations (e.g. Storage uploads).
 * Never import in Client Components or route handlers that forward to the browser.
 */
export function createServiceRoleClient() {
  const key = getOptionalServiceRoleKey();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  const { url } = requirePublicSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
