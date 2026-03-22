import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-14 px-4 py-16 sm:px-6 lg:max-w-3xl lg:py-20">
      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
          Social posts that sound like you.
        </h1>
        <p className="text-lg leading-relaxed text-zinc-400">
          Tell us about your brand once. Then get ideas, captions, and more — ready to copy and use.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-[15px] font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/5"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-zinc-100">How it works</h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-400">
          <li>Add your business name and how you like to sound.</li>
          <li>Create posts with help from AI.</li>
          <li>Save what you like and come back anytime.</li>
        </ol>
      </section>
    </main>
  );
}
