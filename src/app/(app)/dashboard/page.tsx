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
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Hi, {displayName}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-helion-muted">
          Set up your brand, create a pack, then copy from Saved anytime.
        </p>
        {orgCtx ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-helion-surface/90 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-helion-muted-dim">Brands</p>
              <p className="mt-1 text-2xl font-semibold text-helion-text">{brandCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-helion-surface/90 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-helion-muted-dim">Saved packs</p>
              <p className="mt-1 text-2xl font-semibold text-helion-text">{savedCount}</p>
            </div>
          </div>
        ) : null}
        {!orgCtx ? (
          <p className="mt-4 text-sm leading-relaxed text-helion-warning/90" role="status">
            We couldn&apos;t finish setting up your account. Try signing out and signing in again. If that
            doesn&apos;t help, contact support.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/brands"
          className="rounded-2xl border border-white/10 bg-helion-surface/90 px-6 py-6 transition hover:border-helion-accent/30 hover:bg-helion-surface-hover"
        >
          <h2 className="text-sm font-medium text-helion-muted-dim">Brands</h2>
          <p className="mt-2 text-lg font-semibold text-white">Manage brand profiles</p>
          <p className="mt-2 text-sm leading-relaxed text-helion-muted">
            Voice and audience — used every time you generate.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-helion-accent">Open →</span>
        </Link>
        <Link
          href="/generate"
          className="rounded-2xl border border-white/10 bg-helion-surface/90 px-6 py-6 transition hover:border-helion-accent/30 hover:bg-helion-surface-hover"
        >
          <h2 className="text-sm font-medium text-helion-muted-dim">Create</h2>
          <p className="mt-2 text-lg font-semibold text-white">Generate a content pack</p>
          <p className="mt-2 text-sm leading-relaxed text-helion-muted">
            Ideas, hooks, captions, CTAs, hashtags, and an image prompt — saved automatically.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-helion-accent">Open →</span>
        </Link>
        <Link
          href="/library"
          className="rounded-2xl border border-white/10 bg-helion-surface/90 px-6 py-6 transition hover:border-helion-accent/30 hover:bg-helion-surface-hover"
        >
          <h2 className="text-sm font-medium text-helion-muted-dim">Saved</h2>
          <p className="mt-2 text-lg font-semibold text-white">Copy past packs</p>
          <p className="mt-2 text-sm leading-relaxed text-helion-muted">
            Open any run to see full text and copy buttons.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-helion-accent">Open →</span>
        </Link>
      </div>
    </div>
  );
}
