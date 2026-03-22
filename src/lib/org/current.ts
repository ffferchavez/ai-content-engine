import { createClient } from "@/lib/supabase/server";

/**
 * Resolved workspace for the signed-in user.
 *
 * v1: picks the **oldest** `organization_members` row (`created_at` ASC) so behavior is
 * deterministic if multiple orgs exist (e.g. after `create_organization_with_owner`).
 *
 * Uses RPC `get_my_primary_organization()` to avoid RLS recursion ("stack depth limit exceeded")
 * when policies on `organization_members` / `is_org_member` interact badly.
 */
export type CurrentOrganizationContext = {
  userId: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function getCurrentOrganizationContext(): Promise<CurrentOrganizationContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: rows, error } = await supabase.rpc("get_my_primary_organization");

  if (error) {
    console.error("[org] get_my_primary_organization:", error.message);
    return null;
  }

  const row = Array.isArray(rows) ? rows[0] : rows;
  if (
    !row ||
    typeof row !== "object" ||
    !("organization_id" in row) ||
    !("name" in row) ||
    !("slug" in row)
  ) {
    return null;
  }

  const organizationId = row.organization_id as string;
  const name = row.name as string;
  const slug = row.slug as string;

  if (!organizationId || !name || !slug) {
    return null;
  }

  return {
    userId: user.id,
    organizationId,
    organization: {
      id: organizationId,
      name,
      slug,
    },
  };
}

/** Convenience: workspace UUID for RLS-scoped inserts/selects. */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const ctx = await getCurrentOrganizationContext();
  return ctx?.organizationId ?? null;
}
