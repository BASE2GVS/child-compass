import Link from "next/link";
import { groupTimelineByDay } from "@/lib/dashboard/briefing";
import type { UnifiedTimelineItem } from "@/lib/types/database";

type EmotionalTimelineProps = {
  timeline: UnifiedTimelineItem[];
  childId: string;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function EmotionalTimeline({ timeline, childId }: EmotionalTimelineProps) {
  if (timeline.length === 0) return null;

  const grouped = groupTimelineByDay(timeline);

  return (
    <section aria-labelledby="emotional-timeline-heading">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
            Emotional Timeline
          </p>
          <h2 id="emotional-timeline-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
            Your child&apos;s emotional journey
          </h2>
        </div>
        <Link
          href={`/timeline?child=${childId}`}
          className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-[#14B8A6] shadow-sm transition-colors hover:bg-[#14B8A6]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40"
        >
          View full story
        </Link>
      </div>

      <div className="space-y-8">
        {grouped.map(({ day, events }) => (
          <div key={day}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#94A3B8]">{day}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className={`rounded-[24px] border ${event.border} ${event.bg} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {event.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#0F172A]">{event.label}</span>
                        <time className="text-[11px] text-[#94A3B8]">{formatTime(event.time)}</time>
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#64748B]">
                        {event.summary}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
