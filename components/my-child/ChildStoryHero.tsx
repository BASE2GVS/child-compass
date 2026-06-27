import Link from "next/link";

import ChildSwitcher from "@/components/app/ChildSwitcher";

import EditorialHero from "@/components/immersive/EditorialHero";

import { ChildEnvironment } from "@/components/immersive/environments/PageEnvironments";

import type { Child } from "@/lib/types/database";

import { moodEmoji } from "@/lib/presentation/child-summary";



type ChildStoryHeroProps = {

  child: Child;

  displayName: string;

  familyChildren: Child[];

  mood?: number | null;

};



export default function ChildStoryHero({

  child,

  displayName,

  familyChildren,

  mood,

}: ChildStoryHeroProps) {

  const initial = displayName.charAt(0).toUpperCase();

  const emoji = mood != null ? moodEmoji(mood) : null;



  return (

    <EditorialHero

      id="child-story"

      tint="garden"

      illustration={<ChildEnvironment />}

    >

      <div className="space-y-6">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">

            My Child

          </p>

          {familyChildren.length > 1 && (

            <ChildSwitcher familyChildren={familyChildren} activeChildId={child.id} />

          )}

        </div>



        <div className="flex items-center gap-4 sm:gap-5">

          {child.photo_url ? (

            <img

              src={child.photo_url}

              alt=""

              className="h-16 w-16 rounded-[1.1rem] object-cover shadow-md ring-4 ring-white/80 sm:h-20 sm:w-20"

            />

          ) : (

            <div

              className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#5BB5A8] to-[#3D9B8F] font-display text-2xl font-semibold text-white shadow-[0_8px_24px_var(--cc-teal-glow)] sm:h-20 sm:w-20 sm:text-3xl"

              aria-hidden

            >

              {initial}

            </div>

          )}

          <div>

            <h1

              id="child-story-heading"

              className="font-display text-3xl font-semibold tracking-tight text-[var(--cc-ink)] sm:text-4xl lg:text-5xl"

            >

              {displayName}

              {emoji && (

                <span className="ml-2 text-2xl sm:text-3xl" aria-hidden>

                  {emoji}

                </span>

              )}

            </h1>

            {child.school && (

              <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">{child.school}</p>

            )}

          </div>

        </div>



        <p className="text-base leading-relaxed text-[var(--cc-ink-muted)] sm:text-lg">

          Every day we&apos;re learning a little more about {displayName} together.

        </p>



        <div className="flex flex-wrap gap-3">

          <Link

            href={`/check-in?child=${child.id}`}

            className="inline-flex min-h-11 items-center rounded-full bg-[var(--cc-teal)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_var(--cc-teal-glow)] transition-all hover:bg-[var(--cc-teal-deep)]"

          >

            Check in today

          </Link>

          <Link

            href={`/children/${child.id}?edit=true`}

            className="inline-flex min-h-11 items-center rounded-full border border-white/60 bg-white/60 px-6 py-2.5 text-sm font-semibold text-[var(--cc-ink-muted)] backdrop-blur-sm transition-colors hover:bg-white/80"

          >

            Edit profile

          </Link>

        </div>

      </div>

    </EditorialHero>

  );

}

