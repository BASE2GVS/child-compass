import Link from "next/link";

import { CompanionExpandable } from "@/components/companion";
import EditorialPage from "@/components/editorial/EditorialPage";

import SettingsForms from "@/components/profile/SettingsForms";

import SubscriptionCard from "@/components/settings/SubscriptionCard";

import type { Family, FamilyMember, FamilyAccessInvite, Profile } from "@/lib/types/database";

import type { SubscriptionSnapshot } from "@/lib/commercial/types";

type SettingsExperienceProps = {
  family: Family;
  members: FamilyMember[];
  profile: Profile;
  invites: FamilyAccessInvite[];
  subscription: SubscriptionSnapshot;
};

export default function SettingsExperience({
  family,
  members,
  profile,
  invites,
  subscription,
}: SettingsExperienceProps) {
  return (
    <EditorialPage
      variant="settings"
      title="Settings"
      parentName={profile.full_name}
    >
      <CompanionExpandable label="Your plan">
        <SubscriptionCard familyId={family.id} snapshot={subscription} />
      </CompanionExpandable>

      <CompanionExpandable label="Your details" className="mt-6">
        <SettingsForms family={family} members={members} profile={profile} invites={invites} />
      </CompanionExpandable>

      <p className="mt-10 text-center text-base text-[var(--cc-ink-muted)]">
        Need a hand?{" "}
        <Link href="/help" className="font-semibold text-[var(--cc-teal-deep)] hover:underline">
          Visit Help
        </Link>
      </p>
    </EditorialPage>
  );
}
