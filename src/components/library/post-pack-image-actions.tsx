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
  /** Hide inline large image previews when parent already shows media. */
  hideGeneratedImagePreviews?: boolean;
};

export function PostPackImageActions({
  assetId,
  metadata: initialMetadata,
  packTitle,
  onMetadataUpdated,
  hideGeneratedImagePreviews = false,
}: PostPackImageActionsProps) {
  const router = useRouter();
  const [metadata, setMetadata] = useState(initialMetadata);
  const [parsed, setParsed] = useState<PostPackFields | null>(() => parsePostPackFields(initialMetadata));
  const [loading, setLoading] = useState(false);
  const [loadingSlide, setLoadingSlide] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);

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
          <ul className="mt-4 grid grid-cols-3 gap-3 border-t border-black/20 pt-4">
            {parsed.slides.map((slide, idx) => {
              const slideReady = Boolean(slide.image_url && slide.media_status === "ready");
              const busy = loading && loadingSlide === idx;
              return (
                <li key={slide.slide_number} className="flex flex-col gap-2 border border-black/15 bg-ui-bg p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ui-text">
                      Slide {slide.slide_number}
                    </p>
                    {slideReady ? (
                      <span className="text-xs text-emerald-800">Image ready</span>
                    ) : (
                      <span className="text-xs text-ui-muted-dim">No image yet</span>
                    )}
                  </div>
                  {slide.title ? <p className="line-clamp-2 text-xs text-ui-muted">{slide.title}</p> : null}
                  {slide.supporting_text ? (
                    <p className="line-clamp-2 text-xs text-ui-muted-dim">{slide.supporting_text}</p>
                  ) : null}
                  {!hideGeneratedImagePreviews && slideReady && slide.image_url ? (
                    <figure>
                      <button
                        type="button"
                        onClick={() =>
                          setImagePreview({
                            src: slide.image_url!,
                            alt: packTitle
                              ? `${packTitle} — slide ${slide.slide_number}`
                              : `Slide ${slide.slide_number}`,
                          })
                        }
                        className="group relative block w-full"
                        aria-label={`Preview slide ${slide.slide_number} image`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URL */}
                        <img
                          src={slide.image_url}
                          alt={
                            packTitle
                              ? `${packTitle} — slide ${slide.slide_number}`
                              : `Slide ${slide.slide_number}`
                          }
                          className="aspect-square w-full border border-black/20 object-cover transition group-hover:border-black"
                        />
                        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 border border-white/70 bg-black/55 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M14 5h5v5M19 5l-7 7M10 19H5v-5M5 19l7-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Expand
                        </span>
                      </button>
                    </figure>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => runGenerate(idx)}
                      disabled={loading}
                      className="rounded-none border border-black bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? "Generating…" : slideReady ? "Regenerate image" : "Generate image"}
                    </button>
                    {busy ? (
                      <span className="text-xs text-ui-muted-dim">
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
          {!hideGeneratedImagePreviews && hasStaticImage && parsed.image_url ? (
            <figure className="mt-3">
              <button
                type="button"
                onClick={() =>
                  setImagePreview({
                    src: parsed.image_url!,
                    alt: packTitle ? `Generated image for ${packTitle}` : "Generated post image",
                  })
                }
                className="group relative block w-full max-w-lg"
                aria-label="Preview generated image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URL */}
                <img
                  src={parsed.image_url}
                  alt={packTitle ? `Generated image for ${packTitle}` : "Generated post image"}
                  className="max-h-[min(70vh,640px)] w-full border border-black object-contain transition group-hover:border-black/70"
                />
                <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 border border-white/70 bg-black/55 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M14 5h5v5M19 5l-7 7M10 19H5v-5M5 19l7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Expand
                </span>
              </button>
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

      {imagePreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Generated image preview"
          onClick={() => setImagePreview(null)}
        >
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="mb-2 rounded-none border border-white/70 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URL */}
            <img
              src={imagePreview.src}
              alt={imagePreview.alt}
              className="max-h-[85vh] w-full border border-white/30 bg-black object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
