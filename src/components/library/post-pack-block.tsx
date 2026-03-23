"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { formatPostPackForCopy, parsePostPackFields } from "@/lib/generate/post-pack";
import { formatPlatformForDisplay } from "@/lib/platforms";
import { PostPackImageActions } from "@/components/library/post-pack-image-actions";
import { PostPackSocialPreview } from "@/components/social-preview/post-pack-social-preview";

export type PostPackAssetRow = {
  id: string;
  asset_type: string;
  platform: string | null;
  title: string | null;
  body: string | null;
  metadata?: unknown;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-ui-muted">{children}</div>
    </div>
  );
}

export function PostPackBlock({
  asset,
  index,
  brandName = "Brand",
  onAssetMetadataUpdate,
}: {
  asset: PostPackAssetRow;
  index: number;
  /** Brand label for social-style previews */
  brandName?: string;
  /** Merge updated metadata in parent lists (Create page). */
  onAssetMetadataUpdate?: (assetId: string, metadata: unknown) => void;
}) {
  const parsed = parsePostPackFields(asset.metadata);
  if (!parsed) {
    return (
      <li className="border-b border-black px-0 py-8 last:border-b-0">
        <p className="text-sm text-ui-warning/90">This post pack could not be displayed. Metadata may be missing.</p>
      </li>
    );
  }

  const platformLabel = formatPlatformForDisplay(asset.platform);

  const copyText = formatPostPackForCopy({
    title: asset.title,
    platform: platformLabel || null,
    fields: parsed,
  });

  return (
    <li className="border-b border-black px-0 py-8 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ui-muted-dim">
          <span className="border border-black px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ui-muted">
            Post pack {index + 1}
          </span>
          <span className="border border-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
            {parsed.suggested_format}
          </span>
          {platformLabel ? <span>{platformLabel}</span> : null}
        </div>
        {copyText ? <CopyButton text={copyText} label="Copy post pack" /> : null}
      </div>

      {asset.title ? (
        <h3 className="mt-4 text-lg font-medium tracking-[-0.02em] text-ui-text">{asset.title}</h3>
      ) : null}

      <div className="mt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Preview</p>
        <p className="mt-1 text-xs text-ui-muted-dim">
          Platform-inspired layout — not an official Instagram or Facebook UI.
        </p>
        <div className="mt-4">
          <PostPackSocialPreview
            brandName={brandName}
            platform={asset.platform}
            parsed={parsed}
            packTitle={asset.title}
          />
        </div>
      </div>

      <Field label="Angle">{parsed.post_angle}</Field>
      <Field label="Hook">
        <p className="whitespace-pre-wrap font-medium text-ui-text">{parsed.hook}</p>
      </Field>
      <Field label="Caption">
        <p className="whitespace-pre-wrap">{parsed.caption}</p>
      </Field>
      <Field label="Call to action">{parsed.call_to_action}</Field>
      <Field label="Hashtags">
        <p className="whitespace-pre-wrap text-ui-text">{parsed.hashtags}</p>
      </Field>
      <Field label="Visual direction">
        <p className="whitespace-pre-wrap">{parsed.visual_direction}</p>
      </Field>

      {parsed.suggested_format === "carousel" && parsed.slides.length > 0 ? (
        <Field label="Carousel slides">
          <ol className="mt-2 list-decimal space-y-4 pl-5">
            {parsed.slides.map((s) => (
              <li key={s.slide_number} className="text-sm">
                <p className="font-medium text-ui-text">{s.title}</p>
                {s.supporting_text ? (
                  <p className="mt-1 whitespace-pre-wrap text-ui-muted">{s.supporting_text}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-ui-muted-dim">{s.visual_direction}</p>
                {s.image_prompt ? (
                  <p className="mt-1 text-xs text-ui-muted-dim">Image prompt: {s.image_prompt}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </Field>
      ) : null}

      <PostPackImageActions
        assetId={asset.id}
        metadata={asset.metadata}
        packTitle={asset.title}
        onMetadataUpdated={
          onAssetMetadataUpdate ? (m) => onAssetMetadataUpdate(asset.id, m) : undefined
        }
      />

      <p className="mt-3 text-xs text-ui-muted-dim">
        Video and reel rendering are not supported. <span className="font-mono text-[11px]">media_url</span>{" "}
        is reserved for future non-image assets.
      </p>
    </li>
  );
}
