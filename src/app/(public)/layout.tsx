import Link from "next/link";
import { HelionWordmarkLink } from "@/components/brand/helion-wordmark";
import { PAGE_INSET } from "@/lib/ui/shell";

const PUBLIC_HEADER_CLASS =
  "public-header-safe-top w-full border-b border-neutral-200/80 bg-white";

/** Inline SVGs avoid lucide-react SSR/client attribute drift (common hydration mismatch source). */
function LogInIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <header className={PUBLIC_HEADER_CLASS}>
        <div
          className={`${PAGE_INSET} flex flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4`}
        >
          <HelionWordmarkLink href="/" variant="on-light" />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-neutral-300 px-4 py-2 text-[13px] font-medium tracking-wide text-neutral-800 transition-colors hover:border-neutral-950 hover:bg-neutral-50"
            >
              <LogInIcon />
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-neutral-950 bg-neutral-950 px-4 py-2 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-neutral-800"
            >
              <UserPlusIcon />
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
            <span className="text-neutral-600">AI Content Engine</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
