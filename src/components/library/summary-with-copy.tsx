"use client";

import { CopyButton } from "@/components/ui/copy-button";

export function SummaryWithCopy({ text }: { text: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-helion-surface/70 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-helion-muted-dim">Overview</h2>
          <p className="mt-2 text-base leading-relaxed text-helion-text">{text}</p>
        </div>
        <CopyButton text={text} label="Copy overview" />
      </div>
    </section>
  );
}
