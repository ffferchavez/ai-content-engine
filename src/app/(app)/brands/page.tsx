import { BrandsPanel } from "@/components/brands/brands-panel";
import type { BrandRow } from "@/lib/brands/types";
import { getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Your brands",
};

export default async function BrandsPage() {
  const orgId = await getCurrentOrganizationId();

  if (!orgId) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Brands</h1>
        <p className="text-sm leading-relaxed text-ui-warning/90" role="status">
          We couldn&apos;t finish setting up your account. Try signing out and signing in again. If the
          problem continues, contact support.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("brands")
    .select(
      "id, organization_id, name, description, voice_notes, target_audience, industry, brand_guidelines, default_language, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[brands] list:", error.message);
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Brands</h1>
        <p className="text-sm text-red-700" role="alert">
          We couldn&apos;t load your brands. Please refresh the page and try again.
        </p>
      </div>
    );
  }

  const brands: BrandRow[] = (rows ?? []).map((row) => ({
    ...row,
    brand_guidelines:
      row.brand_guidelines !== null && typeof row.brand_guidelines === "object"
        ? (row.brand_guidelines as Record<string, unknown>)
        : null,
  }));

  return (
    <div className="flex w-full min-w-0 flex-col gap-10 sm:gap-12">
      <header className="w-full border-b border-black pb-8 sm:pb-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Brands</p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
          Your profiles
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-6 sm:text-base">
          Add one entry for each business or project. When you create posts, you&apos;ll pick which brand
          to use.
        </p>
      </header>
      <BrandsPanel brands={brands} />
    </div>
  );
}
