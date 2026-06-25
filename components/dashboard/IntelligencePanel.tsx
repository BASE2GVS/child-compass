import IntelligenceInsightCard from "@/components/dashboard/IntelligenceInsightCard";
import { buildIntelligenceItems } from "@/lib/dashboard/briefing";
import { aiCopy } from "@/lib/presentation/copy";
import type { DailyCheckin, PatternFinding } from "@/lib/types/database";

type IntelligencePanelProps = {
  childName: string;
  checkin: DailyCheckin | null;
  weeklyTrendMessage: string | null;
  recommendation: string | null;
  patterns: PatternFinding[];
  weekCheckins?: DailyCheckin[];
};

export default function IntelligencePanel({
  childName,
  checkin,
  weeklyTrendMessage,
  recommendation,
  patterns,
  weekCheckins = [],
}: IntelligencePanelProps) {
  const items = buildIntelligenceItems(
    childName,
    checkin,
    weeklyTrendMessage,
    recommendation,
    patterns,
    weekCheckins,
  );

  return (
    <section aria-labelledby="intelligence-heading" className="animate-fade-in">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
          Today&apos;s Intelligence
        </p>
        <h2 id="intelligence-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
          {aiCopy.intelligenceHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          {aiCopy.intelligenceSub.replace("your family's", `${childName}'s`)}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item, i) => (
          <div key={item.title} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <IntelligenceInsightCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
