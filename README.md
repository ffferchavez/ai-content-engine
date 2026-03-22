# AI Content Engine

Production-lean MVP for **Helion City** under the **Helion Media** service line: organizations (workspaces), brand profiles, and structured AI-generated social content packs (ideas, hooks, captions, CTAs, hashtags, optional image prompts). Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Supabase Auth + Postgres (RLS)**, and **OpenAI** (generation API in later phases).

## Features (roadmap)

| Area | Status |
|------|--------|
| Marketing landing | Phase 1 |
| Login / signup | Phase 1 |
| Dashboard shell | Phase 1 |
| Brand CRUD | Phase 2 |
| Generation + API | Phase 4 |
| Content library | Phase 3–4 |
| Settings | Phase 5 |

See `docs/PROJECT_PLAN.md` for the full plan, folder layout, RLS summary, routes, and phased delivery.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- (Phase 4+) OpenAI API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in values from the Supabase project **Settings → API**:

```bash
cp .env.example .env.local
```

- **`NEXT_PUBLIC_SUPABASE_URL`** — Project URL  
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`** — Publishable key from the dashboard (`sb_publishable_…`), **or**  
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — legacy JWT `anon` `public` key (either works; publishable is preferred if your project shows it)  
- **`NEXT_PUBLIC_APP_URL`** — e.g. `http://localhost:3000` (used for redirects; align with Supabase Auth URL config)

Optional for server-only tasks:

- **`DATABASE_URL`** — Postgres connection URI (see below) for `npm run db:migrate`  
- **`SUPABASE_SERVICE_ROLE_KEY`** — do not expose to the browser  
- **`OPENAI_API_KEY`** — required when you implement `POST /api/generate` (Phase 4)

Validate public env vars after editing `.env.local`:

```bash
npm run verify:env
```

### 3. Database migration

Apply the SQL in `supabase/migrations/20250322000000_initial_schema.sql` using **one** of:

**A. SQL Editor (dashboard)** — paste the full file and run.

**B. CLI from this repo** — add **`DATABASE_URL`** to `.env.local` (Supabase **Settings → Database → Connection string → URI**, include the password), then:

```bash
npm run db:migrate
```

This creates tables, RLS policies, the `auth.users` → profile + default org bootstrap trigger, and the `create_organization_with_owner` RPC.

### 4. Supabase Auth URLs

In **Authentication → URL Configuration** (must match your local origin):

- **Site URL:** `http://localhost:3000` (and production URL when deployed)  
- **Redirect URLs:** include `http://localhost:3000/auth/callback` (and production equivalent)

Without these, email confirmation and OAuth redirects may fail.

Print the exact values from your `.env.local` `NEXT_PUBLIC_APP_URL`:

```bash
npm run auth:urls
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Manual steps in the Supabase Dashboard (you)

These cannot be automated from this repo without your database password or a Supabase access token:

1. **Apply the schema** if you have not already: **SQL Editor** → paste all of [`supabase/migrations/20250322000000_initial_schema.sql`](supabase/migrations/20250322000000_initial_schema.sql) → Run.  
   Or add **`DATABASE_URL`** to `.env.local` and run `npm run db:migrate`.
2. **Auth URLs:** **Authentication → URL Configuration** — use `npm run auth:urls` and copy Site URL + redirect into the dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run verify:env` | Check `NEXT_PUBLIC_*` Supabase vars in `.env.local` |
| `npm run db:migrate` | Apply `supabase/migrations/*.sql` via `DATABASE_URL` |
| `npm run auth:urls` | Print Site URL and `/auth/callback` for Supabase Auth settings |

## Project structure

- `src/app/` — App Router routes (marketing, auth, dashboard)  
- `src/lib/supabase/` — Browser and server Supabase clients  
- `src/proxy.ts` — Session refresh + protected route redirects (Next.js 16 “Proxy” convention; replaces `middleware.ts`)  
- `supabase/migrations/` — Postgres schema and RLS  

## License

Private / unpublished — All rights reserved unless otherwise specified.
