import ChildSwitcher from "@/components/app/ChildSwitcher";

import EditorialHero from "@/components/immersive/EditorialHero";

import { CoachEnvironment } from "@/components/immersive/environments/PageEnvironments";

import type { Child } from "@/lib/types/database";



type CoachHeroProps = {

  childId: string;

  childName: string;

  familyChildren: Child[];

  reflectMode?: boolean;

  compact?: boolean;

};



export default function CoachHero({

  childId,

  childName,

  familyChildren,

  reflectMode = false,

  compact = false,

}: CoachHeroProps) {

  if (compact) {

    return (

      <header className="flex flex-wrap items-center justify-between gap-4 px-1">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal-deep)]">

            {reflectMode ? "Reflect together" : "Talk with Child Compass"}

          </p>

          <p className="mt-1 font-display text-lg font-semibold text-[var(--cc-ink)]">

            For you and {childName}

          </p>

        </div>

        {familyChildren.length > 1 && (

          <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />

        )}

      </header>

    );

  }



  return (

    <EditorialHero

      id="coach-hero"

      tint="calm"

      illustration={<CoachEnvironment />}

    >

      <div className="space-y-5">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">

            {reflectMode ? "🌙 Reflect together" : "💬 Talk with Child Compass"}

          </p>

          {familyChildren.length > 1 && (

            <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />

          )}

        </div>



        <div className="space-y-4">

          <h1

            id="coach-hero-heading"

            className="font-display text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--cc-ink)] sm:text-4xl lg:text-[2.75rem]"

          >

            {reflectMode ? "Let's make sense of today" : "Talk with Child Compass"}

          </h1>

          <div className="space-y-2 text-base leading-relaxed text-[var(--cc-ink-muted)] sm:text-lg">

            <p>Sometimes you need advice.</p>

            <p>Sometimes you need understanding.</p>

            <p>Sometimes you just need someone to listen.</p>

            <p className="font-medium text-[var(--cc-ink)]">I&apos;m here.</p>

          </div>

        </div>

      </div>

    </EditorialHero>

  );

}

