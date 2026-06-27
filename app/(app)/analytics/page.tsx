import { redirect } from "next/navigation";
import { getCheckins, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import AnalyticsExperience from "@/components/experience/AnalyticsExperience";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
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

  const checkins = await getCheckins(child.id, 30);

  return <AnalyticsExperience child={child} familyChildren={children} checkins={checkins} />;
}
