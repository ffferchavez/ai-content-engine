"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="rounded-lg px-3 py-2 text-sm font-medium text-helion-muted transition hover:bg-white/5 hover:text-helion-text"
    >
      Log out
    </button>
  );
}
