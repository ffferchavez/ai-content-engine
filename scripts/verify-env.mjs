/**
 * Validates public Supabase env vars for local dev.
 * Loads .env.local first, then .env.
 */
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const envLocal = resolve(root, ".env.local");

if (existsSync(envLocal)) {
  dotenv.config({ path: envLocal, quiet: true });
}
dotenv.config({ path: resolve(root, ".env"), quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

const errors = [];

if (!url) errors.push("Missing NEXT_PUBLIC_SUPABASE_URL");
else if (url.includes("YOUR_PROJECT"))
  errors.push(
    "NEXT_PUBLIC_SUPABASE_URL still has placeholder YOUR_PROJECT — paste Project URL from Supabase Dashboard → Settings → API",
  );
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))
  errors.push(
    "NEXT_PUBLIC_SUPABASE_URL should look like https://<project-ref>.supabase.co",
  );

if (!anon) errors.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
else if (anon === "your_anon_key")
  errors.push(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is still the placeholder — paste the anon public key from Supabase Dashboard → Settings → API",
  );
else if (
  !(
    (anon.startsWith("eyJ") && anon.length >= 80) ||
    (anon.startsWith("sb_publishable_") && anon.length >= 24) ||
    anon.length >= 80
  )
)
  errors.push(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY looks invalid — paste the anon public key from Supabase Dashboard → Settings → API",
  );

if (!appUrl) errors.push("Missing NEXT_PUBLIC_APP_URL (e.g. http://localhost:3000)");
else if (!/^https?:\/\//.test(appUrl))
  errors.push("NEXT_PUBLIC_APP_URL should start with http:// or https://");

if (errors.length) {
  console.error("Environment check failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nFix .env.local using values from your Supabase project (Settings → API).");
  process.exit(1);
}

console.log("Environment check passed (NEXT_PUBLIC_* Supabase vars look valid).");
