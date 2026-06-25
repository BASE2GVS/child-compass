export { isPilotAdminEnabled, isPilotAdminUser } from "@/lib/pilot/config";

export async function isAdminUser(email: string | undefined): Promise<boolean> {
  const { isPilotAdminEnabled, isPilotAdminUser } = await import("@/lib/pilot/config");
  if (!isPilotAdminEnabled()) return false;
  return isPilotAdminUser(email);
}

export async function guardAdminPage(): Promise<void> {
  const { redirect } = await import("next/navigation");
  const { createClient } = await import("@/lib/supabase/server");
  const { isPilotAdminEnabled, isPilotAdminUser } = await import("@/lib/pilot/config");

  if (!isPilotAdminEnabled()) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) redirect("/login");
  const allowed = await isPilotAdminUser(email);
  if (!allowed) redirect("/dashboard");
}
