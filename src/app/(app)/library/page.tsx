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
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Saved</h1>
        <p className="text-sm text-ui-warning/90" role="status">
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
      <div className="flex w-full min-w-0 flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text sm:text-3xl">Saved</h1>
        <p className="text-sm text-red-700" role="alert">
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
    <div className="flex w-full min-w-0 flex-col">
      <header className="w-full border-b border-black pb-8 sm:pb-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Library</p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
          Saved
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-6 sm:text-base">
          Past generations for your workspace. Copy anything you still want to use.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="w-full border-b border-dashed border-black/40 py-12 text-center sm:py-16">
          <p className="text-sm text-ui-muted-dim">
            Nothing saved yet.{" "}
            <Link
              href="/generate"
              className="font-medium text-ui-text underline decoration-black/25 underline-offset-4 transition hover:decoration-black"
            >
              Create a post
            </Link>{" "}
            to see it here.
          </p>
        </div>
      ) : (
        <ul className="w-full border-t border-black">
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
              <li key={g.id} className="w-full border-b border-black">
                <Link
                  href={`/library/${g.id}`}
                  className="group flex w-full min-w-0 flex-col gap-4 py-8 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">
                      {when}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-ui-muted">{brandName}</p>
                    <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-ui-text sm:mt-3 sm:text-xl">
                      {topic}
                    </p>
                    {summary ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ui-muted sm:mt-3 sm:line-clamp-2">
                        {summary}
                      </p>
                    ) : null}
                    {g.status === "failed" && g.error_message ? (
                      <p className="mt-3 text-sm text-red-700">{g.error_message}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-black/10 pt-4 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <div className="text-left text-sm tabular-nums sm:text-right">
                      {g.status === "completed" ? (
                        <span className="text-emerald-800">{n} pieces</span>
                      ) : g.status === "failed" ? (
                        <span className="text-red-700">Failed</span>
                      ) : (
                        <span className="text-ui-muted-dim">{g.status}</span>
                      )}
                    </div>
                    <span
                      className="text-2xl font-extralight leading-none text-ui-muted transition-colors group-hover:text-ui-text sm:text-3xl"
                      aria-hidden
                    >
                      ›
                    </span>
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
