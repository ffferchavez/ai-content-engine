import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6 lg:py-24">
      <section className="flex flex-col gap-6">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400/90">
          Helion Media · SaaS MVP
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Structured social content packs, aligned to your brand.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
          Define a brand profile once, then generate reusable packs with post
          ideas, hooks, captions, CTAs, hashtags, and optional image prompts —
          multi-platform, multi-tone, and multi-language ready.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Brand-safe outputs",
            body: "Keep voice, audience, and guidelines attached to every generation run.",
          },
          {
            title: "Normalized storage",
            body: "Inputs and assets live in Postgres — ready for history, search, and future approvals.",
          },
          {
            title: "Org-ready",
            body: "Workspaces and RLS lay the groundwork for teams, metering, and subscriptions.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-white/10 bg-zinc-900/40 p-5"
          >
            <h2 className="text-sm font-semibold text-zinc-100">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {card.body}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 p-8">
        <h2 className="text-lg font-semibold text-zinc-100">What ships in v1</h2>
        <ul className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
          <li>Marketing site & authentication</li>
          <li>Dashboard & brand profiles</li>
          <li>Generation form & structured packs</li>
          <li>Content library & settings</li>
        </ul>
        <p className="mt-4 text-xs text-zinc-600">
          No direct posting, scheduling, or billing — intentional scope for a
          lean production MVP.
        </p>
      </section>
    </main>
  );
}
