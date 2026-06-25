import { redirect } from "next/navigation";
import { getCoachSession, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import CoachChat from "@/components/coach/CoachChat";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function CoachPage({
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

  const { session, messages } = await getCoachSession(child.id);
  if (!session) redirect("/dashboard");

  return (
    <PageShell>
      <PageHeader
        eyebrow="AI"
        title="Ask Child Compass™"
        description={`Your persistent AI companion — practical coaching for ${child.nickname || child.first_name}.`}
        familyChildren={children}
        activeChildId={child.id}
      />
      <CoachChat
        childId={child.id}
        childName={child.nickname || child.first_name}
        sessionId={session.id}
        history={messages}
      />
    </PageShell>
  );
}
