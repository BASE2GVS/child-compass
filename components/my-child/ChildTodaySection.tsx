import { moodEmoji, moodLabel } from "@/lib/presentation/child-summary";

type ChildTodaySectionProps = {
  childName: string;
  photoUrl: string | null;
  insight: string | null;
  recommendation: string | null;
  encouragement: string | null;
  hasCheckin: boolean;
  mood?: number | null;
};

export default function ChildTodaySection({
  childName,
  photoUrl,
  insight,
  recommendation,
  encouragement,
  hasCheckin,
  mood,
}: ChildTodaySectionProps) {
  const initial = childName.charAt(0).toUpperCase();
  const emoji = mood != null ? moodEmoji(mood) : "🌤️";
  const moodText = hasCheckin ? moodLabel(mood) : "Waiting to hear from you";

  return (
    <section aria-labelledby="child-today-heading">
      <h2 id="child-today-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        Today
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">What we&apos;re noticing right now.</p>

      <article className="mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--cc-border-soft)] bg-gradient-to-br from-[#FFFCF8] via-[var(--cc-paper-elevated)] to-[#F3EFFA]/40 p-8 shadow-[0_4px_20px_rgba(45,42,38,0.05)] sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md ring-2 ring-[#E8F6F3]"
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5BB5A8] to-[#3D9B8F] font-display text-2xl font-semibold text-white"
              aria-hidden
            >
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-5">
            <p className="font-display text-xl text-[var(--cc-ink)]">
              {emoji} {moodText}
            </p>

            {insight && (
              <div className="rounded-2xl bg-[#F3EFFA]/50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
                  What we&apos;re noticing
                </p>
                <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{insight}</p>
              </div>
            )}

            {recommendation && (
              <div className="rounded-2xl bg-[#E8F6F3]/50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
                  One gentle suggestion
                </p>
                <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{recommendation}</p>
              </div>
            )}

            {encouragement && (
              <p className="text-sm italic leading-relaxed text-[var(--cc-teal-deep)]">{encouragement}</p>
            )}

            {!hasCheckin && (
              <p className="text-sm text-[var(--cc-ink-muted)]">
                A quick check-in today helps us walk alongside {childName} with more care.
              </p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
