import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getReportsData, getCompanionInsights } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { generateReportContent } from "@/lib/services/report-generator";
import { loadDocumentInput } from "@/lib/documents";
import EditableReportDocument from "@/components/reports/EditableReportDocument";
import { PageHeader, PageShell, ds } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function PDAPassportPage({
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

  const [data, companionInsights, documentInput] = await Promise.all([
    getReportsData(child.id),
    getCompanionInsights(child.id),
    loadDocumentInput(child.id),
  ]);
  if (!data) redirect("/onboarding");

  const content = generateReportContent(
    "pda_passport",
    data.child,
    data.profile,
    data.checkins,
    data.debriefs,
    data.patterns,
    companionInsights,
    documentInput,
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Passport"
        title="Child Passport"
        description="Prepared from your family's profile — edit anything before sharing."
        familyChildren={children}
        activeChildId={child.id}
        actions={
          <Link href={`/documents-hub?child=${child.id}`} className={ds.btnSecondary}>
            ← Library
          </Link>
        }
      />
      <EditableReportDocument
        initialContent={content}
        reportType="pda_passport"
        childId={child.id}
      />
    </PageShell>
  );
}
