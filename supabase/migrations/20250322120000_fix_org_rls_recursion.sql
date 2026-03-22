-- Fix "stack depth limit exceeded" when querying organization_members:
-- is_org_member() queried organization_members under RLS, which called is_org_member() again.
-- SECURITY DEFINER runs the membership check with owner privileges so the inner SELECT does not
-- re-enter RLS (table owner bypasses RLS on owned tables).

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role
  FROM public.organization_members m
  WHERE m.organization_id = org_id
    AND m.user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_role(uuid) TO authenticated;
