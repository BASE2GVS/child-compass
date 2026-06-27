import type { JourneyStep } from "@/lib/companion/day-journey";

const STEP_ICONS: Record<string, string> = {
  morning: "☀️",
  checkin: "✓",
  conversation: "💬",
  understanding: "✨",
  reflection: "🌙",
};

/** Horizontal journey — flows directly under the story */
export default function DayJourneyStrip({ steps }: { steps: JourneyStep[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <section className="relative mt-6 border-t border-[var(--cc-border-soft)]/45 pt-5" aria-label="Today's journey">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--cc-teal)]">Today&apos;s journey</p>
          <p className="mt-0.5 font-display text-2xl font-semibold text-[var(--cc-ink)]">
            {doneCount} of {steps.length} moments
          </p>
        </div>
      </div>

      <div className="relative mt-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <svg
          className="pointer-events-none absolute left-6 right-6 top-[1.6rem] hidden h-6 sm:block"
          viewBox="0 0 800 24"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 16 Q200 4 400 14 T800 12"
            stroke="url(#journey-stroke)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          <defs>
            <linearGradient id="journey-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8C47A" />
              <stop offset="50%" stopColor="#5BB5A8" />
              <stop offset="100%" stopColor="#C9B8E0" />
            </linearGradient>
          </defs>
        </svg>

        <ol className="relative flex min-w-max gap-4 px-1 sm:gap-8">
          {steps.map((step) => {
            const icon = STEP_ICONS[step.id] ?? "•";
            const isDone = step.status === "done";
            const isCurrent = step.status === "current";

            return (
              <li
                key={step.id}
                className={`flex w-[7.5rem] shrink-0 flex-col items-center text-center sm:w-[8.5rem] ${
                  isCurrent ? "scale-[1.03]" : ""
                } transition-transform duration-300 motion-reduce:transition-none`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-md transition-all sm:h-[3.25rem] sm:w-[3.25rem] ${
                    isDone
                      ? "bg-[var(--cc-teal)] text-white shadow-[0_4px_16px_var(--cc-teal-glow)]"
                      : isCurrent
                        ? "bg-white/90 text-[var(--cc-ink)] ring-2 ring-[var(--cc-teal)]/35"
                        : "bg-white/45 text-[var(--cc-ink-faint)]"
                  }`}
                >
                  <span aria-hidden>{icon}</span>
                </div>
                <p
                  className={`mt-2.5 text-sm leading-tight ${
                    isCurrent
                      ? "font-semibold text-[var(--cc-ink)]"
                      : isDone
                        ? "font-medium text-[var(--cc-ink-muted)]"
                      : "text-[var(--cc-ink-faint)]"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--cc-teal-deep)]">You are here</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
