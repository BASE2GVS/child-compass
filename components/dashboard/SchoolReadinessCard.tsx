import {
  schoolReadinessScore,
  schoolReadinessExplanation,
} from "@/lib/dashboard/briefing";
import type { ChildIntelligenceSnapshot, DailyCheckin } from "@/lib/types/database";

type SchoolReadinessCardProps = {
  childName: string;
  checkin: DailyCheckin | null;
  intelligence: ChildIntelligenceSnapshot;
};

export default function SchoolReadinessCard({
  childName,
  checkin,
  intelligence,
}: SchoolReadinessCardProps) {
  const score = schoolReadinessScore(checkin, intelligence);
  const { explanation, confidenceLabel } = schoolReadinessExplanation(
    checkin,
    intelligence,
    childName,
  );

  const radius = 56;
  const size = 128;
  const centre = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colour = score >= 75 ? "#14B8A6" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <section
      className="rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.06)] backdrop-blur-sm"
      aria-labelledby="school-readiness-heading"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
        School Readiness
      </p>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="relative shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 motion-reduce:rotate-0"
            role="img"
            aria-label={`School readiness ${score} percent`}
          >
            <circle cx={centre} cy={centre} r={radius} stroke="#F1EDE6" strokeWidth="10" fill="none" />
            <circle
              cx={centre}
              cy={centre}
              r={radius}
              stroke={colour}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out motion-reduce:transition-none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-[#0F172A]">{score}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {confidenceLabel}
            </span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h2 id="school-readiness-heading" className="text-xl font-bold text-[#0F172A]">
            How school may feel today
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-[#64748B]">{explanation}</p>
        </div>
      </div>
    </section>
  );
}
