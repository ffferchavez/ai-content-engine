# AI Content Engine — Project Plan (Helion City / Helion Media)

Production-lean MVP: SaaS-style AI content packs with brand profiles, structured outputs, org-scoped data, and Supabase RLS. No separate API server; Next.js route handlers + server modules only.

---

## 1. Full project plan

### Product scope (v1)

- **In scope:** Marketing site, auth, dashboard, brand CRUD, generation form, OpenAI-backed structured generation API, persist inputs/outputs in normalized tables, content library/history, settings shell, multi-language/platform/tone inputs, optional image prompts.
- **Out of scope:** Social posting, calendar/scheduling, billing, approvals workflow, email marketing beyond Supabase Auth.

### Extension points (non-blocking)

- **`organizations.metadata`:** future subscription tier, billing IDs, feature flags.
- **`usage_events`:** metering → future Stripe usage or credits.
- **`content_generations.status` + timestamps:** future async jobs / scheduling hooks.
- **`organization_members.role`:** future approvals (e.g. `editor` vs `approver`) and admin UX.
- **Route handlers:** keep generation behind `/api/...` so a worker or queue can call the same module later.

### Architecture principles

- **Tenant boundary:** `organization_id` on all tenant-owned rows; resolve current org in server code (Phase 2+ can add org switcher and `current_organization_id` in cookie/session).
- **Auth:** Supabase Auth (email/password for MVP); session via `@supabase/ssr` middleware + server clients.
- **AI:** Server-only OpenAI calls; no keys in the browser.
- **Data:** Prompt inputs in `content_generations.input_payload`; normalized rows in `generated_assets`; optional `output_summary` JSON for list views.

---

## 2. Folder structure (target)

```text
src/
  app/
    (public)/                 # Marketing (route group, no URL prefix)
      layout.tsx
      page.tsx
    (auth)/
      login/page.tsx
      signup/page.tsx
    (app)/                    # Authenticated product shell
      layout.tsx
      dashboard/page.tsx
      brands/...
      generate/...
      library/...
      settings/page.tsx
    auth/callback/route.ts    # OAuth / magic link code exchange
    api/
      generate/route.ts       # POST structured generation (Phase 4+)
      ...
    layout.tsx
    globals.css
  components/
    marketing/
    app/
    auth/
    forms/
  lib/
    supabase/
      client.ts               # Browser client
      server.ts               # Server client (RSC, actions, route handlers)
    openai/                   # Phase 4+: server-only client wrapper
    org/                      # Phase 2+: getCurrentOrganizationId helpers
    env.ts
  types/
    database.ts               # Optional: generated Supabase types
  middleware.ts
supabase/
  migrations/
    *.sql
docs/
  PROJECT_PLAN.md
```

---

## 3. Supabase schema (summary)

| Table | Purpose |
|--------|---------|
| `profiles` | App profile keyed by `auth.users.id`. |
| `organizations` | Workspace / future SaaS tenant. |
| `organization_members` | User ↔ org with `owner` / `admin` / `member`. |
| `brands` | Brand voice, audience, guidelines; scoped by org. |
| `content_generations` | One run: `input_payload`, model, status, `output_summary`. |
| `generated_assets` | Rows per idea, hook, caption, CTA, hashtags, image prompt, etc. |
| `usage_events` | Metering (`event_type`, `quantity`, `metadata`). |

**Files:** `supabase/migrations/20250322000000_initial_schema.sql`

---

## 4. RLS policies (summary)

- **`profiles`:** Users `SELECT`/`UPDATE` own row (`id = auth.uid()`).
- **`organizations`:** `SELECT` if member; `UPDATE` if `owner` or `admin`.
- **`organization_members`:** `SELECT` if member of that org. **No** direct client `INSERT` for bootstrap — handled by `SECURITY DEFINER` trigger on signup and `create_organization_with_owner` RPC.
- **`brands`, `content_generations`, `usage_events`:** Member of `organization_id` may CRUD where applicable; generations require `created_by = auth.uid()` on insert.
- **`generated_assets`:** Access allowed if parent `content_generations` row is in an org the user belongs to.

Helper functions: `public.is_org_member(uuid)`, `public.org_role(uuid)`.

---

## 5. Route-by-route implementation plan

| Route | Purpose | Auth |
|--------|---------|------|
| `/` | Marketing landing | Public |
| `/login`, `/signup` | Email/password | Public (redirect if session) |
| `/auth/callback` | Session exchange | Public |
| `/dashboard` | Overview, quick links | Required |
| `/brands`, `/brands/new`, `/brands/[id]` | Brand CRUD | Required |
| `/generate` | Generation form | Required |
| `/library` | Past generations list + detail | Required |
| `/settings` | Profile + org placeholder | Required |
| `POST /api/generate` | Structured OpenAI generation + DB persist | Required (server) |

---

## 6. UI page breakdown

- **Landing:** Hero, value props (structured packs, brand-safe, multi-language), CTA to signup, Helion City / Helion Media attribution.
- **Login / Signup:** Minimal forms, error states, link between pages.
- **App shell:** Top or side nav: Dashboard, Brands, Generate, Library, Settings; user menu (sign out).
- **Dashboard:** Welcome + next steps (add brand, generate); usage summary placeholder.
- **Brands:** List, empty state, create/edit form (name, voice, audience, guidelines JSON optional later).
- **Generate:** Form: brand, platforms, tones, languages, options (image prompts on/off), submit → results view.
- **Library:** Table/cards of past runs; detail page with normalized assets.
- **Settings:** Display name, email (read-only from auth), future org name.

---

## 7. Step-by-step development phases

| Phase | Deliverable |
|--------|-------------|
| **1** | Next.js + Tailwind + Supabase clients + middleware + marketing + auth pages + dashboard shell + migrations documented |
| **2** | Org context helper + brand list/create/edit + RLS-verified queries |
| **3** | Library list + generation detail |
| **4** | `POST /api/generate` (OpenAI structured output), save to `content_generations` + `generated_assets`, `usage_events` |
| **5** | Settings + polish, empty states, errors |
| **6** | Hardening: rate limits (optional), validation, types generation from Supabase |

---

## 8. Suggested environment variables

See `.env.example` in the repo root.

---

## 9. README setup

See `README.md`.

---

## 10. Phase 1 implementation status

- [x] Next.js App Router + TypeScript + Tailwind
- [x] Supabase browser/server helpers and middleware session refresh
- [x] Marketing landing, login/signup, auth callback route
- [x] Protected dashboard shell
- [x] SQL migration + RLS in `supabase/migrations/`
- [ ] Brands / generate / library / settings feature pages (Phases 2–5)
