"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { HelionWordmarkLink } from "@/components/brand/helion-wordmark";
import { MAIN_PAD, PAGE_INSET } from "@/lib/ui/shell";

export function AppShell({
  userEmail,
  displayName,
  initials,
  children,
}: {
  userEmail: string;
  displayName: string;
  initials: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-1 flex-col bg-[#fafafa]">
      <header className="shrink-0 border-b border-neutral-200/80 bg-white pt-[env(safe-area-inset-top)]">
        <div
          className={`${PAGE_INSET} flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 sm:gap-x-6 sm:py-4`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 md:flex-none md:gap-6">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-[22px]" strokeWidth={1.5} aria-hidden />
            </button>
            <HelionWordmarkLink href="/dashboard" variant="on-light" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <AppSidebar
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
          userEmail={userEmail}
          displayName={displayName}
          initials={initials}
        />
        <main
          className={`relative z-0 flex w-full min-w-0 flex-1 flex-col overflow-auto ${PAGE_INSET} ${MAIN_PAD}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
