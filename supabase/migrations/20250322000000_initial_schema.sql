-- AI Content Engine — initial schema (Helion City / Helion Media)
-- Run with Supabase CLI or SQL editor. Requires pgcrypto for gen_random_uuid().

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_created_at_idx ON public.profiles (created_at DESC);

-- ---------------------------------------------------------------------------
-- organizations (workspaces / future multi-tenant boundary)
-- ---------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX organizations_created_by_idx ON public.organizations (created_by);

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX organization_members_org_id_idx ON public.organization_members (organization_id);

-- ---------------------------------------------------------------------------
-- Helper functions (RLS) — after organization_members exists
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.org_role(org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT m.role
  FROM public.organization_members m
  WHERE m.organization_id = org_id
    AND m.user_id = auth.uid()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  voice_notes text,
  target_audience text,
  industry text,
  brand_guidelines jsonb,
  default_language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX brands_organization_id_idx ON public.brands (organization_id);

-- ---------------------------------------------------------------------------
-- content_generations
-- ---------------------------------------------------------------------------
CREATE TABLE public.content_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands (id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'failed')),
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_summary jsonb,
  model text,
  provider text NOT NULL DEFAULT 'openai',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX content_generations_org_created_idx
  ON public.content_generations (organization_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- generated_assets (normalized outputs: hooks, captions, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE public.generated_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_generation_id uuid NOT NULL REFERENCES public.content_generations (id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  platform text,
  language text NOT NULL DEFAULT 'en',
  sort_order integer NOT NULL DEFAULT 0,
  title text,
  body text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX generated_assets_generation_idx ON public.generated_assets (content_generation_id);

COMMENT ON COLUMN public.generated_assets.asset_type IS
  'e.g. post_idea, hook, caption, cta, hashtags, image_prompt';

-- ---------------------------------------------------------------------------
-- usage_events (metering / future billing)
-- ---------------------------------------------------------------------------
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX usage_events_org_created_idx ON public.usage_events (organization_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Triggers: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER brands_set_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER content_generations_set_updated_at
  BEFORE UPDATE ON public.content_generations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: profile + default org bootstrap (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  base_slug text;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), '')
  );

  base_slug := 'org-' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.organizations (name, slug, created_by)
  VALUES ('My workspace', base_slug, NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Optional RPC: create additional organizations (future UI)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(p_name text, p_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (p_name, p_slug, auth.uid())
  RETURNING id INTO new_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_id, auth.uid(), 'owner');

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- organizations
CREATE POLICY "Members can view organization"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(id));

CREATE POLICY "Admins can update organization"
  ON public.organizations FOR UPDATE
  USING (public.org_role(id) IN ('owner', 'admin'))
  WITH CHECK (public.org_role(id) IN ('owner', 'admin'));

-- organization_members
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (public.is_org_member(organization_id));

-- brands
CREATE POLICY "Members can view brands"
  ON public.brands FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Members can insert brands"
  ON public.brands FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Members can update brands"
  ON public.brands FOR UPDATE
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Members can delete brands"
  ON public.brands FOR DELETE
  USING (public.is_org_member(organization_id));

-- content_generations
CREATE POLICY "Members can view generations"
  ON public.content_generations FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Members can insert generations"
  ON public.content_generations FOR INSERT
  WITH CHECK (
    public.is_org_member(organization_id)
    AND created_by = auth.uid()
  );

CREATE POLICY "Members can update generations"
  ON public.content_generations FOR UPDATE
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Members can delete generations"
  ON public.content_generations FOR DELETE
  USING (public.is_org_member(organization_id));

-- generated_assets (via parent generation org)
CREATE POLICY "Members can view assets"
  ON public.generated_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.content_generations g
      WHERE g.id = generated_assets.content_generation_id
        AND public.is_org_member(g.organization_id)
    )
  );

CREATE POLICY "Members can insert assets"
  ON public.generated_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.content_generations g
      WHERE g.id = generated_assets.content_generation_id
        AND public.is_org_member(g.organization_id)
    )
  );

CREATE POLICY "Members can update assets"
  ON public.generated_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.content_generations g
      WHERE g.id = generated_assets.content_generation_id
        AND public.is_org_member(g.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.content_generations g
      WHERE g.id = generated_assets.content_generation_id
        AND public.is_org_member(g.organization_id)
    )
  );

CREATE POLICY "Members can delete assets"
  ON public.generated_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.content_generations g
      WHERE g.id = generated_assets.content_generation_id
        AND public.is_org_member(g.organization_id)
    )
  );

-- usage_events
CREATE POLICY "Members can view usage"
  ON public.usage_events FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Members can insert usage"
  ON public.usage_events FOR INSERT
  WITH CHECK (
    public.is_org_member(organization_id)
    AND (user_id IS NULL OR user_id = auth.uid())
  );
