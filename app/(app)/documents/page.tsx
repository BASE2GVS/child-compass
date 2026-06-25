import { redirect } from "next/navigation";
import { getDocuments, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import DocumentCentre from "@/components/profile/DocumentCentre";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { family, children } = await getFamilyContext();
  if (!family) redirect("/onboarding");

  const child = await resolveActiveChild(children, params);
  const documents = await getDocuments(child?.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Documents"
        title="Document Centre"
        description="Securely store medical reports, assessments, and school documents — search, filter, and organise."
        familyChildren={children.length > 1 ? children : undefined}
        activeChildId={child?.id}
      />
      <DocumentCentre
        documents={documents}
        familyId={family.id}
        childId={child?.id}
        childName={child?.nickname || child?.first_name}
      />
    </PageShell>
  );
}
