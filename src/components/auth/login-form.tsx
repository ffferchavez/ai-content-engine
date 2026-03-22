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
        <label htmlFor="email" className="text-[15px] font-medium text-ui-text">
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
          className="w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
          placeholder="you@company.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[15px] font-medium text-ui-text">
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
          className="w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
        />
      </div>
      {displayError ? (
        <p className="text-sm text-red-700" role="alert">
          {displayError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-none bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-ui-muted-dim">
        New here?{" "}
        <Link href="/signup" className="font-medium underline decoration-black/25 underline-offset-4 transition hover:decoration-black">
          Sign up
        </Link>
      </p>
    </form>
  );
}
