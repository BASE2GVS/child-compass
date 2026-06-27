import type { EveningReflection } from "@/lib/companion/evening-reflection";

/** Evening reflection — sits on the background, no container */
export default function EveningReflectionSection({
  reflection,
  childName,
}: {
  reflection: EveningReflection;
  childName: string;
}) {
  return (
    <section className="today-paper relative z-10 mt-6 px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="evening-reflection-heading">
      <h2
        id="evening-reflection-heading"
        className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-tight text-[var(--cc-ink)]"
      >
        A quiet moment for {childName} and you
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">Evening reflection</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
        <div>
          <p className="text-sm font-medium text-[var(--cc-ink-faint)]">Learned</p>
          <p className="mt-2 font-display text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">
            {reflection.learned}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--cc-teal)]">Encouraging</p>
          <p className="mt-2 font-display text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">
            {reflection.encouraging}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[#B8954A]">Tomorrow</p>
          <p className="mt-2 font-display text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">
            {reflection.tomorrowMind}
          </p>
        </div>
      </div>
    </section>
  );
}
