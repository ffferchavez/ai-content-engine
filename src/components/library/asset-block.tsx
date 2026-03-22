"use client";

import { CopyButton } from "@/components/ui/copy-button";

export type AssetDisplay = {
  id: string;
  asset_type: string;
  platform: string | null;
  title: string | null;
  body: string | null;
};

function copyText(a: AssetDisplay): string {
  const lines = [
    a.title ? `${a.title}\n` : "",
    a.body ?? "",
    a.platform ? `\n— ${a.platform}` : "",
  ].filter(Boolean);
  return lines.join("\n").trim();
}

export function AssetBlock({ asset }: { asset: AssetDisplay }) {
  const full = copyText(asset);

  return (
    <li className="rounded-xl border border-white/10 bg-helion-surface/90 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-helion-muted-dim">
          <span className="rounded-md bg-white/10 px-2 py-0.5 font-medium uppercase tracking-wide text-slate-300">
            {asset.asset_type.replace(/_/g, " ")}
          </span>
          {asset.platform ? <span>{asset.platform}</span> : null}
        </div>
        {full ? <CopyButton text={full} /> : null}
      </div>
      {asset.title ? <p className="mt-2 text-sm font-medium text-helion-text">{asset.title}</p> : null}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{asset.body}</p>
    </li>
  );
}
