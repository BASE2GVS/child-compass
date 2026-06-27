import { moodEmoji, moodLabel } from "@/lib/presentation/child-summary";
import type { DailyCheckin } from "@/lib/types/database";

type ChildTodayCardProps = {
  childName: string;
  photoUrl: string | null;
  checkin: DailyCheckin | null;
  insight: string | null;
  recommendation: string | null;
  encouragement: string | null;
};

function badgeForCheckin(checkin: DailyCheckin | null): { label: string; tone: string } {
  if (!checkin) {
    return { label: "Waiting to hear from you", tone: "bg-[#F3EFFA] text-[var(--cc-ink-muted)]" };
  }
  const mood = checkin.mood ?? 3;
  if (mood >= 4) return { label: "A brighter day", tone: "bg-[#E8F6F3] text-[var(--cc-teal-deep)]" };
  if (mood <= 2) return { label: "Taking it gently", tone: "bg-[#FBEFEC] text-[#B87A6E]" };
  return { label: "Steady so far", tone: "bg-[#FBF4E6] text-[#9A7B3A]" };
}

export default function ChildTodayCard({
  childName,
  photoUrl,
  checkin,
  insight,
  recommendation,
  encouragement,
}: ChildTodayCardProps) {
  const initial = childName.charAt(0).toUpperCase();
  const badge = badgeForCheckin(checkin);
  const emoji = moodEmoji(checkin?.mood);
  const mood = moodLabel(checkin?.mood);

  return (
    <article
      className="overflow-hidden rounded-[1.75rem] border border-white/55 bg-white/58 shadow-[0_4px_24px_rgba(45,42,38,0.06)] backdrop-blur-xl"
      aria-labelledby="child-today-heading"
    >
      <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-start sm:p-10">
        <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-24 w-24 rounded-[1.25rem] object-cover shadow-md ring-4 ring-[#E8F6F3]"
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#5BB5A8] to-[#3D9B8F] font-display text-4xl font-semibold text-white shadow-[0_8px_24px_var(--cc-teal-glow)]"
              aria-hidden="true"
            >
              {initial}
            </div>
          )}
          <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${badge.tone}`}>
            {badge.label}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]">
              {childName} today
            </p>
            <h2 id="child-today-heading" className="mt-1 font-display text-2xl font-semibold text-[var(--cc-ink)]">
              {emoji} {mood}
            </h2>
          </div>

          {insight && (
            <div className="rounded-2xl bg-[#F3EFFA]/50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
                One insight
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{insight}</p>
            </div>
          )}

          {recommendation && (
            <div className="rounded-2xl bg-[#FBF4E6]/60 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
                Gentle suggestion
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{recommendation}</p>
            </div>
          )}

          {encouragement && (
            <p className="text-sm italic leading-relaxed text-[var(--cc-teal-deep)]">
              {encouragement}
            </p>
          )}

          {!checkin && (
            <p className="text-sm text-[var(--cc-ink-muted)]">
              When you&apos;re ready, a quick check-in helps me walk alongside {childName} today.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
