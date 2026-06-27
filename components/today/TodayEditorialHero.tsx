import ChildSwitcher from "@/components/app/ChildSwitcher";
import CompanionWelcome from "@/components/companion/CompanionWelcome";
import type { Child } from "@/lib/types/database";
import type { DayPhase } from "@/lib/companion/daily-rhythm";

type TodayEditorialHeroProps = {
  childId: string;
  phase: DayPhase;
  greeting: string;
  parentName?: string;
  childName?: string;
  familyChildren: Child[];
};

/** Minimal hero — warmth, one greeting, room to breathe */
export default function TodayEditorialHero({
  childId,
  phase,
  greeting,
  parentName,
  childName,
  familyChildren,
}: TodayEditorialHeroProps) {
  return (
    <header
      className="relative -mx-2 overflow-visible sm:-mx-4 lg:-mx-6"
      aria-labelledby="today-hero-heading"
    >
      <div className="relative z-10 px-2 pb-2 pt-14 sm:px-6 sm:pb-6 lg:px-10 lg:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CompanionWelcome variant="today" parentName={parentName} childName={childName} phase={phase} />
          {familyChildren.length > 1 && (
            <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />
          )}
        </div>

        <h1
          id="today-hero-heading"
          className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight text-[var(--cc-ink)]"
        >
          {greeting}
        </h1>
      </div>
    </header>
  );
}
