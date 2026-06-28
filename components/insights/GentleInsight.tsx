type GentleInsightProps = {
  insight: {
    displayText: string;
    confidenceLabel: string;
    supportingEvents?: { label: string; date?: string }[];
  };
  compact?: boolean;
};

export default function GentleInsight({ insight, compact = false }: GentleInsightProps) {
  if (compact) {
    return (
      <p className="text-base leading-relaxed text-[var(--cc-ink-soft)]">
        {insight.displayText}{" "}
        <span className="text-[var(--cc-ink-muted)]">{insight.confidenceLabel}</span>
      </p>
    );
  }

  return (
    <article className="rounded-[1.25rem] border border-[var(--cc-border-soft)]/80 bg-white/45 px-5 py-4 backdrop-blur-sm">
      <p className="text-base leading-relaxed text-[var(--cc-ink)]">{insight.displayText}</p>
      <p className="mt-2 text-sm text-[var(--cc-ink-muted)]">{insight.confidenceLabel}</p>
      {insight.supportingEvents && insight.supportingEvents.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-[var(--cc-border-soft)]/60 pt-3 text-sm text-[var(--cc-ink-muted)]">
          {insight.supportingEvents.slice(0, 3).map((event, i) => (
            <li key={`${event.label}-${i}`}>
              {event.date ? `${event.date} — ` : ""}
              {event.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
