"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    setMessage("Check your email to confirm your account. Then come back here to log in.");
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-[15px] font-medium text-zinc-200">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          placeholder="Alex Rivera"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[15px] font-medium text-zinc-200">
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
          className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          placeholder="you@company.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[15px] font-medium text-zinc-200">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
        />
        <p className="text-xs text-zinc-600">At least 8 characters.</p>
      </div>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-400" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
          Log in
        </Link>
      </p>
    </form>
  );
}
