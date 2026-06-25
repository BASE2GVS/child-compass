import { redirect } from "next/navigation";
import { getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import CheckInForm from "@/components/app/CheckInForm";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
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

  return (
    <PageShell>
      <PageHeader
        eyebrow="Daily"
        title="Daily Check-In"
        description="A calm, guided moment — one step at a time. The heart of Child Compass."
        familyChildren={children}
        activeChildId={child.id}
      />
      <CheckInForm childId={child.id} childName={child.nickname || child.first_name} />
    </PageShell>
  );
}
