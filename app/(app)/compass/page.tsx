import { redirect } from "next/navigation";
import { getFamilyContext, getProfile, getChildIntelligence, getCheckins } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import GaugeCard from "@/components/dashboard/GaugeCard";
import { GlassCard, PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function CompassPage({
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

  const [snapshot, checkins] = await Promise.all([
    getChildIntelligence(child.id),
    getCheckins(child.id, 14),
  ]);

  const cards = [
    { label: "Current Regulation", value: snapshot.currentRegulation, delta: snapshot.weeklyDelta },
    { label: "Emotional State", value: snapshot.emotionalState },
    { label: "Sensory Load", value: snapshot.sensoryLoad },
    { label: "Demand Tolerance", value: snapshot.demandTolerance },
    { label: "Energy", value: snapshot.energy },
    { label: "Sleep Quality", value: snapshot.sleepQuality },
    { label: "Social Battery", value: snapshot.socialBattery },
    { label: "Confidence Level", value: snapshot.confidenceLevel },
    { label: "Recovery Trend", value: snapshot.recoveryTrend },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Intelligence"
        title="Child Compass™"
        description={`Living intelligence profile for ${child.nickname || child.first_name} — regulation, sensory load, and recovery trends.`}
        familyChildren={children}
        activeChildId={child.id}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <GaugeCard key={card.label} label={card.label} value={card.value} delta={card.delta} />
        ))}
      </div>

      <GlassCard padding="lg">
        <h2 className="text-xl font-bold text-[#0F172A]">Weekly comparison</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
          {snapshot.weeklyDelta >= 0
            ? `Regulation is up ${snapshot.weeklyDelta}% compared with last week.`
            : `Regulation is down ${Math.abs(snapshot.weeklyDelta)}% this week. Consider reducing demand load and increasing recovery time.`}
        </p>
        <p className="mt-2 text-xs text-[#94A3B8]">{checkins.length} check-ins analysed</p>
      </GlassCard>
    </PageShell>
  );
}
