import { redirect } from "next/navigation";
import { getDebriefs, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import DebriefChat from "@/components/debrief/DebriefChat";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function DebriefPage({
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

  const history = await getDebriefs(child.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="AI · Flagship"
        title="Parent Debrief™"
        description={`Describe what happened. Receive calm, personalised guidance for ${child.nickname || child.first_name}.`}
        familyChildren={children}
        activeChildId={child.id}
      />
      <DebriefChat
        childId={child.id}
        childName={child.nickname || child.first_name}
        history={history}
      />
    </PageShell>
  );
}
