-- PostgreSQL rejects SET LOCAL inside STABLE/IMMUTABLE functions ("SET is not allowed in a
-- non-volatile function"). These helpers use SET LOCAL row_security = off, so they must be VOLATILE.

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = off;
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.org_role(org_id uuid)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r text;
BEGIN
  SET LOCAL row_security = off;
  SELECT m.role INTO r
  FROM public.organization_members m
  WHERE m.organization_id = org_id
    AND m.user_id = auth.uid()
  LIMIT 1;
  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_primary_organization()
RETURNS TABLE (
  organization_id uuid,
  name text,
  slug text
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = off;
  RETURN QUERY
  SELECT o.id, o.name, o.slug
  FROM public.organization_members m
  INNER JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
  ORDER BY m.created_at ASC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_primary_organization() TO authenticated;
