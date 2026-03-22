"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? urlError;
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    setError(null);

    router.push(next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[15px] font-medium text-helion-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-helion-surface px-4 py-3 text-[15px] text-helion-text outline-none placeholder:text-helion-muted-dim focus:border-helion-accent/40 focus:ring-2 focus:ring-helion-accent/25"
          placeholder="you@company.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[15px] font-medium text-helion-text">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-helion-surface px-4 py-3 text-[15px] text-helion-text outline-none placeholder:text-helion-muted-dim focus:border-helion-accent/40 focus:ring-2 focus:ring-helion-accent/25"
        />
      </div>
      {displayError ? (
        <p className="text-sm text-red-400" role="alert">
          {displayError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-helion-accent py-3.5 text-[15px] font-semibold text-helion-on-accent transition hover:bg-helion-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-helion-muted-dim">
        New here?{" "}
        <Link href="/signup" className="font-medium text-helion-accent hover:text-helion-accent-hover">
          Sign up
        </Link>
      </p>
    </form>
  );
}
