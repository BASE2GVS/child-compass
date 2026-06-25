import { dailyEncouragement } from "@/lib/dashboard/briefing";
import type { JourneyPhase } from "@/lib/intelligence/journey";

export default function EncouragementCard({ journeyPhase }: { journeyPhase?: JourneyPhase | null }) {
  const message = journeyPhase?.message || dailyEncouragement();

  return (
    <aside
      className="rounded-[28px] border border-[#14B8A6]/15 bg-gradient-to-r from-[#14B8A6]/[0.08] to-white/80 px-8 py-6 shadow-[0_8px_24px_rgba(20,184,166,0.08)] backdrop-blur-sm"
      aria-label="Daily encouragement"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
        {journeyPhase ? journeyPhase.title : "Daily Encouragement"}
      </p>
      <blockquote className="mt-3 text-lg font-medium leading-relaxed text-[#0F172A]">
        &ldquo;{message}&rdquo;
      </blockquote>
      {journeyPhase?.focus && (
        <p className="mt-3 text-sm text-[#64748B]">Focus: {journeyPhase.focus}</p>
      )}
    </aside>
  );
}