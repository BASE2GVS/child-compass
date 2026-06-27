type UnderstandingArea = {
  id: string;
  heading: string;
  observation: string;
  fill: number;
  tint: string;
};

type UnderstandingSectionProps = {
  childName: string;
  areas: UnderstandingArea[];
};

export default function UnderstandingSection({ childName, areas }: UnderstandingSectionProps) {
  return (
    <section aria-labelledby="understanding-heading">
      <h2 id="understanding-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        Understanding {childName}
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">
        What we&apos;re learning together — gently, never rushed.
      </p>

      <div className="mt-8 space-y-5">
        {areas.map((area) => (
          <article
            key={area.id}
            className={`rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(45,42,38,0.04)] ${area.tint}`}
          >
            <p className="text-sm font-semibold text-[var(--cc-teal-deep)]">{area.heading}</p>
            <p className="mt-2 text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">
              {area.observation}
            </p>
            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-white/60"
              role="progressbar"
              aria-valuenow={area.fill}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={area.heading}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--cc-teal-soft)] to-[var(--cc-teal)] transition-all duration-700 motion-reduce:transition-none"
                style={{ width: `${area.fill}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function buildUnderstandingAreas(
  childName: string,
  checkinCount: number,
  patternCount: number,
  intelligence: {
    emotionalState: number;
    recoveryTrend: number;
    currentRegulation: number;
  },
  topPattern: string | null,
): UnderstandingArea[] {
  const depth = Math.min(100, Math.round((checkinCount / 14) * 60 + patternCount * 8 + 20));

  const moodFill = Math.min(100, Math.max(20, intelligence.emotionalState));
  const recoveryFill = Math.min(100, Math.max(20, intelligence.recoveryTrend));
  const rhythmFill = Math.min(100, Math.max(15, depth));

  const moodHeading =
    checkinCount < 3
      ? "We're beginning to understand…"
      : checkinCount < 7
        ? "We're still learning…"
        : "One thing we've noticed…";

  const moodObservation =
    checkinCount < 3
      ? `${childName}'s emotional rhythms will become clearer as you check in together.`
      : checkinCount < 7
        ? `Mood patterns are starting to emerge — we're learning what a typical day feels like for ${childName}.`
        : topPattern ||
          `${childName}'s feelings tend to shift around transitions — mornings and after school are worth watching gently.`;

  const recoveryHeading =
    intelligence.recoveryTrend >= 60 ? "One thing we've noticed…" : "We're still learning…";

  const recoveryObservation =
    intelligence.recoveryTrend >= 60
      ? `${childName} seems to recover more quickly after quiet time lately.`
      : `We're learning how ${childName} finds calm again after difficult moments.`;

  const rhythmHeading = depth >= 60 ? "Growing understanding" : "We're beginning to understand…";

  const rhythmObservation =
    depth >= 60
      ? `Your family's story with ${childName} is becoming richer — each day adds another gentle chapter.`
      : `Every check-in helps us understand ${childName} a little more deeply.`;

  return [
    {
      id: "mood",
      heading: moodHeading,
      observation: moodObservation,
      fill: moodFill,
      tint: "bg-[#F3EFFA]/50",
    },
    {
      id: "recovery",
      heading: recoveryHeading,
      observation: recoveryObservation,
      fill: recoveryFill,
      tint: "bg-[#E8F6F3]/60",
    },
    {
      id: "rhythm",
      heading: rhythmHeading,
      observation: rhythmObservation,
      fill: rhythmFill,
      tint: "bg-[#FDF6E8]/70",
    },
  ];
}
