import { moodEmoji, moodLabel } from "@/lib/presentation/child-summary";

import type { DailyCheckin } from "@/lib/types/database";



type ChildTodayStoryProps = {

  childName: string;

  photoUrl: string | null;

  checkin: DailyCheckin | null;

  insight: string | null;

  recommendation: string | null;

  encouragement: string | null;

};



export default function ChildTodayStory({

  childName,

  photoUrl,

  checkin,

  insight,

  recommendation,

}: ChildTodayStoryProps) {

  const initial = childName.charAt(0).toUpperCase();

  const emoji = moodEmoji(checkin?.mood);

  const mood = moodLabel(checkin?.mood);

  const headline = insight || recommendation;



  return (

    <section aria-labelledby="child-story-heading" className="flex items-start gap-5">

      {photoUrl ? (

        <img

          src={photoUrl}

          alt=""

          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-white/80 sm:h-20 sm:w-20"

        />

      ) : (

        <div

          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cc-teal)] to-[var(--cc-teal-deep)] text-2xl font-semibold text-white sm:h-20 sm:w-20"

          aria-hidden

        >

          {initial}

        </div>

      )}



      <div className="min-w-0 flex-1">

        <h2 id="child-story-heading" className="font-display text-xl font-semibold text-[var(--cc-ink)] sm:text-2xl">

          {childName}

          {checkin ? (

            <span className="ml-2 text-lg font-normal text-[var(--cc-ink-muted)]">

              <span aria-hidden>{emoji}</span> {mood}

            </span>

          ) : null}

        </h2>



        {!checkin && (

          <p className="mt-2 text-base text-[var(--cc-ink-muted)]">

            We&apos;re just getting started — today&apos;s check-in is a gentle first step.

          </p>

        )}



        {headline && (

          <p className="mt-3 text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">{headline}</p>

        )}

      </div>

    </section>

  );

}


