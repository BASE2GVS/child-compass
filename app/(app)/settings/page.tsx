import { redirect } from "next/navigation";
import { getFamilyContext, getFamilyInvites, getProfile } from "@/lib/data/queries";
import { getFamilySubscription } from "@/lib/commercial/subscription-service";
import SettingsExperience from "@/components/experience/SettingsExperience";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { family, members } = await getFamilyContext();
  if (!family) redirect("/onboarding");
  const invites = await getFamilyInvites();
  const subscription = await getFamilySubscription(family.id);

  return (
    <SettingsExperience
      family={family}
      members={members}
      profile={profile}
      invites={invites}
      subscription={subscription}
    />
  );
}
