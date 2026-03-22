import Link from "next/link";
import { PAGE_INSET } from "@/lib/ui/shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-[100dvh] min-h-screen flex-1 flex-col"
      suppressHydrationWarning
    >
      <header className="w-full border-b border-black bg-ui-bg pt-[env(safe-area-inset-top)]">
        <div
          className={`${PAGE_INSET} flex flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4`}
        >
          <Link
            href="/"
            className="flex min-h-[44px] flex-col justify-center gap-0.5"
            aria-label="Helion Media home"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">
              Helion
            </span>
            <span className="text-base font-medium tracking-[-0.02em] text-ui-text">Media</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-black px-4 py-2 text-[13px] font-medium tracking-wide text-ui-text transition-colors hover:bg-neutral-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center bg-black px-4 py-2 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-neutral-900"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <div
        className={`flex min-h-0 flex-1 flex-col ${PAGE_INSET} pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pt-20`}
      >
        {children}
      </div>
      <footer className="mt-auto w-full border-t border-black py-8 text-center sm:py-10">
        <div className={PAGE_INSET}>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">
            Helion City · AI content
          </p>
        </div>
      </footer>
    </div>
  );
}
