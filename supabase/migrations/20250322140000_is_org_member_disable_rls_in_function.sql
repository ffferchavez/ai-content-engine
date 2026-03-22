-- RLS is still evaluated as the session user inside plain SQL SECURITY DEFINER
-- functions, so is_org_member() kept re-entering policies → stack depth exceeded.
-- SET LOCAL row_security = off for the inner scan only (reverts when the function returns).

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
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
STABLE
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

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_role(uuid) TO authenticated;
