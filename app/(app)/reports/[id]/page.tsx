import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/queries";
import ReportLayout from "@/components/reports/ReportLayout";
import PrintButton from "@/components/reports/PrintButton";
import { GentleSuccess } from "@/components/first-time";
import { FIRST_REPORT_CELEBRATION } from "@/lib/first-time/copy";
import type { ReportContent } from "@/lib/services/report-generator";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ child?: string; first?: string; example?: string }>;
}) {
  const { id } = await params;
  const { child: childParam, first: firstParam, example: exampleParam } = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) notFound();

  const content = report.content as ReportContent;
  const query = new URLSearchParams();
  if (childParam) query.set("child", childParam);
  if (exampleParam) query.set("example", exampleParam);
  const qs = query.toString() ? `?${query.toString()}` : "";

  return (
    <div className="space-y-6">
      {firstParam === "1" && (
        <GentleSuccess message={FIRST_REPORT_CELEBRATION} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/documents-hub${qs}`} className="text-sm font-semibold text-[var(--cc-teal)] hover:underline">
          ← Back to library
        </Link>
        <PrintButton />
      </div>
      <ReportLayout content={content} reportType={report.report_type} />
    </div>
  );
}
