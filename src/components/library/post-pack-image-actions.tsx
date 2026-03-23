"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parsePostPackFields, type PostPackFields } from "@/lib/generate/post-pack";
import { supportsPostPackImageGeneration } from "@/lib/generate/post-pack-image";

type PostPackImageActionsProps = {
  assetId: string;
  metadata: unknown;
  packTitle: string | null;
  /** Client-only list updates (e.g. Create page). If omitted, uses router.refresh(). */
  onMetadataUpdated?: (metadata: unknown) => void;
};

export function PostPackImageActions({
  assetId,
  metadata: initialMetadata,
  packTitle,
  onMetadataUpdated,
}: PostPackImageActionsProps) {
  const router = useRouter();
  const [metadata, setMetadata] = useState(initialMetadata);
  const [parsed, setParsed] = useState<PostPackFields | null>(() => parsePostPackFields(initialMetadata));
  const [loading, setLoading] = useState(false);
  const [loadingSlide, setLoadingSlide] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMetadata(initialMetadata);
    setParsed(parsePostPackFields(initialMetadata));
  }, [initialMetadata]);

  const canGenerate = parsed ? supportsPostPackImageGeneration(parsed.suggested_format) : false;
  const isCarousel =
    Boolean(parsed?.suggested_format === "carousel" && parsed.slides.length > 0);
  const hasStaticImage = Boolean(
    parsed?.suggested_format === "static post" && parsed.image_url && parsed.media_status === "ready",
  );

  async function runGenerate(slideIdx?: number) {
    setLoading(true);
    setLoadingSlide(slideIdx ?? null);
    setError(null);
    try {
      const body =
        isCarousel && typeof slideIdx === "number"
          ? JSON.stringify({ slideIndex: slideIdx })
          : JSON.stringify({});
      const res = await fetch(`/api/generated-assets/${assetId}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = (await res.json()) as { error?: string; metadata?: unknown };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (data.metadata) {
        setMetadata(data.metadata);
        setParsed(parsePostPackFields(data.metadata));
        onMetadataUpdated?.(data.metadata);
        if (!onMetadataUpdated) {
          router.refresh();
        }
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
      setLoadingSlide(null);
    }
  }

  if (!parsed) {
    return null;
  }

  return (
    <div className="mt-6 border border-dashed border-black/30 bg-ui-bg/50 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Images</p>

      {!canGenerate ? (
        <p className="mt-2 text-sm text-ui-muted-dim">
          Image generation is available for <span className="text-ui-muted">static posts</span> and{" "}
          <span className="text-ui-muted">carousels</span>. Reel and story packs keep visual direction as
          copy-only.
        </p>
      ) : isCarousel ? (
        <>
          <p className="mt-2 text-sm text-ui-muted-dim">
            Generate one image per slide. Slides are stored in this post pack&rsquo;s metadata.
          </p>
          <ul className="mt-4 flex flex-col gap-6 border-t border-black/20 pt-4">
            {parsed.slides.map((slide, idx) => {
              const slideReady = Boolean(slide.image_url && slide.media_status === "ready");
              const busy = loading && loadingSlide === idx;
              return (
                <li key={slide.slide_number} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ui-text">
                      Slide {slide.slide_number}
                      {slide.title ? `: ${slide.title}` : ""}
                    </p>
                    {slideReady ? (
                      <span className="text-xs text-emerald-800">Image ready</span>
                    ) : (
                      <span className="text-xs text-ui-muted-dim">No image yet</span>
                    )}
                  </div>
                  {slide.supporting_text ? (
                    <p className="text-sm text-ui-muted">{slide.supporting_text}</p>
                  ) : null}
                  {slideReady && slide.image_url ? (
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URL */}
                      <img
                        src={slide.image_url}
                        alt={
                          packTitle
                            ? `${packTitle} — slide ${slide.slide_number}`
                            : `Slide ${slide.slide_number}`
                        }
                        className="max-h-[min(60vh,520px)] w-full max-w-lg border border-black object-contain"
                      />
                    </figure>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => runGenerate(idx)}
                      disabled={loading}
                      className="rounded-none border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? "Generating…" : slideReady ? "Regenerate image" : "Generate image"}
                    </button>
                    {busy ? (
                      <span className="text-sm text-ui-muted-dim">
                        Creating slide image — usually under a minute.
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {error ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-ui-muted-dim">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ui-muted-dim">
              Pack status
            </span>
            <span className="ml-2 text-ui-muted">
              {parsed.media_status === "ready" && parsed.slides.every((s) => s.image_url)
                ? "All slides ready"
                : `${parsed.slides.filter((s) => s.image_url).length}/${parsed.slides.length} slides with images`}
            </span>
          </p>
        </>
      ) : (
        <>
          {hasStaticImage && parsed.image_url ? (
            <figure className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URL */}
              <img
                src={parsed.image_url}
                alt={packTitle ? `Generated image for ${packTitle}` : "Generated post image"}
                className="max-h-[min(70vh,640px)] w-full max-w-lg border border-black object-contain"
              />
            </figure>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => runGenerate()}
              disabled={loading}
              className="rounded-none border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating…" : hasStaticImage ? "Regenerate image" : "Generate image"}
            </button>
            {loading ? (
              <span className="text-sm text-ui-muted-dim">Creating image with AI — usually under a minute.</span>
            ) : null}
          </div>
          {error ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 text-xs text-ui-muted-dim">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ui-muted-dim">Status</span>
            <span className="ml-2 text-ui-muted">
              {parsed.media_status === "ready" && parsed.image_url
                ? "Ready"
                : parsed.media_status === "pending"
                  ? "Pending"
                  : "Not generated"}
            </span>
            {parsed.image_prompt ? (
              <p className="mt-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ui-muted-dim">
                  Image prompt used
                </span>
                <span className="mt-1 block whitespace-pre-wrap text-sm text-ui-text">{parsed.image_prompt}</span>
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
