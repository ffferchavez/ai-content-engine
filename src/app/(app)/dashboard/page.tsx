import Link from "next/link";
import { getCurrentOrganizationContext, getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Home",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orgCtx = await getCurrentOrganizationContext();
  const orgId = await getCurrentOrganizationId();

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

  let brandCount = 0;
  let savedCount = 0;
  if (orgId) {
    const [{ count: b }, { count: s }] = await Promise.all([
      supabase.from("brands").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase
        .from("content_generations")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "completed"),
    ]);
    brandCount = b ?? 0;
    savedCount = s ?? 0;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Hi, {displayName}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Set up your brand, create a pack, then copy from Saved anytime.
        </p>
        {orgCtx ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Brands</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-100">{brandCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Saved packs</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-100">{savedCount}</p>
            </div>
          </div>
        ) : null}
        {!orgCtx ? (
          <p className="mt-4 text-sm leading-relaxed text-amber-200/90" role="status">
            We couldn&apos;t finish setting up your account. Try signing out and signing in again. If that
            doesn&apos;t help, contact support.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/brands"
          className="rounded-2xl border border-white/10 bg-zinc-900/50 px-6 py-6 transition hover:border-amber-500/30 hover:bg-zinc-900/70"
        >
          <h2 className="text-sm font-medium text-zinc-500">Brands</h2>
          <p className="mt-2 text-lg font-semibold text-zinc-50">Manage brand profiles</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Voice and audience — used every time you generate.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-amber-400">Open →</span>
        </Link>
        <Link
          href="/generate"
          className="rounded-2xl border border-white/10 bg-zinc-900/50 px-6 py-6 transition hover:border-amber-500/30 hover:bg-zinc-900/70"
        >
          <h2 className="text-sm font-medium text-zinc-500">Create</h2>
          <p className="mt-2 text-lg font-semibold text-zinc-50">Generate a content pack</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Ideas, hooks, captions, CTAs, hashtags, and an image prompt — saved automatically.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-amber-400">Open →</span>
        </Link>
        <Link
          href="/library"
          className="rounded-2xl border border-white/10 bg-zinc-900/50 px-6 py-6 transition hover:border-amber-500/30 hover:bg-zinc-900/70"
        >
          <h2 className="text-sm font-medium text-zinc-500">Saved</h2>
          <p className="mt-2 text-lg font-semibold text-zinc-50">Copy past packs</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Open any run to see full text and copy buttons.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-amber-400">Open →</span>
        </Link>
      </div>
    </div>
  );
}
