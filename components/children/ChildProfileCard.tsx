import Link from "next/link";
import type { Child } from "@/lib/types/database";
import { GlassCard, ProgressRing, StatusBadge, ds } from "@/components/design-system";

type ChildProfileCardProps = {
  child: Child;
  moodEmoji: string;
  moodLabel: string;
  aiSummary: string;
  schoolReadiness: number;
  todayRecommendation: string;
  hasCheckin: boolean;
};

export default function ChildProfileCard({
  child,
  moodEmoji,
  moodLabel,
  aiSummary,
  schoolReadiness,
  todayRecommendation,
  hasCheckin,
}: ChildProfileCardProps) {
  const displayName = child.nickname || child.first_name;

  return (
    <Link href={`/children/${child.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 rounded-[32px]">
      <GlassCard className={`${ds.hoverLift} h-full`}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#14B8A6]/20 to-indigo-100/60 text-2xl font-bold text-[#14B8A6] shadow-inner">
              {child.first_name.charAt(0)}
            </div>
            <span
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-lg shadow-sm"
              aria-hidden="true"
            >
              {moodEmoji}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#0F172A]">{displayName}</h2>
              <StatusBadge label={moodLabel} tone={hasCheckin ? "brand" : "neutral"} />
            </div>
            <p className="mt-0.5 text-sm text-[#94A3B8]">{child.school || "School not set"}</p>
          </div>
        </div>

        <p className="mt-5 line-clamp-2 text-sm leading-relaxed text-[#64748B]">{aiSummary}</p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#F1EDE6] pt-5">
          <ProgressRing label="School readiness" value={schoolReadiness} size={72} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Today</p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#0F172A]">{todayRecommendation}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-xl bg-[#14B8A6]/10 px-3 py-1.5 text-xs font-semibold text-[#0D9488]">Check-In</span>
          <span className="rounded-xl bg-[#FAF8F4] px-3 py-1.5 text-xs font-semibold text-[#64748B]">Debrief</span>
          <span className="rounded-xl bg-[#FAF8F4] px-3 py-1.5 text-xs font-semibold text-[#64748B]">Profile</span>
        </div>
      </GlassCard>
    </Link>
  );
}
