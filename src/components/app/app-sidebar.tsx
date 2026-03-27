"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Building2,
  Home,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UserAvatarPlaceholder } from "@/components/app/user-avatar-placeholder";
import { useMediaQuery } from "@/hooks/use-media-query";

const primaryNav = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/brands", label: "Brands", Icon: Building2 },
  { href: "/generate", label: "Create", Icon: Sparkles },
  { href: "/library", label: "Saved", Icon: Bookmark },
] as const;

const navLinkFocus =
  "outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavLinks({
  collapsed,
  isDesktop,
}: {
  collapsed: boolean;
  isDesktop: boolean;
}) {
  const pathname = usePathname();
  const iconOnly = collapsed && isDesktop;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!iconOnly && (
        <p className="px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          Workspace
        </p>
      )}
      <nav className="flex flex-col gap-1 px-2 pb-3" aria-label="Main">
        {primaryNav.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={iconOnly ? label : undefined}
              className={[
                navLinkFocus,
                "group relative flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-wide transition-[background-color,color,box-shadow] duration-200",
                iconOnly ? "justify-center px-2" : "",
                active
                  ? "bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200/90"
                  : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950",
              ].join(" ")}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#d4c800]"
                  aria-hidden
                />
              )}
              <Icon
                className={`size-[18px] shrink-0 transition-colors ${active ? "text-neutral-950" : "text-neutral-400 group-hover:text-neutral-700"}`}
                strokeWidth={1.5}
                aria-hidden
              />
              {!iconOnly && (
                <span className="min-w-0 truncate leading-snug">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarUserFooter({
  userEmail,
  displayName,
  initials,
  collapsed,
  isDesktop,
  mobile,
}: {
  userEmail: string;
  displayName: string;
  initials: string;
  collapsed: boolean;
  isDesktop: boolean;
  mobile?: boolean;
}) {
  const iconOnly = collapsed && isDesktop;
  const shortLabel =
    displayName.trim() ||
    (userEmail.includes("@") ? userEmail.split("@")[0] : userEmail) ||
    "Account";

  const bottomSafe = mobile
    ? "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    : "";

  if (iconOnly) {
    return (
      <div
        className={`shrink-0 border-t border-neutral-200/80 bg-[#fafafa]/95 ${bottomSafe}`}
      >
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <Link
            href="/settings"
            className={`${navLinkFocus} rounded-full`}
            aria-label="Account settings"
            title={shortLabel}
          >
            <UserAvatarPlaceholder
              initials={initials}
              title={userEmail || shortLabel}
            />
          </Link>
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/settings"
              className={`${navLinkFocus} inline-flex size-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white hover:text-neutral-950 hover:shadow-sm`}
              aria-label="Account settings"
              title="Settings"
            >
              <Settings className="size-[18px]" strokeWidth={1.5} aria-hidden />
            </Link>
            <SignOutButton variant="icon" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 border-t border-neutral-200/80 bg-[#fafafa]/95 ${bottomSafe}`}
    >
      <div className="p-3">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex gap-3">
            <Link
              href="/settings"
              className={`${navLinkFocus} shrink-0 rounded-full`}
              aria-label={`Open account settings for ${shortLabel}`}
            >
              <UserAvatarPlaceholder
                initials={initials}
                title={userEmail || shortLabel}
                decorative
              />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-neutral-950">
                {shortLabel}
              </p>
              <div className="mt-3 flex flex-col gap-0.5 border-t border-neutral-100 pt-3">
                <Link
                  href="/settings"
                  className={`${navLinkFocus} inline-flex min-h-10 items-center gap-2 rounded-md px-1 text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-950`}
                >
                  <Settings
                    className="size-4 shrink-0 text-neutral-400"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  Account
                </Link>
                <SignOutButton className="min-h-10 justify-start px-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  mobileOpen,
  onMobileOpenChange,
  userEmail,
  displayName,
  initials,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  userEmail: string;
  displayName: string;
  initials: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [desktopExpanded, setDesktopExpanded] = useState(false);

  useEffect(() => {
    if (!isDesktop) return;
    onMobileOpenChange(false);
  }, [isDesktop, onMobileOpenChange]);

  const pathname = usePathname();
  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen || isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, isDesktop]);

  const userFooter = (
    <SidebarUserFooter
      userEmail={userEmail}
      displayName={displayName}
      initials={initials}
      collapsed={!desktopExpanded}
      isDesktop={isDesktop}
    />
  );

  return (
    <>
      <aside
        onMouseEnter={() => setDesktopExpanded(true)}
        onMouseLeave={() => setDesktopExpanded(false)}
        className={[
          "relative hidden h-full min-h-0 shrink-0 flex-col border-r border-neutral-200/80 bg-[#fafafa] transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex",
          desktopExpanded ? "w-[248px] shadow-[6px_0_24px_rgba(0,0,0,0.05)]" : "w-[76px]",
        ].join(" ")}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <SidebarNavLinks collapsed={!desktopExpanded} isDesktop={isDesktop} />
        </div>
        {userFooter}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        onClick={() => onMobileOpenChange(false)}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,90vw)] max-w-full flex-col border-r border-neutral-200/80 bg-[#fafafa] shadow-[8px_0_40px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-neutral-400">
              Menu
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-neutral-900">
              {displayName.trim() ||
                (userEmail.includes("@") ? userEmail.split("@")[0] : userEmail) ||
                "Account"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onMobileOpenChange(false)}
            className={`${navLinkFocus} inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white hover:text-neutral-950`}
            aria-label="Close menu"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <SidebarNavLinks collapsed={false} isDesktop={false} />
        </div>
        <SidebarUserFooter
          userEmail={userEmail}
          displayName={displayName}
          initials={initials}
          collapsed={false}
          isDesktop={false}
          mobile
        />
      </aside>
    </>
  );
}
