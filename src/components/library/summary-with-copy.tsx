export function SummaryWithCopy({ text }: { text: string }) {
  return (
    <section className="w-full min-w-0 rounded-none border border-black bg-ui-bg p-5 sm:p-6">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ui-muted-dim">Overview</h2>
      <p className="mt-2 text-base leading-relaxed text-ui-text">{text}</p>
    </section>
  );
}
