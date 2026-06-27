import ChildSwitcher from "@/components/app/ChildSwitcher";

import EditorialHero from "@/components/immersive/EditorialHero";

import { DocumentsEnvironment } from "@/components/immersive/environments/PageEnvironments";

import type { Child } from "@/lib/types/database";



type LibraryHeroProps = {

  childId: string;

  familyChildren: Child[];

};



export default function LibraryHero({ childId, familyChildren }: LibraryHeroProps) {

  return (

    <EditorialHero

      id="library-hero"

      tint="library"

      illustration={<DocumentsEnvironment />}

    >

      <div className="space-y-5">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">

            📚 Your family library

          </p>

          {familyChildren.length > 1 && (

            <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />

          )}

        </div>



        <div>

          <h1

            id="library-hero-heading"

            className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--cc-ink)] sm:text-4xl lg:text-[2.75rem]"

          >

            Your Family Library

          </h1>

          <p className="mt-4 text-base leading-relaxed text-[var(--cc-ink-muted)] sm:text-lg">

            Everything you&apos;ve learned together, beautifully organised in one place.

          </p>

        </div>

      </div>

    </EditorialHero>

  );

}

