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
      className="rounded-md px-2 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
    >
      Sign out
    </button>
  );
}
