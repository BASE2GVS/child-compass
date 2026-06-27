import { redirect } from "next/navigation";
import { therapyInsight } from "@/lib/hubs/therapy-service";
import { getFamilyContext, getProfile, getTherapySessions } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import TherapyExperience from "@/components/experience/TherapyExperience";

export const dynamic = "force-dynamic";

export default async function TherapyPage({
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

  const sessions = await getTherapySessions(child.id);
  const insight = therapyInsight(sessions);

  return (
    <TherapyExperience child={child} familyChildren={children} sessions={sessions} insight={insight} parentName={profile.full_name} />
  );
}
