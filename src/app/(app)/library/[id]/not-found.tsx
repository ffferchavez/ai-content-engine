import Link from "next/link";

export default function LibraryNotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-50">Not found</h1>
      <p className="text-sm text-zinc-500">This saved pack doesn&apos;t exist or you can&apos;t access it.</p>
      <Link href="/library" className="text-sm font-medium text-amber-400 hover:text-amber-300">
        ← Back to Saved
      </Link>
    </div>
  );
}
