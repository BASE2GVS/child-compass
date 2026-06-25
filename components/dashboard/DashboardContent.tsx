import Link from "next/link";
import dynamic from "next/dynamic";
import DailyBriefing from "@/components/dashboard/DailyBriefing";
import SchoolReadinessCard from "@/components/dashboard/SchoolReadinessCard";
import IntelligencePanel from "@/components/dashboard/IntelligencePanel";
import ChildSnapshot from "@/components/dashboard/ChildSnapshot";
import EmotionalTimeline from "@/components/dashboard/EmotionalTimeline";
import WeeklyReview from "@/components/dashboard/WeeklyReview";
import ParentWins from "@/components/dashboard/ParentWins";
import EncouragementCard from "@/components/dashboard/EncouragementCard";
import SmartQuickActions from "@/components/dashboard/SmartQuickActions";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import { buildDailyBriefing } from "@/lib/dashboard/briefing";
import type {
  Child,
  ChildIntelligenceSnapshot,
  CoachMessage,
  DailyCheckin,
  GeneratedReport,
  PatternFinding,
  UnifiedTimelineItem,
} from "@/lib/types/database";

const AskChildCompass = dynamic(() => import("@/components/dashboard/AskChildCompass"), {
  loading: () => (
    <div className="animate-shimmer h-64 rounded-[32px] bg-[#E8E4DC]/40" aria-label="Loading Ask Child Compass" />
  ),
});

const ReportPreviewCards = dynamic(() => import("@/components/dashboard/ReportPreviewCards"), {
  loading: () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="animate-shimmer h-48 rounded-[32px] bg-[#E8E4DC]/40" />
      <div className="animate-shimmer h-48 rounded-[32px] bg-[#E8E4DC]/40" />
      <div className="animate-shimmer h-48 rounded-[32px] bg-[#E8E4DC]/40" />
    </div>
  ),
});

type DashboardContentProps = {
  greeting: string;
  parentName: string;
  childName: string;
  childId: string;
  familyChildren: Child[];
  headlineInsight: string | null;
  recommendation: string | null;
  weeklyTrend: { trend: string; message: string } | null;
  timeline: UnifiedTimelineItem[];
  checkin: DailyCheckin | null;
  yesterdayCheckin: DailyCheckin | null;
  patterns: PatternFinding[];
  intelligence: ChildIntelligenceSnapshot;
  weekCheckins: DailyCheckin[];
  coachSessionId: string;
  coachMessages: CoachMessage[];
  hasDebrief: boolean;
  reports: GeneratedReport[];
  firstCheckinOffer?: boolean;
  journeyPhase?: import("@/lib/intelligence/journey").JourneyPhase | null;
};

export default function DashboardContent({
  greeting,
  parentName,
  childName,
  childId,
  familyChildren,
  headlineInsight,
  recommendation,
  weeklyTrend,
  timeline,
  checkin,
  yesterdayCheckin,
  patterns,
  intelligence,
  weekCheckins,
  coachSessionId,
  coachMessages,
  hasDebrief,
  reports,
  firstCheckinOffer = false,
  journeyPhase = null,
}: DashboardContentProps) {
  const qs = `?child=${childId}`;
  const briefing = buildDailyBriefing(
    childName,
    checkin,
    yesterdayCheckin,
    recommendation,
    weeklyTrend?.message ?? null,
    headlineInsight,
  );

  return (
    <DashboardBackground>
      <div className="space-y-10 lg:space-y-12">
        <DailyBriefing
          greeting={greeting}
          parentName={parentName}
          childName={childName}
          briefing={briefing}
          familyChildren={familyChildren}
          activeChildId={childId}
        />

        <EncouragementCard journeyPhase={journeyPhase} />

        {!checkin && (
          <div className="rounded-[32px] border border-[#14B8A6]/15 bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0F172A]">
              Let&apos;s start learning about {childName}
            </h2>
            <p className="mt-2 max-w-xl text-[#64748B]">
              Your first check-in unlocks today&apos;s briefing and personalised intelligence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/check-in${qs}`}
                className="rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(20,184,166,0.35)] transition-all hover:bg-[#0D9488] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/50"
              >
                Complete Morning Check-In
              </Link>
            </div>
          </div>
        )}

        {firstCheckinOffer && (
          <div className="rounded-[32px] bg-gradient-to-br from-indigo-50 to-white p-8 shadow-[0_12px_40px_rgba(99,102,241,0.08)]">
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Great first check-in</p>
            <p className="mt-2 text-lg font-semibold text-[#0F172A]">
              Would you like Child Compass to explain today&apos;s events?
            </p>
            <Link
              href={`/debrief${qs}&first=true`}
              className="mt-5 inline-block rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Start Parent Debrief™
            </Link>
          </div>
        )}

        <SchoolReadinessCard
          childName={childName}
          checkin={checkin}
          intelligence={intelligence}
        />

        <IntelligencePanel
          childName={childName}
          checkin={checkin}
          weeklyTrendMessage={weeklyTrend?.message ?? null}
          recommendation={recommendation}
          patterns={patterns}
          weekCheckins={weekCheckins}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <ChildSnapshot
            childName={childName}
            intelligence={intelligence}
            lastUpdated={checkin?.created_at ?? null}
            aiConfidence={briefing.overallConfidence}
          />
          <WeeklyReview
            childName={childName}
            patterns={patterns}
            weeklyTrend={weeklyTrend}
            weekCheckins={weekCheckins}
          />
        </div>

        <ParentWins
          childName={childName}
          checkin={checkin}
          weekCheckins={weekCheckins}
          patterns={patterns}
          weeklyTrend={weeklyTrend}
        />

        <AskChildCompass
          childId={childId}
          childName={childName}
          sessionId={coachSessionId}
          recentMessages={coachMessages}
        />

        <EmotionalTimeline timeline={timeline} childId={childId} />

        <ReportPreviewCards childId={childId} childName={childName} reports={reports} />

        <SmartQuickActions childId={childId} checkin={checkin} hasDebrief={hasDebrief} />
      </div>
    </DashboardBackground>
  );
}
