import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · AI Content Engine",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const displayName =
    (!profileError && profile?.full_name?.trim()) ||
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null) ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Hello, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Your workspace is ready. Add a brand profile, then generate structured
          content packs — ideas, hooks, captions, CTAs, hashtags, and optional
          image prompts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/brands"
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 transition hover:border-amber-500/30 hover:bg-zinc-900/60"
        >
          <h2 className="text-sm font-semibold text-zinc-100">Brand profiles</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Capture voice, audience, and guidelines for consistent outputs.
          </p>
          <span className="mt-3 inline-block text-xs font-medium text-amber-400">
            Phase 2 →
          </span>
        </Link>
        <Link
          href="/generate"
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 transition hover:border-amber-500/30 hover:bg-zinc-900/60"
        >
          <h2 className="text-sm font-semibold text-zinc-100">Generate</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Run a structured pack across platforms, tones, and languages.
          </p>
          <span className="mt-3 inline-block text-xs font-medium text-amber-400">
            Phase 4 →
          </span>
        </Link>
      </div>
    </div>
  );
}
