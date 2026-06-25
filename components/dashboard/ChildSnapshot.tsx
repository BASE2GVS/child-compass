import ProgressMetric from "@/components/dashboard/ProgressMetric";
import type { ChildIntelligenceSnapshot } from "@/lib/types/database";

type ChildSnapshotProps = {
  childName: string;
  intelligence: ChildIntelligenceSnapshot;
  lastUpdated: string | null;
  aiConfidence: number;
};

export default function ChildSnapshot({
  childName,
  intelligence,
  lastUpdated,
  aiConfidence,
}: ChildSnapshotProps) {
  const routineStability = Math.round(
    (intelligence.demandTolerance + intelligence.recoveryTrend) / 2,
  );
  const communication = Math.round(
    (intelligence.emotionalState + intelligence.confidenceLevel) / 2,
  );
  const learningReadiness = Math.round(
    (intelligence.demandTolerance + intelligence.sleepQuality + intelligence.socialBattery) / 3,
  );

  const formattedUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Awaiting first check-in";

  const confidencePct = Math.round(aiConfidence * 100);

  return (
    <section
      className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
      aria-labelledby="child-snapshot-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
            Child Snapshot
          </p>
          <h2 id="child-snapshot-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
            Today&apos;s picture of {childName}
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-[#FAF8F4] px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Last updated</p>
            <p className="text-sm font-semibold text-[#0F172A]">{formattedUpdated}</p>
          </div>
          <div className="rounded-2xl bg-[#FAF8F4] px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">AI confidence</p>
            <p className="text-sm font-semibold text-[#14B8A6]">{confidencePct}%</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <ProgressMetric label="Emotional Energy" value={intelligence.energy} colour="#14B8A6" delay={0} />
        <ProgressMetric label="Sensory Load" value={intelligence.sensoryLoad} colour="#6366F1" delay={80} />
        <ProgressMetric label="Routine Stability" value={routineStability} colour="#F59E0B" delay={160} />
        <ProgressMetric label="Communication" value={communication} colour="#0F172A" delay={240} />
        <ProgressMetric label="Social Battery" value={intelligence.socialBattery} colour="#EC4899" delay={320} />
        <ProgressMetric label="Learning Readiness" value={learningReadiness} colour="#14B8A6" delay={400} />
      </div>
    </section>
  );
}
