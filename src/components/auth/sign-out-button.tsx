"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  /** Icon-only control for compact sidebars. */
  variant?: "default" | "icon";
  className?: string;
};

export function SignOutButton({
  variant = "default",
  className = "",
}: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => void handleSignOut()}
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 ${className}`}
        aria-label="Log out"
      >
        <LogOut className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className={`inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium tracking-wide text-neutral-500 transition-colors hover:text-neutral-950 ${className}`}
    >
      <LogOut className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      Log out
    </button>
  );
}
