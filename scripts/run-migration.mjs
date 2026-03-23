/**
 * Applies a SQL migration file using DATABASE_URL.
 *
 * Usage:
 *   node scripts/run-migration.mjs [path/to/migration.sql]
 *
 * Default (no args): supabase/migrations/20250322000000_initial_schema.sql
 *
 * Examples:
 *   npm run db:migrate
 *   npm run db:migrate:brand-urls
 *   node scripts/run-migration.mjs supabase/migrations/20250325000000_brand_urls.sql
 *
 * Get the connection string from Supabase Dashboard → Settings → Database → Connection string (URI).
 */
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const envLocal = resolve(root, ".env.local");
if (existsSync(envLocal)) {
  dotenv.config({ path: envLocal, quiet: true });
}
dotenv.config({ path: resolve(root, ".env"), quiet: true });

const rawUrl = process.env.DATABASE_URL?.trim();

if (!rawUrl) {
  console.error(
    "Missing DATABASE_URL.\n\n" +
      "Add it to .env.local (or pass DATABASE_URL=...).\n" +
      "Supabase Dashboard → Settings → Database → Connection string → URI (include password).\n\n" +
      "Alternatively, paste the migration SQL into the Supabase SQL Editor and run it there.",
  );
  process.exit(1);
}

const defaultMigration = join(root, "supabase", "migrations", "20250322000000_initial_schema.sql");
const argPath = process.argv[2]?.trim();
const migrationPath = argPath
  ? isAbsolute(argPath)
    ? argPath
    : resolve(root, argPath)
  : defaultMigration;

if (!existsSync(migrationPath)) {
  console.error("Migration file not found:", migrationPath);
  process.exit(1);
}

const sql = readFileSync(migrationPath, "utf8");

// Strip sslmode from the URI so Node's `ssl` option controls TLS (avoids verify-full / chain errors with Supabase pooler).
function stripSslModeFromConnectionString(url) {
  let out = url.replace(/([?&])sslmode=[^&]*/gi, "$1");
  out = out.replace(/[?&]$/, "");
  out = out.replace(/\?&/, "?");
  return out;
}

const connectionString = stripSslModeFromConnectionString(rawUrl);

const useSsl =
  /supabase\.co/i.test(rawUrl) ||
  (!rawUrl.includes("localhost") &&
    !rawUrl.includes("127.0.0.1") &&
    !rawUrl.includes("::1"));

const client = new pg.Client({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Migration applied successfully:", migrationPath);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("Migration failed:", msg);
  if (msg.includes("already exists")) {
    console.error(
      "\nHint: Objects may already exist. Use SQL Editor to drop conflicting objects or fix the error above.",
    );
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
