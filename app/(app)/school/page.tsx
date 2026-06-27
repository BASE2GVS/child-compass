import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getSchoolHubEntries } from "@/lib/data/queries";
import { schoolHubInsight } from "@/lib/hubs/school-service";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import SchoolExperience from "@/components/experience/SchoolExperience";

export const dynamic = "force-dynamic";

export default async function SchoolPage({
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

  const entries = await getSchoolHubEntries(child.id);
  const insight = schoolHubInsight(entries);

  return (
    <SchoolExperience child={child} familyChildren={children} entries={entries} insight={insight} parentName={profile.full_name} />
  );
}
