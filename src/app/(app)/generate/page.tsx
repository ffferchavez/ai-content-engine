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
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Create posts</h1>
        <p className="text-sm text-amber-200/90" role="status">
          We couldn&apos;t load your workspace. Try signing out and back in.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: brandRows, error } = await supabase
    .from("brands")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[generate] brands:", error.message);
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Create posts</h1>
        <p className="text-sm text-red-400" role="alert">
          Could not load brands. Refresh and try again.
        </p>
      </div>
    );
  }

  const brands = brandRows ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Create posts</h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Pick a brand, describe the topic, and get a structured pack you can copy — ideas, hooks,
          captions, and more. Results are saved automatically.
        </p>
      </div>
      <GeneratePanel brands={brands} />
    </div>
  );
}
