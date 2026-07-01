import type { JourneyStep } from "@/lib/companion/day-journey";

const STEP_ICONS: Record<string, string> = {
  morning: "☀️",
  checkin: "✓",
  conversation: "💬",
  understanding: "✨",
  reflection: "🌙",
};

export default function DayJourney({ steps }: { steps: JourneyStep[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const progressPct = Math.round((doneCount / steps.length) * 100);

  return (
    <section
      className="rounded-[1.75rem] border border-white/58 bg-gradient-to-b from-white/62 to-[#F0F5EE]/40 p-8 shadow-[0_8px_28px_rgba(45,42,38,0.07)] backdrop-blur-xl sm:p-10"
      aria-label="Today's journey"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]">
            Today&apos;s journey
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-[var(--cc-ink)]">
            {doneCount} of {steps.length} moments
          </p>
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--cc-cream-200)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--cc-teal)] to-[#A8D5CC] transition-all duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Journey progress ${progressPct} percent`}
          />
        </div>
      </div>

      <ol className="relative mt-10 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const icon = STEP_ICONS[step.id] ?? "•";
          return (
            <li key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-7 top-14 bottom-0 w-0.5 ${
                    step.status === "done"
                      ? "bg-gradient-to-b from-[var(--cc-teal)] to-[#A8D5CC]/40"
                      : "bg-[var(--cc-cream-200)]"
                  }`}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm transition-all duration-300 ${
                  step.status === "done"
                    ? "bg-[var(--cc-teal)] text-white shadow-[0_4px_16px_var(--cc-teal-glow)]"
                    : step.status === "current"
                      ? "bg-[var(--cc-paper-elevated)] ring-4 ring-[var(--cc-teal-wash)] animate-cc-breathe motion-reduce:animate-none"
                      : "bg-[var(--cc-cream-100)] text-[var(--cc-ink-faint)]"
                }`}
              >
                <span aria-hidden="true">{icon}</span>
              </div>
              <div className="min-w-0 pt-3">
                <p
                  className={`font-display text-lg ${
                    step.status === "current"
                      ? "font-semibold text-[var(--cc-ink)]"
                      : step.status === "done"
                        ? "font-medium text-[var(--cc-ink-muted)]"
                        : "text-[var(--cc-ink-faint)]"
                  }`}
                >
                  {step.label}
                </p>
                {step.status === "current" && (
                  <p className="mt-1 text-sm text-[var(--cc-teal-deep)]">You are here</p>
                )}
                {step.status === "done" && (
                  <p className="mt-1 text-sm text-[var(--cc-ink-faint)]">Done</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
