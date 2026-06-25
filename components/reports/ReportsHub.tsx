"use client";

import { useState, useTransition } from "react";
import { generateReport } from "@/lib/actions/reports";
import { actionCopy, aiCopy } from "@/lib/presentation/copy";
import type { ReportType } from "@/lib/types/database";
import {
  Banner,
  ReportCard,
  SectionHeader,
  SkeletonReport,
} from "@/components/design-system";

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: "weekly_summary", label: "Weekly Summary™", description: "Highlights, challenges, and regulation trends from the past week" },
  { type: "monthly_progress", label: "Monthly Progress™", description: "A gentle month-at-a-glance — mood, anxiety, and progress" },
  { type: "parent_debrief", label: "Parent Debrief™ Summary", description: "Recent situations and calm, practical approaches" },
  { type: "teacher_guide", label: "Teacher Guide™", description: "Classroom strategies tailored to your child" },
  { type: "pda_passport", label: "PDA Passport™", description: "A shareable profile for teachers and carers" },
  { type: "school_support", label: "School Support Summary™", description: "Adjustments and patterns that affect school" },
  { type: "therapist_summary", label: "Therapist Summary™", description: "Session-ready observations, trends, and discussion questions" },
  { type: "review_30d", label: "30-Day Review™", description: "Progress and patterns from the past month" },
  { type: "review_90d", label: "90-Day Review™", description: "Quarterly longitudinal insight" },
  { type: "review_6mo", label: "6-Month Review™", description: "Half-year progress and helpful strategies" },
  { type: "review_annual", label: "Annual Review™", description: "A full year compared only with your child's own history" },
];

export default function ReportsHub({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleGenerate(type: ReportType) {
    setGenerating(type);
    setError(null);
    startTransition(async () => {
      const result = await generateReport(childId, type);
      if (result?.error) {
        setError(result.error);
        setGenerating(null);
        return;
      }
      if (result?.report) {
        window.location.href = `/reports/${result.report.id}?child=${childId}`;
      }
    });
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Documents"
        title="Report centre"
        description={`Beautiful, shareable reports for ${childName} — preview, print, or save as PDF.`}
      />

      {error && (
        <Banner variant="warning">
          We couldn&apos;t prepare that report just now. Please try again in a moment.
        </Banner>
      )}

      {pending && generating && (
        <div className="grid gap-6 sm:grid-cols-2">
          <SkeletonReport />
          <SkeletonReport />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {REPORT_TYPES.map((report) => (
          <ReportCard
            key={report.type}
            title={report.label}
            summary={report.description}
            href={`/reports/view/${report.type}?child=${childId}`}
            actions={
              <button
                type="button"
                disabled={pending}
                onClick={() => handleGenerate(report.type)}
                className="rounded-xl border border-[#E8E4DC] bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-[#FAF8F4] disabled:opacity-50"
              >
                {generating === report.type ? aiCopy.reportCreating : actionCopy.createReport}
              </button>
            }
          />
        ))}
      </div>

      <p className="text-center text-xs text-[#94A3B8]">
        Tip: use Print (Ctrl+P) on any report to save as PDF · Reports for {childName}
      </p>
    </div>
  );
}
