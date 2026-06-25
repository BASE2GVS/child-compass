import { redirect } from "next/navigation";
import { getCheckins, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { EmptyState, MetricCard, PageHeader, PageShell, ProgressBar } from "@/components/design-system";

export const dynamic = "force-dynamic";

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");
  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const checkins = await getCheckins(child.id, 30);
  const childName = child.nickname || child.first_name;

  if (checkins.length === 0) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Insights"
          title="Analytics"
          description="Gentle trends from your check-ins — sleep, mood, school, and regulation."
          familyChildren={children}
          activeChildId={child.id}
        />
        <EmptyState
          illustration="compass"
          title="Patterns will appear here"
          description={`As you complete check-ins for ${childName}, Child Compass will show calm trends over time.`}
          why="Analytics help you notice what supports your child — without overwhelming numbers."
          actionLabel="Start today's check-in"
          actionHref={`/check-in?child=${child.id}`}
          secondaryActionLabel="View dashboard"
          secondaryActionHref={`/dashboard?child=${child.id}`}
        />
      </PageShell>
    );
  }

  const metrics = [
    { label: "Sleep", value: avg(checkins.map((c) => c.sleep_quality ?? 3)) },
    { label: "Mood", value: avg(checkins.map((c) => c.mood ?? 3)) },
    { label: "Anxiety (calmer is higher)", value: 6 - avg(checkins.map((c) => c.anxiety ?? 3)) },
    { label: "School", value: avg(checkins.map((c) => c.school_rating ?? 3)) },
    { label: "Energy", value: avg(checkins.map((c) => c.energy ?? 3)) },
    { label: "Demand tolerance", value: avg(checkins.map((c) => c.demand_tolerance ?? 3)) },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description={`Gentle trends for ${childName} — drawn from your family's check-ins.`}
        familyChildren={children}
        activeChildId={child.id}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, i) => (
          <div key={metric.label} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <MetricCard
              label={metric.label}
              value={`${metric.value.toFixed(1)} / 5`}
              hint={`From ${checkins.length} check-in${checkins.length === 1 ? "" : "s"}`}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric, i) => (
          <ProgressBar
            key={`bar-${metric.label}`}
            label={metric.label}
            value={Math.round((metric.value / 5) * 100)}
            delay={i * 100}
          />
        ))}
      </div>
    </PageShell>
  );
}
