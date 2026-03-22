import Link from "next/link";

export default function LibraryNotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium tracking-[-0.03em] text-ui-text">Not found</h1>
      <p className="text-sm text-ui-muted">This saved pack doesn&apos;t exist or you can&apos;t access it.</p>
      <Link
        href="/library"
        className="text-sm font-medium underline decoration-black/25 underline-offset-4 transition hover:decoration-black"
      >
        ← Back to Saved
      </Link>
    </div>
  );
}
