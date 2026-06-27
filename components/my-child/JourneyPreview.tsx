import Link from "next/link";
import type { EmotionalEvent } from "@/lib/dashboard/briefing";

type JourneyPreviewProps = {
  childId: string;
  childName: string;
  days: { day: string; events: EmotionalEvent[] }[];
};

const WARM_BG: Record<string, string> = {
  "bg-emerald-50": "bg-[#E8F6F3]",
  "bg-violet-50": "bg-[#F3EFFA]",
  "bg-rose-50": "bg-[#FBEFEC]",
  "bg-amber-50": "bg-[#FBF4E6]",
  "bg-indigo-50": "bg-[#F0F5EE]",
  "bg-sky-50": "bg-[#E8F6F3]",
  "bg-teal-50": "bg-[#E8F6F3]",
};

function warmBg(bg: string): string {
  return WARM_BG[bg] ?? "bg-[#FFFCF8]";
}

export default function JourneyPreview({ childId, childName, days }: JourneyPreviewProps) {
  const events = days.flatMap((d) => d.events.map((e) => ({ ...e, day: d.day }))).slice(0, 6);

  if (events.length === 0) {
    return (
      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
          {childName}&apos;s journey
        </h2>
        <p className="mt-4 rounded-[1.5rem] border border-dashed border-[var(--cc-border)] bg-[var(--cc-paper-elevated)] p-8 text-center text-base leading-relaxed text-[var(--cc-ink-muted)]">
          Your family&apos;s story with {childName} will grow here — check-ins, wins, reflections, and quiet moments
          together.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="journey-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="journey-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
            {childName}&apos;s journey
          </h2>
          <p className="mt-2 text-base text-[var(--cc-ink-muted)]">Recent chapters in your story together.</p>
        </div>
        <Link
          href={`/timeline?child=${childId}`}
          className="text-sm font-semibold text-[var(--cc-teal)] hover:text-[var(--cc-teal-deep)]"
        >
          Read the full story →
        </Link>
      </div>

      <div className="relative mt-8 space-y-4 pl-2">
        <div
          className="absolute bottom-4 left-[1.65rem] top-4 w-0.5 bg-gradient-to-b from-[var(--cc-teal-wash)] via-[var(--cc-teal-soft)]/40 to-transparent"
          aria-hidden
        />

        {events.map((event) => (
          <article
            key={event.id}
            className={`relative ml-10 rounded-[1.25rem] p-5 shadow-[0_2px_12px_rgba(45,42,38,0.04)] ${warmBg(event.bg)}`}
          >
            <div
              className="absolute -left-10 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-2 ring-[var(--cc-teal-wash)]"
              aria-hidden
            >
              {event.emoji}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
              {event.label}
            </p>
            <p className="mt-1 font-medium text-[var(--cc-ink)]">{event.summary}</p>
            <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">
              {new Date(event.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
