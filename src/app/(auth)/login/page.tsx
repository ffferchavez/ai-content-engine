import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-helion-surface/90 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Log in</h1>
          <p className="mt-2 text-sm text-helion-muted-dim">Use the email and password you signed up with.</p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-helion-muted-dim">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-sm text-helion-muted-dim">
          <Link href="/" className="text-helion-muted-dim hover:text-helion-muted">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
