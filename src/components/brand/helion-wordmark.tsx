import Link from "next/link";

type HelionWordmarkLinkProps = {
  href: string;
  /** `on-dark`: white + yellow Media. `on-light`: black + bold black Media. */
  variant?: "on-dark" | "on-light";
  className?: string;
};

/**
 * Horizontal wordmark: HELION (normal) + MEDIA (bold), Syne uppercase.
 */
export function HelionWordmarkLink({
  href,
  variant = "on-light",
  className = "",
}: HelionWordmarkLinkProps) {
  const isDark = variant === "on-dark";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center gap-2 font-sans text-sm uppercase tracking-[0.14em] sm:gap-2.5 sm:text-base ${className}`}
      aria-label="Helion Media home"
    >
      <span className={isDark ? "font-normal text-white" : "font-normal text-neutral-950"}>Helion</span>
      <span
        className={
          isDark ? "font-bold text-yellow-400" : "font-bold text-neutral-950"
        }
      >
        Media
      </span>
    </Link>
  );
}
