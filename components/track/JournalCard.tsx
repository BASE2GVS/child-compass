import { timeOfDay } from "@/components/track/track-filters";
import type { UnifiedTimelineItem } from "@/lib/types/database";
import { mapEmotionalEvent } from "@/lib/dashboard/briefing";

const WARM_TINTS: Record<string, string> = {
  "bg-emerald-50": "from-[#E8F6F3]/80 to-[#FFFCF8]",
  "bg-violet-50": "from-[#F3EFFA]/70 to-[#FFFCF8]",
  "bg-rose-50": "from-[#FBEFEC]/60 to-[#FFFCF8]",
  "bg-amber-50": "from-[#FBF4E6]/70 to-[#FFFCF8]",
  "bg-indigo-50": "from-[#F0F5EE]/70 to-[#FFFCF8]",
  "bg-sky-50": "from-[#E8F6F3]/70 to-[#FFFCF8]",
  "bg-teal-50": "from-[#E8F6F3]/80 to-[#FFFCF8]",
  "bg-slate-50": "from-[#F5F1EA]/60 to-[#FFFCF8]",
};

function gradientFor(bg: string): string {
  return WARM_TINTS[bg] ?? "from-[#FFFCF8] to-[#FAF8F4]";
}

type JournalCardProps = {
  event: UnifiedTimelineItem;
  index: number;
};

export default function JournalCard({ event, index }: JournalCardProps) {
  const emotional = mapEmotionalEvent(event);
  const tod = timeOfDay(event.event_date);
  const gradient = gradientFor(emotional.bg);
  const isWin =
    event.event_type === "victory" ||
    (event.description?.toLowerCase().includes("win") ?? false);

  const headline = event.title || emotional.summary;
  const noticed = event.description && event.description !== headline ? event.description : emotional.summary;
  const winText = isWin ? emotional.summary : null;

  const timeLabel = new Date(event.event_date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`animate-cc-fade-up rounded-[1.5rem] bg-gradient-to-br ${gradient} p-6 shadow-[0_2px_16px_rgba(45,42,38,0.05)] ring-1 ring-[var(--cc-border-soft)]/80 motion-reduce:animate-none sm:p-7`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--cc-teal-deep)]">
          <span aria-hidden>{tod.emoji}</span>
          {tod.label}
        </p>
        <time className="text-xs text-[var(--cc-ink-faint)]" dateTime={event.event_date}>
          {timeLabel}
        </time>
      </div>

      <p className="mt-4 font-display text-xl font-medium leading-snug text-[var(--cc-ink)] sm:text-2xl">
        {headline}
      </p>

      {noticed && noticed !== headline && (
        <div className="mt-5 rounded-2xl bg-white/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
            🌿 What we noticed
          </p>
          <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{noticed}</p>
        </div>
      )}

      {winText && (
        <div className="mt-4 rounded-2xl bg-[#FBF4E6]/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-ink-faint)]">
            ❤️ A small win
          </p>
          <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)]">{winText}</p>
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 text-xs text-[var(--cc-ink-faint)]">
        <span aria-hidden>{emotional.emoji}</span>
        {emotional.label}
      </p>
    </article>
  );
}
