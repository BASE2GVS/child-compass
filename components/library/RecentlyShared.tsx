import { audienceForReportType, relativeUpdated } from "@/components/library/library-reports";
import type { GeneratedReport } from "@/lib/types/database";

type RecentlySharedProps = {
  reports: GeneratedReport[];
};

export default function RecentlyShared({ reports }: RecentlySharedProps) {
  const recent = [...reports]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recently-shared-heading">
      <h2
        id="recently-shared-heading"
        className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl"
      >
        Recently shared
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">Summaries you&apos;ve created for your support team.</p>

      <div className="relative mt-8 space-y-4 pl-2">
        <div
          className="absolute bottom-2 left-[1.1rem] top-2 w-0.5 bg-gradient-to-b from-[var(--cc-teal-wash)] to-transparent"
          aria-hidden
        />
        {recent.map((report) => {
          const when = relativeUpdated(report.created_at);
          const audience = audienceForReportType(report.report_type);

          return (
            <article
              key={report.id}
              className="relative ml-10 rounded-[1.25rem] border border-white/58 bg-white/54 px-5 py-4 shadow-[0_6px_18px_rgba(45,42,38,0.07)] backdrop-blur-sm"
            >
              <div
                className="absolute -left-10 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cc-teal-wash)] text-sm"
                aria-hidden
              >
                ✨
              </div>
              <p className="font-medium text-[var(--cc-ink)]">{report.title}</p>
              <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">
                Shared with {audience}
                {when && <span className="text-[var(--cc-ink-faint)]"> · {when.replace("Updated ", "")}</span>}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
