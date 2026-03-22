/**
 * Public (browser-safe) environment values.
 * Never import server-only secrets here — use `@/lib/env/server` on the server only.
 */

export type PublicSupabaseConfig = {
  url: string;
  /** Browser-safe key: JWT `anon` key or `sb_publishable_*` (dashboard “Publishable” key). */
  anonKey: string;
};

/**
 * Supabase dashboard may show “Publishable key” (`sb_publishable_*`) or the legacy JWT anon key.
 * Prefer the publishable var when set so `.env.local` matches the dashboard copy-paste flow.
 */
function resolvePublicSupabaseKey(): string | undefined {
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return publishable || anon;
}

/**
 * Returns Supabase URL + public (anon/publishable) key when both are set and pass basic sanity checks
 * (aligned with `scripts/verify-env.mjs`). Returns `null` if missing or placeholder.
 */
export function readPublicSupabaseEnv(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = resolvePublicSupabaseKey();
  if (!url || !anonKey) return null;
  if (url.includes("YOUR_PROJECT")) return null;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) return null;
  if (anonKey === "your_anon_key") return null;
  if (
    !(
      (anonKey.startsWith("eyJ") && anonKey.length >= 80) ||
      (anonKey.startsWith("sb_publishable_") && anonKey.length >= 24) ||
      anonKey.length >= 80
    )
  ) {
    return null;
  }
  return { url, anonKey };
}

export function requirePublicSupabaseEnv(): PublicSupabaseConfig {
  const config = readPublicSupabaseEnv();
  if (!config) {
    throw new Error(
      "Missing or invalid Supabase public env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY. Run `npm run verify:env`.",
    );
  }
  return config;
}

/** App origin for redirects (e.g. Supabase Auth Site URL). Optional until used in server code. */
export function readPublicAppUrl(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return null;
  if (!/^https?:\/\//.test(appUrl)) return null;
  return appUrl;
}
