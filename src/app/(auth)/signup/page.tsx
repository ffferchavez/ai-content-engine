import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-helion-surface/90 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Create an account</h1>
          <p className="mt-2 text-sm text-helion-muted-dim">Takes about a minute. No credit card.</p>
        </div>
        <SignupForm />
        <p className="mt-8 text-center text-sm text-helion-muted-dim">
          <Link href="/" className="text-helion-muted-dim hover:text-helion-muted">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
