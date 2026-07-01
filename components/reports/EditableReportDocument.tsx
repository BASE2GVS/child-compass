"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateReportWithContent } from "@/lib/actions/reports";
import ReportLayout from "@/components/reports/ReportLayout";
import { Banner } from "@/components/design-system";
import { FrameworkButton } from "@/components/framework";
import type { ReportContent } from "@/lib/services/report-generator";
import type { ReportType } from "@/lib/types/database";

type EditableSection = {
  title: string;
  body: string;
};

function toEditableSections(content: ReportContent): EditableSection[] {
  return content.sections.map((section) => ({
    title: section.title,
    body: Array.isArray(section.body) ? section.body.join("\n") : section.body,
  }));
}

function toReportContent(base: ReportContent, sections: EditableSection[]): ReportContent {
  return {
    ...base,
    sections: sections.map((section) => {
      const lines = section.body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return {
        title: section.title,
        body: lines.length <= 1 ? lines[0] ?? "" : lines,
      };
    }),
  };
}

type EditableReportDocumentProps = {
  initialContent: ReportContent;
  reportType: ReportType;
  childId: string;
  showShare?: boolean;
};

export default function EditableReportDocument({
  initialContent,
  reportType,
  childId,
  showShare = true,
}: EditableReportDocumentProps) {
  const router = useRouter();
  const [sections, setSections] = useState(() => toEditableSections(initialContent));
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateSection(index: number, body: string) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, body } : s)));
  }

  function applyEdits() {
    setPreviewContent(toReportContent(initialContent, sections));
    setIsEditing(false);
  }

  function handleShare() {
    setError(null);
    const content = toReportContent(initialContent, sections);
    startTransition(async () => {
      const result = await generateReportWithContent(childId, reportType, content);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.report) {
        router.push(`/reports/${result.report.id}?child=${childId}`);
      }
    });
  }

  return (
    <div className="space-y-6 print:hidden">
      {error && <Banner variant="warning">{error}</Banner>}

      <div className="flex flex-wrap gap-3">
        {isEditing ? (
          <>
            <FrameworkButton type="button" variant="pill" onClick={applyEdits}>
              Preview
            </FrameworkButton>
            {showShare && (
              <FrameworkButton type="button" variant="secondary" disabled={isPending} onClick={handleShare}>
                {isPending ? "Preparing…" : "Share summary"}
              </FrameworkButton>
            )}
          </>
        ) : (
          <FrameworkButton type="button" variant="secondary" onClick={() => setIsEditing(true)}>
            Edit sections
          </FrameworkButton>
        )}
      </div>

      {isEditing ? (
        <div className="mx-auto max-w-3xl space-y-8 rounded-[1.25rem] border border-white/58 bg-white/56 p-6 shadow-[0_8px_24px_rgba(45,42,38,0.07)] backdrop-blur-xl sm:p-8">
          <p className="text-sm text-[var(--cc-ink-muted)]">
            Prepared from your family&apos;s profile, check-ins, and notes. Edit anything before sharing — you own the
            final document.
          </p>
          {sections.map((section, index) => (
            <div key={section.title}>
              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[var(--cc-teal)]">
                {section.title}
              </label>
              <textarea
                value={section.body}
                onChange={(e) => updateSection(index, e.target.value)}
                rows={Math.max(3, section.body.split("\n").length + 1)}
                className="w-full rounded-xl border border-white/66 bg-white/78 px-4 py-3 text-sm leading-relaxed text-[var(--cc-ink)] backdrop-blur-sm focus:border-[var(--cc-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cc-teal)]/20"
              />
            </div>
          ))}
        </div>
      ) : (
        <ReportLayout content={previewContent} reportType={reportType} />
      )}
    </div>
  );
}
