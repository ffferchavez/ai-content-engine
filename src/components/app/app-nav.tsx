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

function desktopLinkClass(active: boolean) {
  return active
    ? "border-b-2 border-black pb-1 text-ui-text"
    : "border-b-2 border-transparent pb-1 text-ui-muted transition-colors hover:text-ui-text";
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex md:justify-center lg:gap-10"
        aria-label="Main"
      >
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[44px] items-center text-[13px] font-medium tracking-wide ${desktopLinkClass(active)}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex w-full border-t border-black bg-ui-bg pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden"
        aria-label="Main"
      >
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center px-1 py-2 text-[10px] font-medium uppercase leading-tight tracking-wider sm:text-[11px] ${
                active ? "text-ui-text" : "text-ui-muted-dim"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
