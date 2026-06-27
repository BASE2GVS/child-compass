import { JOURNEY_PHASES, type JourneyPhase } from "@/components/check-in/check-in-steps";

type CheckInJourneyProps = {
  currentPhase: JourneyPhase;
};

export default function CheckInJourney({ currentPhase }: CheckInJourneyProps) {
  const currentIndex = JOURNEY_PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <nav aria-label="Today's journey" className="px-1">
      <ol className="flex items-start justify-between gap-0.5 sm:gap-2">
        {JOURNEY_PHASES.map((phase, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={phase.id} className="relative flex flex-1 flex-col items-center">
              {index > 0 && (
                <div
                  className={`absolute right-1/2 top-5 hidden h-0.5 w-full -translate-y-1/2 sm:block ${
                    isPast || isCurrent ? "bg-[var(--cc-teal-soft)]" : "bg-[#E8E4DC]"
                  }`}
                  style={{ width: "100%", left: "-50%" }}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl text-base transition-all duration-300 sm:h-11 sm:w-11 sm:text-lg ${
                  isCurrent
                    ? "bg-gradient-to-br from-[var(--cc-teal)] to-[var(--cc-teal-deep)] text-white shadow-[0_4px_16px_var(--cc-teal-glow)]"
                    : isPast
                      ? "bg-[var(--cc-teal-wash)] text-[var(--cc-teal-deep)]"
                      : "bg-[#F5F1EA] text-[var(--cc-ink-faint)]"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span aria-hidden>{phase.icon}</span>
              </div>
              <p
                className={`mt-2 hidden text-center text-[10px] font-semibold leading-tight sm:block sm:text-xs ${
                  isCurrent
                    ? "text-[var(--cc-teal-deep)]"
                    : isPast
                      ? "text-[var(--cc-ink-muted)]"
                      : "text-[var(--cc-ink-faint)]"
                }`}
              >
                {phase.label}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-center text-xs text-[var(--cc-ink-faint)] sm:hidden">
        <span className="font-medium text-[var(--cc-teal-deep)]">
          {JOURNEY_PHASES[currentIndex]?.icon} {JOURNEY_PHASES[currentIndex]?.label}
        </span>
      </p>
    </nav>
  );
}
