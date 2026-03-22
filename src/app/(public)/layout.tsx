import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      // Extensions sometimes mutate the DOM before hydration; suppressHydrationWarning only
      // affects this node's text/attrs, but helps when the wrapper is the mismatch site.
      suppressHydrationWarning
    >
      <header className="border-b border-white/10 bg-helion-elevated/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-base font-semibold text-helion-text">
            Helion
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-helion-muted transition hover:text-helion-text"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-helion-accent px-3 py-2 text-sm font-semibold text-helion-on-accent transition hover:bg-helion-accent-hover"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-white/10 py-8 text-center text-xs text-helion-muted-dim">
        Helion City · AI content for your brand
      </footer>
    </div>
  );
}
