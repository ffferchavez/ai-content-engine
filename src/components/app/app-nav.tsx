"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNav = [
  { href: "/dashboard", label: "Home" },
  { href: "/brands", label: "Brands" },
  { href: "/generate", label: "Create" },
  { href: "/library", label: "Saved" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  return active
    ? "bg-white/10 text-white"
    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100";
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/60 p-0.5 md:flex"
        aria-label="Main"
      >
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${navLinkClass(active)}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-zinc-950/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        aria-label="Main"
      >
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center px-1 text-sm font-medium transition ${active ? "text-amber-400" : "text-zinc-500"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
