"use client";

import { CopyButton } from "@/components/ui/copy-button";

export function SummaryWithCopy({ text }: { text: string }) {
  return (
    <section className="w-full min-w-0 rounded-none border border-black bg-ui-bg p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">Overview</h2>
          <p className="mt-2 text-base leading-relaxed text-ui-text">{text}</p>
        </div>
        <CopyButton text={text} label="Copy overview" />
      </div>
    </section>
  );
}
