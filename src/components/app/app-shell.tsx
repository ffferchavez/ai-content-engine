import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MAIN_PAD, PAGE_INSET } from "@/lib/ui/shell";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="w-full border-b border-black bg-ui-bg pt-[env(safe-area-inset-top)]">
        <div
          className={`${PAGE_INSET} flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 sm:gap-x-6 sm:py-4`}
        >
          <Link
            href="/dashboard"
            className="flex min-h-[44px] shrink-0 flex-col justify-center gap-0.5"
            aria-label="Helion Media home"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">
              Helion
            </span>
            <span className="text-base font-medium tracking-[-0.02em] text-ui-text">Media</span>
          </Link>
          <AppNav />
          <div className="flex min-h-[44px] shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-6 md:gap-8">
            <Link
              href="/settings"
              className="inline-flex min-h-[44px] items-center text-[13px] font-medium tracking-wide text-ui-muted transition-colors hover:text-ui-text"
            >
              Account
            </Link>
            <span className="hidden max-w-[min(160px,40vw)] truncate text-[11px] uppercase tracking-wider text-ui-muted-dim lg:inline">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className={`relative z-0 flex w-full min-w-0 flex-1 flex-col ${PAGE_INSET} ${MAIN_PAD}`}>
        {children}
      </main>
    </div>
  );
}
