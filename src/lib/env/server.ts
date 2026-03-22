import "server-only";

/**
 * Optional Postgres URI for scripts (`npm run db:migrate`). Never expose to the client.
 */
export function getOptionalDatabaseUrl(): string | undefined {
  const v = process.env.DATABASE_URL?.trim();
  return v || undefined;
}

/**
 * Service role bypasses RLS — use only in trusted server contexts (future admin jobs).
 */
export function getOptionalServiceRoleKey(): string | undefined {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return v || undefined;
}

/**
 * OpenAI API key for `POST /api/generate` and server-only modules.
 */
export function getOptionalOpenAIApiKey(): string | undefined {
  const v = process.env.OPENAI_API_KEY?.trim();
  return v || undefined;
}
