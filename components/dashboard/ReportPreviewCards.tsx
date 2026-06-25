"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateReport } from "@/lib/actions/reports";
import { actionCopy, aiCopy } from "@/lib/presentation/copy";
import type { GeneratedReport, ReportType } from "@/lib/types/database";
import { Banner } from "@/components/design-system";

const PREVIEW_TYPES: { type: ReportType; label: string; summary: string }[] = [
  {
    type: "weekly_summary",
    label: "Weekly Summary™",
    summary: "Highlights, challenges, and regulation trends from the past week.",
  },
  {
    type: "teacher_guide",
    label: "Teacher Guide™",
    summary: "Classroom strategies and communication tips for school staff.",
  },
  {
    type: "pda_passport",
    label: "PDA Passport™",
    summary: "A shareable profile explaining your child's needs and preferences.",
  },
];

function reportSummary(report: GeneratedReport): string {
  const content = report.content as { headline?: string; highlights?: string[] };
  if (content.headline) return content.headline;
  if (content.highlights?.length) return content.highlights[0];
  return "A personalised report drawn from your family's journey.";
}

export default function ReportPreviewCards({
  childId,
  childName,
  reports,
}: {
  childId: string;
  childName: string;
  reports: GeneratedReport[];
}) {
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRegenerate(type: ReportType) {
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
    <section aria-labelledby="report-preview-heading" className="animate-fade-in">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Reports</p>
      <h2 id="report-preview-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
        Your child&apos;s reports
      </h2>
      <p className="mt-2 text-sm text-[#64748B]">
        Reports for {childName} — preview, print, or create a fresh copy anytime.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PREVIEW_TYPES.map((preview) => {
          const latest = reports.find((r) => r.report_type === preview.type);
          return (
            <article
              key={preview.type}
              className="flex flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="h-28 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B8A6]">
                  {preview.label}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-white/90">
                  {latest ? reportSummary(latest) : preview.summary}
                </p>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-[#0F172A]">{preview.label}</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748B]">
                  {latest
                    ? `Last prepared ${new Date(latest.created_at).toLocaleDateString("en-GB")}`
                    : "Not created yet — your first report is one tap away"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {latest ? (
                    <>
                      <Link
                        href={`/reports/${latest.id}?child=${childId}`}
                        className="rounded-xl bg-[#14B8A6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D9488]"
                      >
                        {actionCopy.previewReport}
                      </Link>
                      <Link
                        href={`/reports/${latest.id}?child=${childId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-[#E8E4DC] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FAF8F4]"
                      >
                        {actionCopy.exportPdf}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/reports/view/${preview.type}?child=${childId}`}
                      className="rounded-xl bg-[#14B8A6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D9488]"
                    >
                      {actionCopy.previewReport}
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRegenerate(preview.type)}
                    className="rounded-xl border border-[#E8E4DC] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FAF8F4] disabled:opacity-50"
                  >
                    {generating === preview.type ? aiCopy.reportCreating : actionCopy.createReport}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {error && (
        <div className="mt-4">
          <Banner variant="warning">
            We couldn&apos;t prepare that report just now. Please try again.
          </Banner>
        </div>
      )}
    </section>
  );
}
