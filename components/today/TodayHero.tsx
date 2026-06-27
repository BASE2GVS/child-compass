import Link from "next/link";

import ChildSwitcher from "@/components/app/ChildSwitcher";

import EditorialHero from "@/components/immersive/EditorialHero";

import { TodayEnvironment } from "@/components/immersive/environments/PageEnvironments";

import type { Child } from "@/lib/types/database";

import type { DayPhase } from "@/lib/companion/daily-rhythm";



type TodayHeroProps = {

  childId: string;

  phase: DayPhase;

  greeting: string;

  subline: string;

  familyChildren: Child[];

};



function phaseEmoji(phase: DayPhase): string {

  if (phase === "morning") return "☀️";

  if (phase === "evening") return "🌙";

  return "🌤️";

}



export default function TodayHero({

  childId,

  phase,

  greeting,

  subline,

  familyChildren,

}: TodayHeroProps) {

  return (

    <EditorialHero

      id="today-hero"

      tint="warm"

      illustration={<TodayEnvironment />}

    >

      <div className="space-y-6">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">

            {phaseEmoji(phase)} {phase === "morning" ? "Good morning" : phase === "evening" ? "Good evening" : "Today"}

          </p>

          {familyChildren.length > 1 && (

            <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />

          )}

        </div>



        <div>

          <h1

            id="today-hero-heading"

            className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--cc-ink)] sm:text-5xl lg:text-[3.25rem]"

          >

            {greeting}

          </h1>

          <p className="mt-4 text-lg leading-relaxed text-[var(--cc-ink-muted)] sm:text-xl">

            {subline}

          </p>

        </div>



        <Link

          href={`/coach?child=${childId}`}

          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--cc-teal)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_28px_var(--cc-teal-glow)] transition-all duration-200 hover:bg-[var(--cc-teal-deep)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"

        >

          Talk

        </Link>

      </div>

    </EditorialHero>

  );

}

