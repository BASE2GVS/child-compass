import { redirect } from "next/navigation";
import { getFamilyContext, getGoals, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import GoalsExperience from "@/components/experience/GoalsExperience";

export const dynamic = "force-dynamic";

export default async function GoalsPage({
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

  const { goals } = await getGoals(child.id);

  return <GoalsExperience child={child} familyChildren={children} goals={goals} />;
}
