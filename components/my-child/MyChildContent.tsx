import Link from "next/link";
import { FirstMyChildIntro } from "@/components/first-time";
import { CompanionExpandable } from "@/components/companion";
import EditorialPage from "@/components/editorial/EditorialPage";

import { EditorialRule } from "@/components/editorial/EditorialSection";

import WhoTheyAre, { buildWhoTheyAreCategories } from "@/components/my-child/WhoTheyAre";

import LearningCards from "@/components/my-child/LearningCards";

import ChildTodayStory from "@/components/today/ChildTodayStory";

import UnderstandingSection, { buildUnderstandingAreas } from "@/components/my-child/UnderstandingSection";

import JourneyPreview from "@/components/my-child/JourneyPreview";

import CelebrateSection, { gentleCelebrations } from "@/components/my-child/CelebrateSection";

import { buildChildCardSummary } from "@/lib/presentation/child-summary";

import { buildWeeklyLearnings, groupTimelineByDay, dailyEncouragement } from "@/lib/dashboard/briefing";

import { detectCelebrations } from "@/lib/intelligence/celebrations";

import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";

import { buildDashboardRecommendation } from "@/lib/ai/insight-generator";

import type {

  AIInsight,

  Child,

  ChildIntelligenceSnapshot,

  ChildProfile,

  DailyCheckin,

  PatternFinding,

  UnifiedTimelineItem,

} from "@/lib/types/database";



const LEARNING_TINTS = [

  "bg-[#E8F6F3]/70",

  "bg-[#F3EFFA]/60",

  "bg-[#FBF4E6]/70",

  "bg-[#FBEFEC]/50",

  "bg-[#F0F5EE]/70",

];



const LEARNING_EMOJIS = ["🌱", "🌅", "💛", "🌿", "✨"];



type MyChildContentProps = {

  child: Child;

  childProfile: ChildProfile | null;

  familyChildren: Child[];

  checkin: DailyCheckin | null;

  checkins: DailyCheckin[];

  intelligence: ChildIntelligenceSnapshot;

  insights: AIInsight[];

  patterns: PatternFinding[];

  timeline: UnifiedTimelineItem[];
  parentName?: string | null;
};

export default function MyChildContent({
  child,
  childProfile,
  familyChildren,
  checkin,
  checkins,
  intelligence,
  insights,
  patterns,
  timeline,
  parentName,
}: MyChildContentProps) {

  const displayName = child.nickname || child.first_name;

  const summary = buildChildCardSummary(displayName, checkin, intelligence);

  const weeklyTrend = compareWeeklyRegulation(checkins);

  const recommendation = buildDashboardRecommendation(displayName, checkin, patterns);

  const groupedTimeline = groupTimelineByDay(timeline);

  const weeklyLearnings = buildWeeklyLearnings(displayName, patterns, weeklyTrend, checkins);



  const whoCategories = buildWhoTheyAreCategories(

    childProfile?.strengths ?? [],

    childProfile?.calming_strategies ?? [],

    childProfile?.successful_strategies ?? [],

    child.interests ?? [],

    childProfile?.favourite_things ?? [],

    child.favourite_activities ?? [],

  );



  const learningCards = [

    ...insights.slice(0, 3).map((insight, i) => ({

      id: insight.id,

      text: insight.content.length > 140 ? `${insight.title}. ${insight.content.slice(0, 140)}…` : insight.content,

      emoji: LEARNING_EMOJIS[i % LEARNING_EMOJIS.length],

      tint: LEARNING_TINTS[i % LEARNING_TINTS.length],

    })),

    ...weeklyLearnings.slice(0, 3).map((item, i) => ({

      id: `learning-${i}`,

      text: item.text,

      emoji: item.positive ? "🌱" : "💛",

      tint: item.positive ? "bg-[#E8F6F3]/70" : "bg-[#FBEFEC]/50",

    })),

  ].slice(0, 5);



  const topPattern = patterns[0]?.description ?? patterns[0]?.title ?? null;

  const understandingAreas = buildUnderstandingAreas(

    displayName,

    checkins.length,

    patterns.length,

    intelligence,

    topPattern,

  );



  const celebrations = gentleCelebrations(

    detectCelebrations(displayName, checkin, checkins, patterns, weeklyTrend),

    displayName,

  );



  const headlineInsight = summary.aiSummary;

  const encouragement = weeklyTrend.message || dailyEncouragement();

  const isJustBeginning = checkins.length === 0;



  return (

    <EditorialPage
      variant="child"
      title="My Child"
      parentName={parentName}
      childName={displayName}
      familyChildren={familyChildren}
      activeChildId={child.id}
      primaryAction={{ label: "Check in", href: `/check-in?child=${child.id}${isJustBeginning ? "&first=1" : ""}` }}
    >
      {isJustBeginning && (
        <div className="mb-8">
          <FirstMyChildIntro childName={displayName} />
        </div>
      )}

      <ChildTodayStory
        childName={displayName}
        photoUrl={child.photo_url}
        checkin={checkin}
        insight={headlineInsight}
        recommendation={recommendation || summary.todayRecommendation}
        encouragement={encouragement}
      />

      <CompanionExpandable label={`As we learn about ${displayName}`}>
        <WhoTheyAre childName={displayName} categories={whoCategories} />

        <Link
          href={`/children/${child.id}?edit=true`}
          className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--cc-teal-deep)] hover:underline"
        >
          Edit profile
        </Link>

        {learningCards.length > 0 && (
          <>
            <EditorialRule />
            <LearningCards childName={displayName} cards={learningCards} />
          </>
        )}

        <EditorialRule />

        <UnderstandingSection childName={displayName} areas={understandingAreas} />

        <EditorialRule />

        <JourneyPreview childId={child.id} childName={displayName} days={groupedTimeline} />

        {celebrations.length > 0 && (
          <>
            <EditorialRule />
            <CelebrateSection childName={displayName} items={celebrations} />
          </>
        )}
      </CompanionExpandable>

    </EditorialPage>

  );

}

