import Link from "next/link";
import { getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Saved",
};

export default async function LibraryPage() {
  const orgId = await getCurrentOrganizationId();

  if (!orgId) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Saved</h1>
        <p className="text-sm text-helion-warning/90" role="status">
          We couldn&apos;t load your workspace. Try signing out and back in.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: gens, error } = await supabase
    .from("content_generations")
    .select("id, brand_id, created_at, status, input_payload, output_summary, error_message")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[library] list:", error.message);
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Saved</h1>
        <p className="text-sm text-red-400" role="alert">
          Could not load saved posts. Refresh and try again.
        </p>
      </div>
    );
  }

  const rows = gens ?? [];

  const brandIds = [...new Set(rows.map((r) => r.brand_id).filter((id): id is string => Boolean(id)))];
  const brandNames: Record<string, string> = {};
  if (brandIds.length > 0) {
    const { data: brandRows } = await supabase.from("brands").select("id, name").in("id", brandIds);
    for (const b of brandRows ?? []) {
      brandNames[b.id] = b.name;
    }
  }

  const ids = rows.map((r) => r.id);
  const assetCounts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: counts } = await supabase
      .from("generated_assets")
      .select("content_generation_id")
      .in("content_generation_id", ids);

    for (const row of counts ?? []) {
      const id = row.content_generation_id as string;
      assetCounts[id] = (assetCounts[id] ?? 0) + 1;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Saved</h1>
        <p className="mt-3 text-base leading-relaxed text-helion-muted">
          Past generations for your workspace. Copy anything you still want to use.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-helion-surface/70 px-6 py-10 text-center">
          <p className="text-sm text-helion-muted-dim">
            Nothing saved yet.{" "}
            <Link href="/generate" className="font-medium text-helion-accent hover:text-helion-accent-hover">
              Create a post
            </Link>{" "}
            to see it here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((g) => {
            const payload = g.input_payload as { topic?: string } | null;
            const topic = typeof payload?.topic === "string" ? payload.topic : "Generation";
            const brandName =
              g.brand_id && brandNames[g.brand_id] ? brandNames[g.brand_id] : "Brand";
            const summary =
              g.output_summary &&
              typeof g.output_summary === "object" &&
              g.output_summary !== null &&
              "summary" in g.output_summary
                ? String((g.output_summary as { summary?: string }).summary ?? "")
              : "";
            const when = new Date(g.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            });
            const n = assetCounts[g.id] ?? 0;

            return (
              <li key={g.id}>
                <Link
                  href={`/library/${g.id}`}
                  className="block rounded-2xl border border-white/10 bg-helion-surface/70 px-5 py-5 transition hover:border-helion-accent/25 hover:bg-helion-surface/85 sm:px-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-helion-muted-dim">{when}</p>
                      <p className="mt-1 text-sm font-medium text-helion-muted">{brandName}</p>
                      <p className="mt-2 text-base font-semibold leading-snug text-helion-text">{topic}</p>
                      {summary ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-helion-muted">{summary}</p>
                      ) : null}
                      {g.status === "failed" && g.error_message ? (
                        <p className="mt-2 text-sm text-red-400/90">{g.error_message}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right text-sm text-helion-muted-dim">
                      {g.status === "completed" ? (
                        <span className="text-emerald-400/90">{n} pieces</span>
                      ) : g.status === "failed" ? (
                        <span className="text-red-400/90">Failed</span>
                      ) : (
                        <span>{g.status}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
