"use client";

import { useRef, useState } from "react";
import { AssetBlock } from "@/components/library/asset-block";
import { PostPackBlock } from "@/components/library/post-pack-block";
import { CopyButton } from "@/components/ui/copy-button";

type BrandOption = { id: string; name: string };

type AssetRow = {
  id: string;
  asset_type: string;
  platform: string | null;
  title: string | null;
  body: string | null;
  sort_order: number;
  metadata?: unknown;
};

const TONES = [
  { value: "", label: "Match my brand (default)" },
  { value: "friendly", label: "Friendly & warm" },
  { value: "professional", label: "Professional" },
  { value: "bold", label: "Bold & direct" },
  { value: "calm", label: "Calm & minimal" },
  { value: "playful", label: "Playful" },
] as const;

export function GeneratePanel({ brands }: { brands: BrandOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetRow[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setAssets([]);
    setPending(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          topic,
          platform: platform.trim() || undefined,
          tone: tone || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        summary?: string;
        assets?: AssetRow[];
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSummary(data.summary ?? null);
      setAssets(data.assets ?? []);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  function regenerateAnother() {
    setSummary(null);
    setAssets([]);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-none border border-black bg-ui-surface p-6">
        <p className="text-sm leading-relaxed text-ui-warning/90">
          Add a brand first under <span className="text-ui-text">Brands</span>, then come back here to
          create posts.
        </p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none focus:border-black focus:ring-1 focus:ring-black/10";

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 sm:gap-10">
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">1. Brand</h2>
          <p className="mt-1 text-sm text-ui-muted-dim">Who is this post for?</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-brand" className="text-[15px] font-medium text-ui-text">
              Brand
            </label>
            <select
              id="gen-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
              required
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">2. Topic</h2>
          <p className="mt-1 text-sm text-ui-muted-dim">
            You&apos;ll get several complete post packs (hook through visual direction) from this brief.
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-topic" className="text-[15px] font-medium text-ui-text">
              What do you want to post about?
            </label>
            <textarea
              id="gen-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`${fieldClass} min-h-[120px] resize-y leading-relaxed`}
              placeholder="e.g. Announce our spring menu, highlight our team, promote a weekend sale…"
              required
              maxLength={8000}
            />
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">3. Style (optional)</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-tone" className="text-[15px] font-medium text-ui-text">
                Tone
              </label>
              <select
                id="gen-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                }}
              >
                {TONES.map((t) => (
                  <option key={t.value || "default"} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-platform" className="text-[15px] font-medium text-ui-text">
                Platform (optional)
              </label>
              <input
                id="gen-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={fieldClass}
                placeholder="Instagram, LinkedIn…"
                maxLength={120}
              />
            </div>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-none bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px] sm:px-10"
        >
          {pending ? "Creating…" : "Generate pack"}
        </button>
      </form>

      {summary ? (
        <section className="rounded-none border border-black bg-ui-bg p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">Overview</h2>
              <p className="mt-2 text-base leading-relaxed text-ui-text">{summary}</p>
            </div>
            <CopyButton text={summary} label="Copy overview" />
          </div>
        </section>
      ) : null}

      {assets.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium tracking-[-0.02em] text-ui-text">Post packs</h2>
              <p className="mt-1 text-sm text-ui-muted-dim">
                Each card is a full post: angle, format, hook, caption, CTA, hashtags, and visual direction.
              </p>
            </div>
            <button
              type="button"
              onClick={regenerateAnother}
              className="rounded-none border border-black px-4 py-2 text-sm font-medium text-ui-text transition hover:bg-neutral-50"
            >
              New pack (same form)
            </button>
          </div>
          <ul className="mt-6 border-t border-black">
            {assets.map((a, i) =>
              a.asset_type === "post_pack" ? (
                <PostPackBlock key={a.id} asset={a} index={i} />
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
          <p className="text-sm text-ui-muted-dim">
            Saved automatically — view anytime under <span className="text-ui-muted">Saved</span>.
          </p>
        </section>
      ) : null}
    </div>
  );
}
