import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/queries";
import ReportLayout from "@/components/reports/ReportLayout";
import PrintButton from "@/components/reports/PrintButton";
import type { ReportContent } from "@/lib/services/report-generator";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ child?: string }>;
}) {
  const { id } = await params;
  const { child: childParam } = await searchParams;
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
  const qs = childParam ? `?child=${childParam}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/reports${qs}`} className="text-sm font-semibold text-[#14B8A6] hover:underline">
          ← Back to reports
        </Link>
        <PrintButton />
      </div>
      <ReportLayout content={content} reportType={report.report_type} />
    </div>
  );
}
