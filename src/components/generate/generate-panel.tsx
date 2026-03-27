"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GENERATION_PLATFORMS,
  type GenerationPlatformId,
} from "@/lib/platforms";

type BrandOption = { id: string; name: string; default_language: string };

const TONES = [
  { value: "", label: "Match my brand (default)" },
  { value: "friendly", label: "Friendly & warm" },
  { value: "professional", label: "Professional" },
  { value: "bold", label: "Bold & direct" },
  { value: "calm", label: "Calm & minimal" },
  { value: "playful", label: "Playful" },
] as const;

const LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
];

const OBJECTIVES = [
  { value: "", label: "Let Helion infer (default)" },
  { value: "awareness", label: "Awareness & reach" },
  { value: "engagement", label: "Engagement (comments, saves)" },
  { value: "traffic", label: "Traffic to site / link" },
  { value: "leads", label: "Leads & bookings" },
  { value: "community", label: "Community & conversation" },
  { value: "launch", label: "Launch or announcement" },
] as const;

export function GeneratePanel({ brands }: { brands: BrandOption[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [platformId, setPlatformId] = useState<GenerationPlatformId>("instagram");
  const [language, setLanguage] = useState(brands[0]?.default_language ?? "en");
  const [tone, setTone] = useState("");
  const [objective, setObjective] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const b = brands.find((x) => x.id === brandId);
    if (b?.default_language) {
      setLanguage(b.default_language);
    }
  }, [brandId, brands]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          topic,
          platform: platformId,
          tone: tone || undefined,
          language,
          objective: objective || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        generationId?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (!data.generationId) {
        setError("Generation completed, but we could not open the saved result.");
        return;
      }
      router.push(`/library/${data.generationId}`);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
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

  const selectChevron = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 sm:gap-10">
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">1. Brand</h2>
          <p className="mt-1 text-sm text-ui-muted-dim">Which profile is this for?</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-brand" className="text-[15px] font-medium text-ui-text">
              Brand
            </label>
            <select
              id="gen-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
              style={selectChevron}
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
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">2. Platform</h2>
          <p className="mt-1 text-sm text-ui-muted-dim">
            We tailor hooks, length, and hashtag style to how people use each network. Pick one main platform for
            this generation.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <p id="gen-platform-label" className="text-[15px] font-medium text-ui-text">
              Primary platform
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-labelledby="gen-platform-label"
            >
              {GENERATION_PLATFORMS.map(({ id, label }) => {
                const selected = platformId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPlatformId(id)}
                    className={[
                      "rounded-none border px-4 py-2.5 text-sm font-medium transition",
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/25 bg-ui-bg text-ui-text hover:border-black hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">
            3. Language, tone & goal
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-language" className="text-[15px] font-medium text-ui-text">
                Language
              </label>
              <select
                id="gen-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                style={selectChevron}
              >
                {!LANG_OPTIONS.some((o) => o.value === language) ? (
                  <option value={language}>{language} (brand default)</option>
                ) : null}
                {LANG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-ui-muted-dim">Defaults from the brand; you can override here.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-tone" className="text-[15px] font-medium text-ui-text">
                Tone
              </label>
              <select
                id="gen-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                style={selectChevron}
              >
                {TONES.map((t) => (
                  <option key={t.value || "default"} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-objective" className="text-[15px] font-medium text-ui-text">
                Objective
              </label>
              <select
                id="gen-objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                style={selectChevron}
              >
                {OBJECTIVES.map((o) => (
                  <option key={o.value || "default"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">
            4. Brief & context
          </h2>
          <p className="mt-1 text-sm text-ui-muted-dim">
            What to post about, plus any campaign notes, offers, or constraints. You’ll get 3 complete
            post packs from this brief.
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="gen-topic" className="text-[15px] font-medium text-ui-text">
              Topic & optional context
            </label>
            <textarea
              id="gen-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`${fieldClass} min-h-[120px] resize-y leading-relaxed`}
              placeholder="e.g. Spring menu launch — highlight two new dishes, mention weekend hours, keep it welcoming…"
              required
              maxLength={8000}
            />
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
          {pending ? "Generating…" : "Generate posts"}
        </button>
      </form>
    </div>
  );
}
