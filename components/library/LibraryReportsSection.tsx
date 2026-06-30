"use client";



import { useState, useTransition } from "react";

import { generateReport } from "@/lib/actions/reports";

import { aiCopy } from "@/lib/presentation/copy";

import { CompanionExpandable } from "@/components/companion";

import {

  LIBRARY_REPORTS,

  relativeUpdated,

  type LibraryReportMeta,

} from "@/components/library/library-reports";

import type { GeneratedReport, ReportType } from "@/lib/types/database";

import { Banner } from "@/components/design-system";

import { FrameworkButton, FrameworkButtonLink, SecondaryCard } from "@/components/framework";



type LibraryReportsSectionProps = {

  childId: string;

  exampleFamilyId?: string | null;

  generatedReports: GeneratedReport[];

  childName: string;

  isEmpty: boolean;

};

const PROFESSIONAL_PREVIEWS: Array<{ label: string; path: string }> = [
  { label: "Occupational Therapist Summary™", path: "occupational_therapist" },
  { label: "Speech Therapist Summary™", path: "speech_therapist" },
  { label: "Psychologist Summary™", path: "psychologist" },
  { label: "Pediatrician Summary™", path: "pediatrician" },
];



function featuredMeta(reports: GeneratedReport[]): LibraryReportMeta {

  const latest = reports[0];

  if (latest) {

    const meta = LIBRARY_REPORTS.find((r) => r.type === latest.report_type);

    if (meta) return meta;

  }

  return LIBRARY_REPORTS.find((r) => r.type === "teacher_guide")!;

}



function lastForType(reports: GeneratedReport[], type: ReportType): GeneratedReport | null {

  return reports.find((r) => r.report_type === type) ?? null;

}



export default function LibraryReportsSection({

  childId,

  exampleFamilyId,

  generatedReports,

  childName,

  isEmpty,

}: LibraryReportsSectionProps) {

  const [pending, startTransition] = useTransition();

  const [generating, setGenerating] = useState<ReportType | null>(null);

  const [error, setError] = useState<string | null>(null);

  const query = exampleFamilyId ? `?child=${childId}&example=${exampleFamilyId}` : `?child=${childId}`;



  const sorted = [...generatedReports].sort(

    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),

  );

  const featured = featuredMeta(sorted);

  const featuredLatest = lastForType(sorted, featured.type);

  const featuredUpdated = relativeUpdated(featuredLatest?.created_at ?? null);



  function handleShare(type: ReportType) {

    setGenerating(type);

    setError(null);

    startTransition(async () => {
      try {
        const result = await generateReport(childId, type);
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (result?.report) {
          const isFirst = sorted.length === 0;
          window.location.href = `/reports/${result.report.id}${query}${isFirst ? "&first=1" : ""}`;
          return;
        }
        setError("We couldn't prepare that summary just now. Please try again.");
      } catch {
        setError("We couldn't prepare that summary just now. Please try again.");
      } finally {
        setGenerating(null);
      }
    });
  }



  if (isEmpty) {

    return (

      <div className="space-y-4">

        <p className="text-lg font-medium text-[var(--cc-ink)]">We&apos;re just getting started.</p>

        <p className="text-base leading-relaxed text-[var(--cc-ink-muted)]">

          After a few check-ins, summaries for teachers and therapists will appear here for {childName}.

        </p>

        <FrameworkButtonLink href={`/check-in${query}&first=1`} variant="pill">

          Start today&apos;s check-in

        </FrameworkButtonLink>

      </div>

    );

  }



  return (

    <div id="featured-summary" className="space-y-8">

      {error && (

        <Banner variant="warning">

          We couldn&apos;t prepare that summary just now. Please try again in a moment.

        </Banner>

      )}



      <SecondaryCard padding="lg" className={`overflow-hidden !p-0 bg-gradient-to-br ${featured.tint}`}>

        <div className="space-y-3 p-8 sm:p-10">

          <h2 className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">

            {featured.label}

          </h2>

          {featuredUpdated && (

            <p className="text-sm text-[var(--cc-ink-muted)]">{featuredUpdated}</p>

          )}

          <FrameworkButton

            type="button"

            variant="pill"

            disabled={pending}

            onClick={() => handleShare(featured.type)}

          >

            {generating === featured.type ? aiCopy.reportCreating : "Share"}

          </FrameworkButton>

        </div>

      </SecondaryCard>



      <CompanionExpandable label="Other summaries">

        <ul className="mt-4 divide-y divide-[var(--cc-border-soft)]/60">

          {LIBRARY_REPORTS.map((report) => {

            const latest = lastForType(sorted, report.type);

            const updated = relativeUpdated(latest?.created_at ?? null);

            const href = latest

              ? `/reports/${latest.id}${query}`

              : `/reports/view/${report.type}${query}`;



            return (

              <li key={report.type} className="flex flex-wrap items-center justify-between gap-3 py-4">

                <div>

                  <p className="font-medium text-[var(--cc-ink)]">{report.label}</p>

                  {updated && <p className="text-xs text-[var(--cc-ink-faint)]">{updated}</p>}

                </div>

                <div className="flex gap-2">

                  <FrameworkButton

                    type="button"

                    variant="secondary"

                    disabled={pending}

                    onClick={() => handleShare(report.type)}

                  >

                    {generating === report.type ? "Preparing…" : "Share"}

                  </FrameworkButton>

                  <FrameworkButtonLink href={href} variant="secondary">

                    View

                  </FrameworkButtonLink>

                </div>

              </li>

            );

          })}

        </ul>

      </CompanionExpandable>

      <CompanionExpandable label="Professional previews">

        <ul className="mt-4 divide-y divide-[var(--cc-border-soft)]/60">

          {PROFESSIONAL_PREVIEWS.map((item) => (

            <li key={item.path} className="flex flex-wrap items-center justify-between gap-3 py-4">

              <div>

                <p className="font-medium text-[var(--cc-ink)]">{item.label}</p>

                <p className="text-xs text-[var(--cc-ink-faint)]">Preview from recorded journey facts</p>

              </div>

              <FrameworkButtonLink href={`/reports/view/${item.path}${query}`} variant="secondary">

                View

              </FrameworkButtonLink>

            </li>

          ))}

        </ul>

      </CompanionExpandable>

    </div>

  );

}


