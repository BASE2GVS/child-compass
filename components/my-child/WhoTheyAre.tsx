type ChipCategory = {
  emoji: string;
  label: string;
  items: string[];
  tint: string;
};

type WhoTheyAreProps = {
  childName: string;
  categories: ChipCategory[];
};

export default function WhoTheyAre({ childName, categories }: WhoTheyAreProps) {
  const filled = categories.filter((c) => c.items.length > 0);
  if (filled.length === 0) {
    return (
      <section
        className="rounded-[1.75rem] border border-[var(--cc-border-soft)] bg-[var(--cc-paper-elevated)] p-8 shadow-[0_2px_12px_rgba(45,42,38,0.04)] sm:p-10"
        aria-labelledby="who-they-are-heading"
      >
        <h2 id="who-they-are-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
          Who {childName} is
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--cc-ink-muted)]">
          As you add strengths, interests, and what helps — they&apos;ll appear here as a beautiful portrait of who{" "}
          {childName} is.
        </p>
        <p className="mt-3 text-sm text-[var(--cc-ink-faint)]">
          Edit profile to add what makes {childName} unique.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="who-they-are-heading">
      <h2 id="who-they-are-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        Who {childName} is
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">
        The things that make {childName} who they are — not statistics, just your family&apos;s story.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {filled.map((cat) => (
          <div
            key={cat.label}
            className={`rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(45,42,38,0.04)] ${cat.tint}`}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--cc-ink)]">
              <span className="text-xl" aria-hidden>
                {cat.emoji}
              </span>
              {cat.label}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[var(--cc-ink-soft)] shadow-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function buildWhoTheyAreCategories(
  strengths: string[],
  calmingStrategies: string[],
  successfulStrategies: string[],
  interests: string[],
  favouriteThings: string[],
  favouriteActivities: string[],
): ChipCategory[] {
  const joy = [...new Set([...favouriteThings, ...interests, ...favouriteActivities])];
  const whatHelps = [...new Set([...calmingStrategies, ...successfulStrategies])];

  return [
    { emoji: "❤️", label: "Strengths", items: strengths, tint: "bg-[#FBEFEC]/60" },
    { emoji: "🌿", label: "What helps", items: whatHelps, tint: "bg-[#E8F6F3]/70" },
    { emoji: "🌈", label: "Joy", items: joy, tint: "bg-[#F3EFFA]/60" },
    { emoji: "⭐", label: "Interests", items: interests, tint: "bg-[#FBF4E6]/70" },
    {
      emoji: "☀️",
      label: "Superpowers",
      items: strengths.slice(0, 3),
      tint: "bg-[#FDF6E8]/80",
    },
  ];
}
