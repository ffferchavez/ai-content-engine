import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex w-full min-w-0 flex-1 flex-col">
      <section className="w-full max-w-4xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">Helion Media</p>
        <h1 className="mt-5 text-[1.75rem] font-medium leading-[1.08] tracking-[-0.03em] text-ui-text sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
          Social posts that sound like you.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ui-muted sm:mt-8 sm:text-lg">
          Tell us about your brand once. Then get ideas, captions, and more — ready to copy and use.
        </p>
      </section>

      <nav
        className="mt-12 w-full border-t border-black sm:mt-16 lg:mt-24"
        aria-label="Get started"
      >
        <Link
          href="/signup"
          className="group flex min-h-[56px] items-center justify-between gap-4 border-b border-black py-4 transition-colors hover:bg-neutral-50 sm:min-h-[64px] sm:gap-6 sm:py-6"
        >
          <span className="min-w-0 text-base font-medium tracking-tight text-ui-text sm:text-lg md:text-xl">
            Get started free
          </span>
          <span
            className="shrink-0 text-2xl font-extralight text-ui-muted transition-colors group-hover:text-ui-text sm:text-3xl"
            aria-hidden
          >
            ›
          </span>
        </Link>
        <Link
          href="/login"
          className="group flex min-h-[56px] items-center justify-between gap-4 border-b border-black py-4 transition-colors hover:bg-neutral-50 sm:min-h-[64px] sm:gap-6 sm:py-6"
        >
          <span className="min-w-0 text-base font-medium tracking-tight text-ui-text sm:text-lg md:text-xl">
            I already have an account
          </span>
          <span
            className="shrink-0 text-2xl font-extralight text-ui-muted transition-colors group-hover:text-ui-text sm:text-3xl"
            aria-hidden
          >
            ›
          </span>
        </Link>
      </nav>

      <section className="mt-16 w-full max-w-xl border-t border-black pt-12 sm:mt-20 sm:pt-16 lg:mt-28">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.35em] text-ui-muted-dim">How it works</h2>
        <ol className="mt-6 space-y-5 text-sm leading-relaxed text-ui-muted sm:mt-8 sm:space-y-6 sm:text-base">
          <li className="flex gap-3 border-b border-black/10 pb-5 sm:gap-4 sm:pb-6">
            <span className="shrink-0 font-medium tabular-nums text-ui-text">01</span>
            <span className="min-w-0">Add your business name and how you like to sound.</span>
          </li>
          <li className="flex gap-3 border-b border-black/10 pb-5 sm:gap-4 sm:pb-6">
            <span className="shrink-0 font-medium tabular-nums text-ui-text">02</span>
            <span className="min-w-0">Create posts with help from AI.</span>
          </li>
          <li className="flex gap-3 sm:gap-4">
            <span className="shrink-0 font-medium tabular-nums text-ui-text">03</span>
            <span className="min-w-0">Save what you like and come back anytime.</span>
          </li>
        </ol>
      </section>
    </main>
  );
}
