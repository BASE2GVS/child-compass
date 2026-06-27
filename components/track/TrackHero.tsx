import ChildSwitcher from "@/components/app/ChildSwitcher";

import EditorialHero from "@/components/immersive/EditorialHero";

import { TrackEnvironment } from "@/components/immersive/environments/PageEnvironments";

import type { Child } from "@/lib/types/database";



type TrackHeroProps = {

  childName: string;

  childId: string;

  familyChildren: Child[];

};



export default function TrackHero({ childName, childId, familyChildren }: TrackHeroProps) {

  return (

    <EditorialHero

      id="track-hero"

      tint="path"

      illustration={<TrackEnvironment />}

    >

      <div className="space-y-5">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">

            📖 Your family story

          </p>

          {familyChildren.length > 1 && (

            <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />

          )}

        </div>



        <div>

          <h1

            id="track-hero-heading"

            className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--cc-ink)] sm:text-4xl lg:text-[2.75rem]"

          >

            Your Family Journey

          </h1>

          <p className="mt-4 text-base leading-relaxed text-[var(--cc-ink-muted)] sm:text-lg">

            Every small moment helps us understand {childName} a little better.

          </p>

        </div>

      </div>

    </EditorialHero>

  );

}

