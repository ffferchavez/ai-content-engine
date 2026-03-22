"use client";

import { CopyButton } from "@/components/ui/copy-button";

export function SummaryWithCopy({ text }: { text: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-500">Overview</h2>
          <p className="mt-2 text-base leading-relaxed text-zinc-200">{text}</p>
        </div>
        <CopyButton text={text} label="Copy overview" />
      </div>
    </section>
  );
}
