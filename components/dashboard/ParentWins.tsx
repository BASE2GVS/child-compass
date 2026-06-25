import { buildParentWins } from "@/lib/dashboard/briefing";
import type { DailyCheckin, PatternFinding } from "@/lib/types/database";

type ParentWinsProps = {
  childName: string;
  checkin: DailyCheckin | null;
  weekCheckins: DailyCheckin[];
  patterns: PatternFinding[];
  weeklyTrend: { trend: string; message: string } | null;
};

export default function ParentWins({
  childName,
  checkin,
  weekCheckins,
  patterns,
  weeklyTrend,
}: ParentWinsProps) {
  const wins = buildParentWins(checkin, weekCheckins, patterns, weeklyTrend, childName);

  return (
    <section aria-labelledby="parent-wins-heading">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Parent Wins</p>
      <h2 id="parent-wins-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
        Celebrating your progress
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {wins.map((win, i) => (
          <article
            key={i}
            className="flex items-start gap-3 rounded-[24px] border border-amber-100/80 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className="text-2xl" aria-hidden="true">
              {win.emoji}
            </span>
            <p className="text-sm leading-relaxed text-[#475569]">{win.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
