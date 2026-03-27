import Link from "next/link";
import { getCurrentOrganizationContext, getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Home",
};

const rows = [
  {
    href: "/brands",
    kicker: "Brands",
    title: "Set up your brand context",
    body: "Voice, audience, and source links that guide every generation.",
  },
  {
    href: "/generate",
    kicker: "Create",
    title: "Generate ready-to-use content",
    body: "Create 3 complete post packs for a brand and save the full run automatically.",
  },
  {
    href: "/library",
    kicker: "Saved",
    title: "Review saved generations",
    body: "Open any run to see the full packs, summaries, and generated assets in one place.",
  },
] as const;

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
    <div className="flex w-full min-w-0 flex-col">
      <header className="w-full border-b border-black pb-8 sm:pb-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Workspace</p>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-ui-text sm:mt-4 sm:text-3xl md:text-4xl">
          Hi, {displayName}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-6 sm:text-base">
          Set up your brand, generate complete content packs, and revisit every saved run from one workspace.
        </p>
        {orgCtx ? (
          <div className="mt-8 grid w-full grid-cols-1 gap-px bg-black sm:mt-10 sm:grid-cols-2">
            <div className="min-h-[100px] bg-ui-bg px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Brands</p>
              <p className="mt-2 text-2xl font-medium tabular-nums tracking-tight text-ui-text sm:text-3xl">
                {brandCount}
              </p>
            </div>
            <div className="min-h-[100px] bg-ui-bg px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Saved packs</p>
              <p className="mt-2 text-2xl font-medium tabular-nums tracking-tight text-ui-text sm:text-3xl">
                {savedCount}
              </p>
            </div>
          </div>
        ) : null}
        {!orgCtx ? (
          <p className="mt-6 text-sm leading-relaxed text-ui-warning/90 sm:mt-8" role="status">
            We couldn&apos;t finish setting up your account. Try signing out and signing in again. If that
            doesn&apos;t help, contact support.
          </p>
        ) : null}
      </header>

      <nav className="mt-0 w-full border-t border-black" aria-label="Workspace">
        {rows.map((row) => (
          <Link
            key={row.href}
            href={row.href}
            className="group flex w-full min-w-0 items-start justify-between gap-4 border-b border-black py-8 transition-colors hover:bg-neutral-50 sm:gap-8 sm:py-10"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">{row.kicker}</p>
              <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-ui-text sm:mt-3 sm:text-xl md:text-2xl">
                {row.title}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ui-muted sm:mt-3">{row.body}</p>
            </div>
            <span
              className="shrink-0 pt-0.5 text-2xl font-extralight leading-none text-ui-muted transition-colors group-hover:text-ui-text sm:pt-1 sm:text-3xl"
              aria-hidden
            >
              ›
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
