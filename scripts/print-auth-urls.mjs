/**
 * Prints the Auth URL values to configure in Supabase Dashboard.
 * Loads NEXT_PUBLIC_APP_URL from .env.local when present.
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

const app = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
const base = app.endsWith("/") ? app.slice(0, -1) : app;
const callback = `${base}/auth/callback`;

console.log(`
Supabase Dashboard → Authentication → URL Configuration

  Site URL:
    ${base}

  Redirect URLs (add one line):
    ${callback}
`);
