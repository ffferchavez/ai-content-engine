/**
 * Circular placeholder “photo” with initials (no image upload yet).
 */
export function UserAvatarPlaceholder({
  initials,
  title,
  /** When the user’s name is read elsewhere, hide the avatar from assistive tech. */
  decorative = false,
  className = "",
}: {
  initials: string;
  title?: string;
  decorative?: boolean;
  className?: string;
}) {
  const safe = initials.slice(0, 2).toUpperCase() || "??";

  return (
    <span
      title={title}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title ?? `Profile (${safe})`}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-semibold tracking-tight text-neutral-800 ring-1 ring-neutral-300/80 ${className}`}
    >
      {safe}
    </span>
  );
}
