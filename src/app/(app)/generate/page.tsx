import { GeneratePanel } from "@/components/generate/generate-panel";
import { getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Create",
};

export default async function GeneratePage() {
  const orgId = await getCurrentOrganizationId();

  if (!orgId) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Create posts</h1>
        <p className="text-sm text-ui-warning/90" role="status">
          We couldn&apos;t load your workspace. Try signing out and back in.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: brandRows, error } = await supabase
    .from("brands")
    .select("id, name, default_language")
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[generate] brands:", error.message);
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Create posts</h1>
        <p className="text-sm text-red-700" role="alert">
          Could not load brands. Refresh and try again.
        </p>
      </div>
    );
  }

  const brands = brandRows ?? [];

  return (
    <div className="flex w-full min-w-0 flex-col gap-10 sm:gap-12">
      <header className="w-full border-b border-black pb-8 sm:pb-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Create</p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
          New content pack
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-6 sm:text-base">
          Choose a brand, platform, language, tone, and goal — then get 3 complete post packs (angle,
          format, hook, caption, CTA, hashtags, visual direction). Saved automatically to your library.
        </p>
      </header>
      <GeneratePanel brands={brands} />
    </div>
  );
}
