import Link from "next/link";

export default function LibraryNotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">Not found</h1>
      <p className="text-sm text-helion-muted-dim">This saved pack doesn&apos;t exist or you can&apos;t access it.</p>
      <Link href="/library" className="text-sm font-medium text-helion-accent hover:text-helion-accent-hover">
        ← Back to Saved
      </Link>
    </div>
  );
}
