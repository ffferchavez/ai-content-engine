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
        <label htmlFor="fullName" className="text-[15px] font-medium text-ui-text">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
          placeholder="Alex Rivera"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
        />
        <p className="text-xs text-ui-muted-dim">At least 8 characters.</p>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-none bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ui-muted-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline decoration-black/25 underline-offset-4 transition hover:decoration-black">
          Log in
        </Link>
      </p>
    </form>
  );
}
