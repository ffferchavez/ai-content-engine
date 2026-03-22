"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { HelionWordmarkLink } from "@/components/brand/helion-wordmark";
import { MAIN_PAD, PAGE_INSET } from "@/lib/ui/shell";

const APP_HEADER_CLASS = "shrink-0 border-b border-neutral-200/80 bg-white";
const APP_HEADER_STYLE = { paddingTop: "env(safe-area-inset-top, 0px)" } as const;

/** Inline SVG — lucide-react icons often diverge between SSR and client (hydration errors). */
function MenuIcon() {
  return (
    <svg
      className="size-[22px]"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <header className={APP_HEADER_CLASS} style={APP_HEADER_STYLE}>
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
              <MenuIcon />
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
