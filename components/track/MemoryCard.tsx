import type { UnifiedTimelineItem } from "@/lib/types/database";
import { mapEmotionalEvent } from "@/lib/dashboard/briefing";

type MemoryCardProps = {
  event: UnifiedTimelineItem;
};

export default function MemoryCard({ event }: MemoryCardProps) {
  const emotional = mapEmotionalEvent(event);
  const date = new Date(event.event_date);
  const dateLabel = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#FDF6E8] via-[#FFFCF8] to-[#F3EFFA]/50 p-8 shadow-[0_4px_24px_rgba(45,42,38,0.07)] ring-1 ring-[var(--cc-border-soft)] sm:p-10">
      <div className="flex items-start gap-5">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-sm"
          aria-hidden
        >
          {emotional.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]">
            A moment to remember
          </p>
          <time className="mt-2 block font-display text-lg text-[var(--cc-ink-muted)]" dateTime={event.event_date}>
            {dateLabel}
          </time>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-snug text-[var(--cc-ink)] sm:text-3xl">
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-4 text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
