"use client";

import { useRef, useState } from "react";
import { AssetBlock } from "@/components/library/asset-block";
import { CopyButton } from "@/components/ui/copy-button";

type BrandOption = { id: string; name: string };

type AssetRow = {
  id: string;
  asset_type: string;
  platform: string | null;
  title: string | null;
  body: string | null;
  sort_order: number;
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
      <div className="rounded-2xl border border-amber-500/25 bg-zinc-900/50 p-6">
        <p className="text-sm leading-relaxed text-amber-200/90">
          Add a brand first under <span className="text-zinc-200">Brands</span>, then come back here to
          create posts.
        </p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-[15px] text-zinc-100 outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="flex flex-col gap-10">
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">1. Brand</h2>
          <p className="mt-1 text-sm text-zinc-500">Who is this post for?</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-brand" className="text-[15px] font-medium text-zinc-200">
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">2. Topic</h2>
          <p className="mt-1 text-sm text-zinc-500">Ideas, hooks, and captions will follow this brief.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-topic" className="text-[15px] font-medium text-zinc-200">
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">3. Style (optional)</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-tone" className="text-[15px] font-medium text-zinc-200">
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
              <label htmlFor="gen-platform" className="text-[15px] font-medium text-zinc-200">
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
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px] sm:px-10"
        >
          {pending ? "Creating…" : "Generate pack"}
        </button>
      </form>

      {summary ? (
        <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-zinc-500">Overview</h2>
              <p className="mt-2 text-base leading-relaxed text-zinc-200">{summary}</p>
            </div>
            <CopyButton text={summary} label="Copy overview" />
          </div>
        </section>
      ) : null}

      {assets.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Ideas &amp; copy</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Post ideas, hooks, captions, CTAs, hashtags, and a prompt — copy any block.
              </p>
            </div>
            <button
              type="button"
              onClick={regenerateAnother}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              New pack (same form)
            </button>
          </div>
          <ul className="flex flex-col gap-3">
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
          <p className="text-sm text-zinc-500">
            Saved automatically — view anytime under <span className="text-zinc-400">Saved</span>.
          </p>
        </section>
      ) : null}
    </div>
  );
}
