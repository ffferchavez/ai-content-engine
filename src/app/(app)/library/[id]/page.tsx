import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetBlock } from "@/components/library/asset-block";
import { PostPackBlock } from "@/components/library/post-pack-block";
import { SummaryWithCopy } from "@/components/library/summary-with-copy";
import { getCurrentOrganizationId } from "@/lib/org";
import { formatPlatformForDisplay } from "@/lib/platforms";
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
      <div className="flex w-full min-w-0 flex-col gap-3">
        <p className="text-sm text-ui-warning/90">We couldn&apos;t load your workspace.</p>
        <Link
          href="/library"
          className="text-sm font-medium underline decoration-black/25 underline-offset-4 transition hover:decoration-black"
        >
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
    .select("id, asset_type, platform, title, body, sort_order, metadata")
    .eq("content_generation_id", gen.id)
    .order("sort_order", { ascending: true });

  const assets = assetRows ?? [];
  const payload = gen.input_payload as {
    topic?: string;
    tone?: string;
    platform?: string;
    language?: string;
    objective?: string | null;
  } | null;
  const topic = typeof payload?.topic === "string" ? payload.topic : "Generation";
  const tone = typeof payload?.tone === "string" ? payload.tone : null;
  const platformRaw = typeof payload?.platform === "string" ? payload.platform : null;
  const platform = platformRaw ? formatPlatformForDisplay(platformRaw) : null;
  const language = typeof payload?.language === "string" ? payload.language : null;
  const objective =
    typeof payload?.objective === "string" && payload.objective.trim()
      ? payload.objective.trim()
      : null;
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
    <div className="flex w-full min-w-0 flex-col gap-10 sm:gap-12">
      <header className="w-full border-b border-black pb-8 sm:pb-10">
        <Link
          href="/library"
          className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim transition-colors hover:text-ui-text"
        >
          ← Saved
        </Link>
        <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">{when}</p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
          {topic}
        </h1>
        <p className="mt-3 text-sm text-ui-muted sm:mt-4">
          {brandName}
          {language ? ` · ${language}` : ""}
          {tone ? ` · ${tone}` : ""}
          {platform ? ` · ${platform}` : ""}
          {objective ? ` · ${objective}` : ""}
        </p>
        {gen.status === "failed" && gen.error_message ? (
          <p className="mt-6 text-sm text-red-700">{gen.error_message}</p>
        ) : null}
      </header>

      {summary ? <SummaryWithCopy text={summary} /> : null}

      {assets.length > 0 ? (
        <section>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">
            Post packs
          </h2>
          <ul className="mt-6 border-t border-black">
            {assets.map((a, i) =>
              a.asset_type === "post_pack" ? (
                <PostPackBlock
                  key={a.id}
                  brandName={brandName}
                  asset={{
                    id: a.id,
                    asset_type: a.asset_type,
                    platform: a.platform,
                    title: a.title,
                    body: a.body,
                    metadata: a.metadata,
                  }}
                  index={i}
                />
              ) : (
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
              ),
            )}
          </ul>
        </section>
      ) : gen.status === "completed" ? (
        <p className="text-sm text-ui-muted-dim">No post packs stored for this run.</p>
      ) : null}

      <Link
        href="/generate"
        className="inline-flex w-fit border border-black px-5 py-2.5 text-sm font-medium text-ui-text transition hover:bg-neutral-50"
      >
        Create another pack
      </Link>
    </div>
  );
}
