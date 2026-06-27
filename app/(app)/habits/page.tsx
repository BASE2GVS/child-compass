import { redirect } from "next/navigation";
import { getFamilyContext, getHabits, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import HabitsExperience from "@/components/experience/HabitsExperience";

export const dynamic = "force-dynamic";

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const { habits, entries } = await getHabits(child.id);
  const today = new Date().toISOString().split("T")[0];

  return (
    <HabitsExperience
      child={child}
      familyChildren={children}
      habits={habits}
      entries={entries}
      today={today}
    />
  );
}
