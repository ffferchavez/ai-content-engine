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
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — `anon` `public` key  
- **`NEXT_PUBLIC_APP_URL`** — e.g. `http://localhost:3000` (used for redirects; align with Supabase Auth URL config)

Optional for server-only tasks:

- **`SUPABASE_SERVICE_ROLE_KEY`** — do not expose to the browser  
- **`OPENAI_API_KEY`** — required when you implement `POST /api/generate` (Phase 4)

### 3. Database migration

Apply the SQL in `supabase/migrations/20250322000000_initial_schema.sql`

- **Supabase Dashboard → SQL Editor:** paste and run the file contents, or  
- **Supabase CLI:** `supabase db push` / `supabase migration up` (if you use the CLI locally)

This creates tables, RLS policies, the `auth.users` → profile + default org bootstrap trigger, and the `create_organization_with_owner` RPC.

### 4. Supabase Auth URLs

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (and production URL when deployed)  
- **Redirect URLs:** include `http://localhost:3000/auth/callback` (and production equivalent)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Project structure

- `src/app/` — App Router routes (marketing, auth, dashboard)  
- `src/lib/supabase/` — Browser and server Supabase clients  
- `src/middleware.ts` — Session refresh + protected route redirects  
- `supabase/migrations/` — Postgres schema and RLS  

## License

Private / unpublished — All rights reserved unless otherwise specified.
