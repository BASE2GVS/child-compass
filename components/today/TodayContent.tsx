import DashboardBackground from "@/components/dashboard/DashboardBackground";

import TodayEditorial from "@/components/today/TodayEditorial";

import { buildMorningGuide } from "@/lib/companion/morning-guide";

import { buildEveningReflection } from "@/lib/companion/evening-reflection";

import { buildContextualNextStep } from "@/lib/companion/contextual-next-step";

import { getDayPhase } from "@/lib/companion/daily-rhythm";

import type {

  Child,

  CoachMessage,

  DailyCheckin,

  PatternFinding,

} from "@/lib/types/database";



type TodayContentProps = {

  parentName: string;

  childName: string;

  childId: string;

  childPhotoUrl: string | null;

  familyChildren: Child[];

  headlineInsight: string | null;

  recommendation: string | null;

  weeklyTrend: { trend: string; message: string } | null;

  checkin: DailyCheckin | null;

  yesterdayCheckin: DailyCheckin | null;

  patterns: PatternFinding[];

  weekCheckins: DailyCheckin[];

  coachMessages: CoachMessage[];

  firstCheckinOffer?: boolean;

};



function heroCopy(
  phase: ReturnType<typeof getDayPhase>,
  parentName: string,
  morningGreeting: string,
): { greeting: string } {

  if (phase === "morning") {
    return { greeting: morningGreeting };
  }
  if (phase === "evening") {
    return {
      greeting: `Good evening, ${parentName}`,
    };
  }
  return {
    greeting: `Hello, ${parentName}`,
  };
}



export default function TodayContent({

  parentName,

  childName,

  childId,

  childPhotoUrl,

  familyChildren,

  headlineInsight,

  recommendation,

  weeklyTrend,

  checkin,

  yesterdayCheckin,

  patterns,

  weekCheckins,

  coachMessages,

  firstCheckinOffer = false,

}: TodayContentProps) {

  const phase = getDayPhase();

  const trend = (weeklyTrend?.trend as "improving" | "stable" | "declining" | undefined) ?? null;



  const morningGuide = buildMorningGuide({

    parentName,

    childName,

    checkin,

    yesterdayCheckin,

    weekCheckins,

    coachMessages,

    patterns,

    recommendation,

    headlineInsight,

    weeklyTrend: trend,

  });



  const eveningReflection = buildEveningReflection({

    childName,

    checkin,

    yesterdayCheckin,

    coachMessages,

    patterns,

    weeklyTrend: trend,

  });



  const nextStep = buildContextualNextStep({

    phase,

    childId,

    childName,

    checkin,

    coachMessages,

    patterns,

    firstCheckinOffer,

  });



  const { greeting } = heroCopy(phase, parentName, morningGuide.greeting);



  const childInsight = headlineInsight ?? morningGuide.noticing;

  const childRecommendation = recommendation ?? morningGuide.gentleRecommendation;



  return (

    <DashboardBackground>

      <TodayEditorial
        parentName={parentName}
        childName={childName}
        childId={childId}
        childPhotoUrl={childPhotoUrl}
        familyChildren={familyChildren}
        phase={phase}
        greeting={greeting}
        checkin={checkin}
        insight={childInsight}
        recommendation={childRecommendation}
        nextStep={nextStep}
        eveningReflection={phase === "evening" ? eveningReflection : undefined}
        firstCheckinCelebration={firstCheckinOffer}
      />

    </DashboardBackground>

  );

}

