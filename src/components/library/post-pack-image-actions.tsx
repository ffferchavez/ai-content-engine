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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMetadata(initialMetadata);
    setParsed(parsePostPackFields(initialMetadata));
  }, [initialMetadata]);

  const canGenerate = parsed ? supportsPostPackImageGeneration(parsed.suggested_format) : false;
  const hasImage = Boolean(parsed?.image_url && parsed.media_status === "ready");

  async function runGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/generated-assets/${assetId}/image`, { method: "POST" });
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
    }
  }

  if (!parsed) {
    return null;
  }

  return (
    <div className="mt-6 border border-dashed border-black/30 bg-ui-bg/50 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Image</p>

      {!canGenerate ? (
        <p className="mt-2 text-sm text-ui-muted-dim">
          Image generation is available for <span className="text-ui-muted">static posts</span> and{" "}
          <span className="text-ui-muted">carousels</span>. Reel and story packs keep visual direction as
          copy-only.
        </p>
      ) : (
        <>
          {hasImage && parsed.image_url ? (
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
              onClick={runGenerate}
              disabled={loading}
              className="rounded-none border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating…" : hasImage ? "Regenerate image" : "Generate image"}
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
        </>
      )}

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
    </div>
  );
}
