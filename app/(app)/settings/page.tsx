import { redirect } from "next/navigation";
import { getFamilyContext, getFamilyInvites, getProfile } from "@/lib/data/queries";
import { getFamilySubscription } from "@/lib/commercial/subscription-service";
import SettingsForms from "@/components/profile/SettingsForms";
import SubscriptionCard from "@/components/settings/SubscriptionCard";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { family, members } = await getFamilyContext();
  if (!family) redirect("/onboarding");
  const invites = await getFamilyInvites();
  const subscription = await getFamilySubscription(family.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your family, plan, notifications, privacy, and sharing permissions."
      />
      <div className="space-y-8">
        <SubscriptionCard familyId={family.id} snapshot={subscription} />
        <SettingsForms family={family} members={members} profile={profile} invites={invites} />
      </div>
    </PageShell>
  );
}
