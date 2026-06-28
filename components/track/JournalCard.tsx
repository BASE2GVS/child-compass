import { categoryMeta } from "@/lib/timeline/categories";
import { presentTimelineEntry } from "@/lib/timeline/presentation";
import { dayTypeLabel } from "@/lib/timeline/day-type";
import type { UnifiedTimelineItem } from "@/lib/types/database";

const WARM_TINTS: Record<string, string> = {
  "bg-[#E8F0FA]": "from-[#E8F0FA]/80 to-[#FFFCF8]",
  "bg-[#F3EFFA]": "from-[#F3EFFA]/70 to-[#FFFCF8]",
  "bg-[#FBEFEC]": "from-[#FBEFEC]/60 to-[#FFFCF8]",
  "bg-[#E8F6F3]": "from-[#E8F6F3]/80 to-[#FFFCF8]",
  "bg-[#FBF4E6]": "from-[#FBF4E6]/70 to-[#FFFCF8]",
  "bg-[#F5F0E8]": "from-[#F5F0E8]/70 to-[#FFFCF8]",
  "bg-[#EEF5F0]": "from-[#EEF5F0]/70 to-[#FFFCF8]",
  "bg-[#F0F5EE]": "from-[#F0F5EE]/70 to-[#FFFCF8]",
  "bg-[#FAF8F4]": "from-[#FAF8F4]/80 to-[#FFFCF8]",
};

type JournalCardProps = {
  event: UnifiedTimelineItem;
  index: number;
  childName?: string;
};

export default function JournalCard({ event, index, childName }: JournalCardProps) {
  const meta = categoryMeta(event.category);
  const presentation = presentTimelineEntry(event, childName);
  const gradient = WARM_TINTS[meta.tint] ?? "from-[#FFFCF8] to-[#FAF8F4]";

  const timeLabel = new Date(event.event_date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`animate-cc-fade-up rounded-[1.5rem] bg-gradient-to-br ${gradient} p-6 shadow-[0_2px_16px_rgba(45,42,38,0.05)] ring-1 ${meta.ring}/60 motion-reduce:animate-none sm:p-7`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--cc-teal-deep)]">
          <span aria-hidden>{presentation.categoryEmoji}</span>
          {presentation.categoryLabel}
        </p>
        <time className="text-xs text-[var(--cc-ink-faint)]" dateTime={event.event_date}>
          {timeLabel}
        </time>
      </div>

      <p className="mt-4 font-display text-xl font-medium leading-snug text-[var(--cc-ink)] sm:text-2xl">
        {presentation.headline}
      </p>

      {presentation.dayContext && (
        <p className="mt-3 text-sm italic text-[var(--cc-ink-muted)]">{presentation.dayContext}</p>
      )}

      {presentation.lines.length > 0 && (
        <ul className="mt-5 space-y-2 rounded-2xl bg-white/50 px-4 py-3">
          {presentation.lines.map((line, i) => (
            <li key={i} className="text-base leading-relaxed text-[var(--cc-ink-soft)]">
              {line}
            </li>
          ))}
        </ul>
      )}

      {presentation.dayTypeLabel && (
        <p className="mt-4 text-xs text-[var(--cc-ink-faint)]">{presentation.dayTypeLabel}</p>
      )}
    </article>
  );
}

export function groupTimelineDays(events: UnifiedTimelineItem[]) {
  const groups = new Map<string, { label: string; dayType: string | null; events: UnifiedTimelineItem[] }>();

  for (const event of events) {
    const d = new Date(event.event_date);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(event);
      if (!existing.dayType && event.day_type) {
        existing.dayType = dayTypeLabel(event.day_type);
      }
    } else {
      groups.set(key, {
        label,
        dayType: dayTypeLabel(event.day_type),
        events: [event],
      });
    }
  }

  return Array.from(groups.values());
}
