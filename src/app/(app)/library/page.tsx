export const metadata = {
  title: "Library · AI Content Engine",
};

export default function LibraryPlaceholderPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-zinc-50">Content library</h1>
      <p className="text-sm text-zinc-500">
        History and detail views for past runs ship in Phases 3–4, backed by{" "}
        <code className="rounded bg-white/5 px-1 py-0.5 text-xs text-amber-200/90">
          content_generations
        </code>{" "}
        and{" "}
        <code className="rounded bg-white/5 px-1 py-0.5 text-xs text-amber-200/90">
          generated_assets
        </code>
        .
      </p>
    </div>
  );
}
