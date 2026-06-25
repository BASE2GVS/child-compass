import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import ParentProfileForm from "@/components/profile/ParentProfileForm";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account, emergency contacts, timezone, and notification preferences."
      />
      <ParentProfileForm profile={profile} />
    </PageShell>
  );
}
