import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            <span className="text-amber-400">Helion</span>{" "}
            <span className="text-zinc-100">Content Engine</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-white/10 py-8 text-center text-xs text-zinc-600">
        Helion City · Helion Media · AI Content Engine
      </footer>
    </div>
  );
}
