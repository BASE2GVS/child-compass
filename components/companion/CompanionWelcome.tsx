"use client";

import { useSyncExternalStore } from "react";
import { CompanionWelcomeLine } from "@/components/companion/Companion";
import type { EditorialVariant } from "@/components/editorial/environment-variants";
import type { DayPhase } from "@/lib/companion/daily-rhythm";
import { pickWelcomeLine } from "@/lib/companion/welcome-lines";
import { readDaysAway } from "@/components/companion/CompanionVisitTracker";

type CompanionWelcomeProps = {
  variant: EditorialVariant;
  parentName?: string | null;
  childName?: string | null;
  phase?: DayPhase;
};

function subscribe() {
  return () => {};
}

export default function CompanionWelcome({
  variant,
  parentName,
  childName,
  phase,
}: CompanionWelcomeProps) {
  const daysAway = useSyncExternalStore(subscribe, readDaysAway, () => 0);

  const line = pickWelcomeLine({
    variant,
    parentName,
    childName,
    phase,
    daysAway,
  });

  return <CompanionWelcomeLine>{line}</CompanionWelcomeLine>;
}
