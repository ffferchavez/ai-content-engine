import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-white/10 bg-helion-elevated/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-baseline gap-1.5"
            aria-label="Helion Media home"
          >
            <span className="text-base font-semibold tracking-tight text-white">Helion</span>
            <span className="text-sm font-medium text-helion-accent">Media</span>
          </Link>
          <AppNav />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/settings"
              className="rounded-lg px-2 py-1.5 text-sm text-helion-muted-dim transition hover:bg-white/5 hover:text-helion-text"
            >
              Account
            </Link>
            <span className="hidden max-w-[140px] truncate text-xs text-helion-muted-dim lg:inline">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="relative z-0 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 pb-40 sm:px-6 md:pb-10 lg:max-w-3xl">
        {children}
      </main>
    </div>
  );
}
