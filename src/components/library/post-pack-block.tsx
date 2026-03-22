"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { formatPostPackForCopy, parsePostPackFields } from "@/lib/generate/post-pack";

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

export function PostPackBlock({ asset, index }: { asset: PostPackAssetRow; index: number }) {
  const parsed = parsePostPackFields(asset.metadata);
  if (!parsed) {
    return (
      <li className="border-b border-black px-0 py-8 last:border-b-0">
        <p className="text-sm text-ui-warning/90">This post pack could not be displayed. Metadata may be missing.</p>
      </li>
    );
  }

  const copyText = formatPostPackForCopy({
    title: asset.title,
    platform: asset.platform,
    fields: parsed,
  });

  return (
    <li className="border-b border-black px-0 py-8 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ui-muted-dim">
          <span className="border border-black px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ui-muted">
            Post {index + 1}
          </span>
          <span className="border border-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
            {parsed.suggested_format}
          </span>
          {asset.platform ? <span>{asset.platform}</span> : null}
        </div>
        {copyText ? <CopyButton text={copyText} label="Copy post pack" /> : null}
      </div>

      {asset.title ? (
        <h3 className="mt-4 text-lg font-medium tracking-[-0.02em] text-ui-text">{asset.title}</h3>
      ) : null}

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
    </li>
  );
}
