"use client";

import TodayEditorialHero from "@/components/today/TodayEditorialHero";
import ChildTodayStory from "@/components/today/ChildTodayStory";
import TodayFocusFeature from "@/components/today/TodayFocusFeature";
import EveningReflectionSection from "@/components/today/EveningReflection";
import CompanionVisitTracker from "@/components/companion/CompanionVisitTracker";
import type { ContextualNextStep } from "@/lib/companion/contextual-next-step";
import type { EveningReflection } from "@/lib/companion/evening-reflection";
import type { Child, DailyCheckin } from "@/lib/types/database";
import type { DayPhase } from "@/lib/companion/daily-rhythm";
import { FIRST_CHECKIN_CELEBRATION } from "@/lib/first-time/copy";
import { GentleSuccess } from "@/components/first-time";

type TodayEditorialProps = {
  parentName: string;
  childName: string;
  childId: string;
  childPhotoUrl: string | null;
  familyChildren: Child[];
  phase: DayPhase;
  greeting: string;
  checkin: DailyCheckin | null;
  insight: string | null;
  companionInsight?: {
    displayText: string;
    confidenceLabel: string;
    supportingEvents?: { label: string; date?: string }[];
  } | null;
  recommendation: string | null;
  nextStep: ContextualNextStep;
  eveningReflection?: EveningReflection;
  firstCheckinCelebration?: boolean;
};

export default function TodayEditorial({
  parentName,
  childName,
  childId,
  childPhotoUrl,
  familyChildren,
  phase,
  greeting,
  checkin,
  insight,
  companionInsight,
  recommendation,
  nextStep,
  eveningReflection,
  firstCheckinCelebration = false,
}: TodayEditorialProps) {
  const hasStory = Boolean(checkin || insight || recommendation);

  return (
    <article className="today-editorial relative w-full pb-12">
      <CompanionVisitTracker />
      <TodayEditorialHero
        childId={childId}
        phase={phase}
        greeting={greeting}
        parentName={parentName}
        childName={childName}
        familyChildren={familyChildren}
      />

      <div className="today-parchment relative z-10 -mt-2 px-5 py-8 sm:px-7 sm:py-10 lg:px-10 cc-flow-enter">
        {firstCheckinCelebration && (
          <GentleSuccess message={FIRST_CHECKIN_CELEBRATION} className="mb-8" />
        )}

        <TodayFocusFeature step={nextStep} />

        {hasStory && (
          <div className="mt-12 max-w-2xl">
            <ChildTodayStory
              childName={childName}
              photoUrl={childPhotoUrl}
              checkin={checkin}
              insight={insight}
              companionInsight={companionInsight}
              recommendation={recommendation}
              encouragement={null}
            />
          </div>
        )}
      </div>

      {phase === "evening" && eveningReflection && (
        <EveningReflectionSection reflection={eveningReflection} childName={childName} />
      )}
    </article>
  );
}
