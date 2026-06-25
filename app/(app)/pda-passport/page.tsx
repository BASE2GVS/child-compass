import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getReportsData } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { generateReportContent } from "@/lib/services/report-generator";
import ReportLayout from "@/components/reports/ReportLayout";
import PrintButton from "@/components/reports/PrintButton";
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

  const data = await getReportsData(child.id);
  if (!data) redirect("/onboarding");

  const content = generateReportContent(
    "pda_passport",
    data.child,
    data.profile,
    data.checkins,
    data.debriefs,
    data.patterns,
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Passport"
        title="PDA Passport™"
        description="A professional digital booklet — triggers, strategies, emergency contacts, and support needs."
        familyChildren={children}
        activeChildId={child.id}
        actions={
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <PrintButton />
            <Link href={`/reports/view/pda_passport?child=${child.id}`} className={ds.btnSecondary}>
              Full view
            </Link>
          </div>
        }
      />
      <ReportLayout content={content} reportType="pda_passport" />
    </PageShell>
  );
}
