import { redirect } from "next/navigation";
import Link from "next/link";
import { getFamilyContext, getProfile, getReportsData, getCompanionInsights } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { generateReportContent } from "@/lib/services/report-generator";
import { isSmartDocumentType, loadDocumentInput } from "@/lib/documents";
import EditableReportDocument from "@/components/reports/EditableReportDocument";
import ReportLayout from "@/components/reports/ReportLayout";
import PrintButton from "@/components/reports/PrintButton";
import type { ReportType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const VALID_TYPES: ReportType[] = [
  "parent_debrief",
  "teacher_guide",
  "pda_passport",
  "school_support",
  "weekly_summary",
  "monthly_progress",
  "therapist_summary",
  "review_30d",
  "review_90d",
  "review_6mo",
  "review_annual",
];

export default async function ReportPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ child?: string }>;
}) {
  const { type } = await params;
  const { child: childParam } = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  if (!VALID_TYPES.includes(type as ReportType)) redirect("/reports");

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, { child: childParam });
  if (!child) redirect("/onboarding");

  const [data, companionInsights, documentInput] = await Promise.all([
    getReportsData(child.id),
    getCompanionInsights(child.id),
    isSmartDocumentType(type) ? loadDocumentInput(child.id) : Promise.resolve(null),
  ]);
  if (!data) redirect("/reports");

  const content = generateReportContent(
    type as ReportType,
    data.child,
    data.profile,
    data.checkins,
    data.debriefs,
    data.patterns,
    companionInsights,
    documentInput,
  );

  const qs = `?child=${child.id}`;
  const isSmartDoc = isSmartDocumentType(type);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/documents-hub${qs}`} className="text-sm font-semibold text-[var(--cc-teal)] hover:underline">
          ← Back to library
        </Link>
        {!isSmartDoc && <PrintButton />}
      </div>
      {isSmartDoc ? (
        <EditableReportDocument
          initialContent={content}
          reportType={type as ReportType}
          childId={child.id}
        />
      ) : (
        <ReportLayout content={content} reportType={type} />
      )}
    </div>
  );
}
