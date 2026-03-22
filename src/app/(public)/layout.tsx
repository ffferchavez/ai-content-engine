import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { HelionWordmarkLink } from "@/components/brand/helion-wordmark";
import { PAGE_INSET } from "@/lib/ui/shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-[100dvh] min-h-screen flex-1 flex-col bg-[#fafafa]"
      suppressHydrationWarning
    >
      <header className="w-full border-b border-neutral-200/80 bg-white pt-[env(safe-area-inset-top)]">
        <div
          className={`${PAGE_INSET} flex flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4`}
        >
          <HelionWordmarkLink href="/" variant="on-light" />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-neutral-300 px-4 py-2 text-[13px] font-medium tracking-wide text-neutral-800 transition-colors hover:border-neutral-950 hover:bg-neutral-50"
            >
              <LogIn className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-neutral-950 bg-neutral-950 px-4 py-2 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-neutral-800"
            >
              <UserPlus className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
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
      <footer className="mt-auto w-full border-t border-neutral-200/80 bg-white py-8 text-center sm:py-10">
        <div className={PAGE_INSET}>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-400">
            Helion City ·{" "}
            <span className="text-neutral-600">AI content</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
