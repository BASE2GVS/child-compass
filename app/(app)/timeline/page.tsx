import { redirect } from "next/navigation";

import { getFamilyContext, getProfile, getUnifiedTimeline, getCompanionInsights } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import FamilyTimeline from "@/components/timeline/FamilyTimeline";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
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

  const [events, companionInsights] = await Promise.all([
    getUnifiedTimeline(child.id, 120),
    getCompanionInsights(child.id),
  ]);

  return (
    <FamilyTimeline
      events={events}
      child={child}
      familyChildren={children}
      parentName={profile.full_name}
      companionInsights={companionInsights}
    />
  );
}
