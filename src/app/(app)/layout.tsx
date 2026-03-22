import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { userInitials } from "@/lib/user/initials";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : "";
  const email = user.email ?? "";
  const initials = userInitials({
    name: displayName || undefined,
    email: email || undefined,
  });

  return (
    <AppShell
      userEmail={email}
      displayName={displayName}
      initials={initials}
    >
      {children}
    </AppShell>
  );
}
