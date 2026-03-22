import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create account · AI Content Engine",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl shadow-black/40">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400/90">
            Helion Media
          </p>
          <h1 className="mt-2 text-xl font-semibold text-zinc-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            You&apos;ll get a default workspace after signup.
          </p>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-500">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
