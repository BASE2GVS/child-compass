import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getVisualSchedules } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import SchedulesExperience from "@/components/experience/SchedulesExperience";

export const dynamic = "force-dynamic";

export default async function SchedulesPage({
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

  const { schedules, items } = await getVisualSchedules(child.id);

  return (
    <SchedulesExperience child={child} familyChildren={children} schedules={schedules} items={items} />
  );
}
