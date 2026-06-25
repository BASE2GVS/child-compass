import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getUnifiedTimeline } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import TimelineView from "@/components/timeline/TimelineView";
import { PageHeader, PageShell } from "@/components/design-system";

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
  if (children.length === 0) redirect("/onboarding");

  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const events = await getUnifiedTimeline(child.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Journey"
        title="Child Timeline™"
        description={`${child.nickname || child.first_name}'s complete story — check-ins, debriefs, insights, and family moments.`}
        familyChildren={children}
        activeChildId={child.id}
      />
      <TimelineView
        events={events}
        childId={child.id}
        childName={child.nickname || child.first_name}
      />
    </PageShell>
  );
}
