import Link from "next/link";

/** Static shell avoids streaming boundary quirks; see suppressHydrationWarning on the root div. */
export const dynamic = "force-static";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      // Extensions (Grammarly, password managers, etc.) sometimes inject a fixed-position
      // node or mutate the tree before hydration; this avoids recoverable mismatch noise.
      suppressHydrationWarning
    >
      <header
        className="border-b border-white/10 bg-zinc-950/80 backdrop-blur"
        suppressHydrationWarning
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-base font-semibold text-zinc-100">
            Helion
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer
        className="mt-auto border-t border-white/10 py-8 text-center text-xs text-zinc-600"
        suppressHydrationWarning
      >
        Helion · AI content for your brand
      </footer>
    </div>
  );
}
