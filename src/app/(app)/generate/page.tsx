export const metadata = {
  title: "Generate · AI Content Engine",
};

export default function GeneratePlaceholderPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-zinc-50">Generate</h1>
      <p className="text-sm text-zinc-500">
        The generation form and{" "}
        <code className="rounded bg-white/5 px-1 py-0.5 text-xs text-amber-200/90">
          POST /api/generate
        </code>{" "}
        land in Phase 4 — structured OpenAI output saved to normalized tables.
      </p>
    </div>
  );
}
