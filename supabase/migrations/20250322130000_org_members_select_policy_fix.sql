-- PostgreSQL applies RLS with the invoker's identity even inside SECURITY DEFINER
-- functions, so is_org_member() still re-entered RLS on organization_members and
-- caused "stack depth limit exceeded".
--
-- Fix: SELECT on organization_members must not call is_org_member(). Users may read
-- only their own membership rows (sufficient for org resolution and is_org_member()).

DROP POLICY IF EXISTS "Members can view org members" ON public.organization_members;

CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());
