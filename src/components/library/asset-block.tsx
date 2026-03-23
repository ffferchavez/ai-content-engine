"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { formatPlatformForDisplay } from "@/lib/platforms";

export type AssetDisplay = {
  id: string;
  asset_type: string;
  platform: string | null;
  title: string | null;
  body: string | null;
};

function copyText(a: AssetDisplay): string {
  const platformLabel = formatPlatformForDisplay(a.platform);
  const lines = [
    a.title ? `${a.title}\n` : "",
    a.body ?? "",
    platformLabel ? `\n— ${platformLabel}` : "",
  ].filter(Boolean);
  return lines.join("\n").trim();
}

export function AssetBlock({ asset }: { asset: AssetDisplay }) {
  const full = copyText(asset);
  const platformLabel = formatPlatformForDisplay(asset.platform);

  return (
    <li className="border-b border-black px-0 py-8 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ui-muted-dim">
          <span className="border border-black px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ui-muted">
            {asset.asset_type.replace(/_/g, " ")}
          </span>
          {platformLabel ? <span>{platformLabel}</span> : null}
        </div>
        {full ? <CopyButton text={full} /> : null}
      </div>
      {asset.title ? <p className="mt-2 text-sm font-medium text-ui-text">{asset.title}</p> : null}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ui-muted">{asset.body}</p>
    </li>
  );
}
