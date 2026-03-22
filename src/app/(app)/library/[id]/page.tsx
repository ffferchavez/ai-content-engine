import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetBlock } from "@/components/library/asset-block";
import { SummaryWithCopy } from "@/components/library/summary-with-copy";
import { getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata() {
  return { title: "Saved detail" };
}

export default async function LibraryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orgId = await getCurrentOrganizationId();

  if (!orgId) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-amber-200/90">We couldn&apos;t load your workspace.</p>
        <Link href="/library" className="text-sm text-amber-400 hover:text-amber-300">
          ← Back to Saved
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: gen, error: genError } = await supabase
    .from("content_generations")
    .select(
      "id, brand_id, created_at, status, input_payload, output_summary, error_message, organization_id",
    )
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (genError || !gen) {
    notFound();
  }

  let brandName = "Brand";
  if (gen.brand_id) {
    const { data: b } = await supabase.from("brands").select("name").eq("id", gen.brand_id).maybeSingle();
    if (b?.name) brandName = b.name;
  }

  const { data: assetRows } = await supabase
    .from("generated_assets")
    .select("id, asset_type, platform, title, body, sort_order")
    .eq("content_generation_id", gen.id)
    .order("sort_order", { ascending: true });

  const assets = assetRows ?? [];
  const payload = gen.input_payload as { topic?: string; tone?: string; platform?: string } | null;
  const topic = typeof payload?.topic === "string" ? payload.topic : "Generation";
  const tone = typeof payload?.tone === "string" ? payload.tone : null;
  const platform = typeof payload?.platform === "string" ? payload.platform : null;
  const summary =
    gen.output_summary &&
    typeof gen.output_summary === "object" &&
    gen.output_summary !== null &&
    "summary" in gen.output_summary
      ? String((gen.output_summary as { summary?: string }).summary ?? "")
    : "";

  const when = new Date(gen.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/library" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← Saved
        </Link>
        <p className="mt-4 text-xs text-zinc-500">{when}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{topic}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {brandName}
          {tone ? ` · ${tone}` : ""}
          {platform ? ` · ${platform}` : ""}
        </p>
        {gen.status === "failed" && gen.error_message ? (
          <p className="mt-4 text-sm text-red-400/90">{gen.error_message}</p>
        ) : null}
      </div>

      {summary ? <SummaryWithCopy text={summary} /> : null}

      {assets.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-zinc-50">Ideas &amp; copy</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {assets.map((a) => (
              <AssetBlock
                key={a.id}
                asset={{
                  id: a.id,
                  asset_type: a.asset_type,
                  platform: a.platform,
                  title: a.title,
                  body: a.body,
                }}
              />
            ))}
          </ul>
        </section>
      ) : gen.status === "completed" ? (
        <p className="text-sm text-zinc-500">No pieces stored for this run.</p>
      ) : null}

      <Link
        href="/generate"
        className="inline-flex w-fit rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
      >
        Create another pack
      </Link>
    </div>
  );
}
