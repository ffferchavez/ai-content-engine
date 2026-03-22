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
        <label htmlFor="fullName" className="text-[15px] font-medium text-helion-text">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-helion-surface px-4 py-3 text-[15px] text-helion-text outline-none placeholder:text-helion-muted-dim focus:border-helion-accent/40 focus:ring-2 focus:ring-helion-accent/25"
          placeholder="Alex Rivera"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-helion-surface px-4 py-3 text-[15px] text-helion-text outline-none placeholder:text-helion-muted-dim focus:border-helion-accent/40 focus:ring-2 focus:ring-helion-accent/25"
        />
        <p className="text-xs text-helion-muted-dim">At least 8 characters.</p>
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
        className="mt-1 w-full rounded-xl bg-helion-accent py-3.5 text-[15px] font-semibold text-helion-on-accent transition hover:bg-helion-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-helion-muted-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-helion-accent hover:text-helion-accent-hover">
          Log in
        </Link>
      </p>
    </form>
  );
}
