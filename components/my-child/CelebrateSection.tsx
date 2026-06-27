type CelebrateItem = {
  emoji: string;
  message: string;
};

type CelebrateSectionProps = {
  childName: string;
  items: CelebrateItem[];
};

export default function CelebrateSection({ childName, items }: CelebrateSectionProps) {
  return (
    <section
      className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#FDF6E8] via-[#FFFCF8] to-[#E8F6F3]/60 p-8 shadow-[0_4px_24px_rgba(45,42,38,0.06)] sm:p-10"
      aria-labelledby="celebrate-heading"
    >
      <h2 id="celebrate-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        Celebrate
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">
        Progress worth noticing — no trophies, just honest encouragement.
      </p>

      <ul className="mt-8 space-y-4">
        {items.map((item, i) => (
          <li
            key={`${item.message}-${i}`}
            className="flex items-start gap-4 rounded-[1.25rem] bg-white/60 px-5 py-4 shadow-sm"
          >
            <span className="text-2xl" aria-hidden>
              {item.emoji}
            </span>
            <p className="text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">{item.message}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm italic text-[var(--cc-teal-deep)]">
        You&apos;re doing something beautiful for {childName} — showing up, day after day.
      </p>
    </section>
  );
}

/** Presentation-only: soften celebration copy for parents */
export function gentleCelebrations(
  raw: { emoji: string; message: string }[],
  childName: string,
): CelebrateItem[] {
  const softened = raw.map((c) => {
    let msg = c.message
      .replace(/Child Compass now understands/gi, "We're understanding")
      .replace(/\d+ check-ins completed/gi, "You've been showing up")
      .replace(/Five check-ins/gi, "Your steady presence");

    if (msg.includes("understands") && msg.includes("much more clearly")) {
      msg = `${childName}'s story is becoming clearer — because you keep noticing.`;
      return { emoji: "✨", message: msg };
    }

    return { emoji: c.emoji, message: msg };
  });

  return softened.slice(0, 4);
}
