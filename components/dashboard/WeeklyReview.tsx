import { buildWeeklyLearnings } from "@/lib/dashboard/briefing";
import type { DailyCheckin, PatternFinding } from "@/lib/types/database";

type WeeklyReviewProps = {
  childName: string;
  patterns: PatternFinding[];
  weeklyTrend: { trend: string; message: string } | null;
  weekCheckins: DailyCheckin[];
};

export default function WeeklyReview({
  childName,
  patterns,
  weeklyTrend,
  weekCheckins,
}: WeeklyReviewProps) {
  const learnings = buildWeeklyLearnings(childName, patterns, weeklyTrend, weekCheckins);

  return (
    <section
      className="rounded-[32px] border border-white/60 bg-gradient-to-br from-white to-[#14B8A6]/[0.04] p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
      aria-labelledby="weekly-review-heading"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
        Weekly AI Review
      </p>
      <h2 id="weekly-review-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
        This Week Child Compass Learned
      </h2>
      <p className="mt-2 text-sm text-[#64748B]">
        Trends and patterns from {childName}&apos;s recent journey — celebrating progress along the way.
      </p>
      <ul className="mt-8 space-y-4">
        {learnings.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm"
          >
            <span className="mt-0.5 text-lg" aria-hidden="true">
              {item.positive ? "✨" : "💡"}
            </span>
            <p className="text-sm leading-relaxed text-[#475569]">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
