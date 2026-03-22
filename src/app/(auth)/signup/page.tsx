import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50">Create an account</h1>
          <p className="mt-2 text-sm text-zinc-500">Takes about a minute. No credit card.</p>
        </div>
        <SignupForm />
        <p className="mt-8 text-center text-sm text-zinc-600">
          <Link href="/" className="text-zinc-500 hover:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
