import Link from "next/link";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import ExperienceHero from "@/components/experience/ExperienceHero";
import { EmptyState, GlassCard, MetricCard } from "@/components/design-system";
import type { Child, DailyCheckin } from "@/lib/types/database";

type AnalyticsExperienceProps = {
  child: Child;
  familyChildren: Child[];
  checkins: DailyCheckin[];
};

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export default function AnalyticsExperience({ child, familyChildren, checkins }: AnalyticsExperienceProps) {
  const childName = child.nickname || child.first_name;

  if (checkins.length === 0) {
    return (
      <DashboardBackground>
        <div className="mx-auto max-w-6xl space-y-10 pb-8">
          <ExperienceHero
            variant="trends"
            eyebrow="📈 Gentle patterns"
            title="Trends"
            description={`As you check in for ${childName}, calm patterns will appear here — just understanding, no scoreboards.`}
            familyChildren={familyChildren}
            activeChildId={child.id}
          />
          <EmptyState
            illustration="compass"
            title="Patterns will appear in time"
            description="There's no rush. When you're ready, check-ins help you notice what supports your child."
            actionLabel="Check in when you're ready"
            actionHref={`/check-in?child=${child.id}`}
          />
        </div>
      </DashboardBackground>
    );
  }

  const metrics = [
    { label: "Sleep", value: avg(checkins.map((c) => c.sleep_quality ?? 3)), emoji: "🌙" },
    { label: "Mood", value: avg(checkins.map((c) => c.mood ?? 3)), emoji: "💛" },
    { label: "Calm", value: 6 - avg(checkins.map((c) => c.anxiety ?? 3)), emoji: "🕊️" },
    { label: "School", value: avg(checkins.map((c) => c.school_rating ?? 3)), emoji: "🏫" },
    { label: "Energy", value: avg(checkins.map((c) => c.energy ?? 3)), emoji: "⚡" },
    { label: "Demands", value: avg(checkins.map((c) => c.demand_tolerance ?? 3)), emoji: "🌿" },
  ];

  return (
    <DashboardBackground>
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        <ExperienceHero
          variant="trends"
          eyebrow="📈 Gentle patterns"
          title="Trends"
          description={`What we're noticing about ${childName} — drawn from your family's check-ins, with warmth not numbers.`}
          familyChildren={familyChildren}
          activeChildId={child.id}
        />

        <GlassCard padding="sm">
          <p className="text-sm text-[var(--cc-ink-muted)]">
            Based on {checkins.length} check-in{checkins.length === 1 ? "" : "s"} over the last 30 days. These are
            gentle signals — not diagnoses.
          </p>
        </GlassCard>

        <div className="grid gap-5 sm:grid-cols-2">
          {metrics.map((metric, i) => (
            <div key={metric.label} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <MetricCard
                label={`${metric.emoji} ${metric.label}`}
                value={`${metric.value.toFixed(1)} / 5`}
                hint="A soft average — trends matter more than any single day"
              />
            </div>
          ))}
        </div>

        <GlassCard padding="sm" className="text-center">
          <Link href={`/today?child=${child.id}`} className="text-sm font-semibold text-[var(--cc-teal-deep)] hover:underline">
            Return to Today →
          </Link>
        </GlassCard>
      </div>
    </DashboardBackground>
  );
}
