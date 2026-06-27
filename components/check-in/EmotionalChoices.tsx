import type { ScaleOption } from "@/components/check-in/check-in-steps";

type EmotionalChoicesProps = {
  options: ScaleOption[];
  value: number;
  onChange: (value: number) => void;
  groupLabel: string;
  disabled?: boolean;
};

export default function EmotionalChoices({
  options,
  value,
  onChange,
  groupLabel,
  disabled = false,
}: EmotionalChoicesProps) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="mt-8 grid gap-3 sm:grid-cols-2"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex min-h-[4.5rem] items-center gap-4 rounded-[1.25rem] p-4 text-left shadow-[0_2px_12px_rgba(45,42,38,0.04)] ring-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)] disabled:opacity-50 motion-reduce:transition-none ${option.tint} ${
              selected
                ? `ring-2 ${option.ring} -translate-y-0.5 shadow-[0_8px_24px_rgba(45,42,38,0.08)]`
                : "ring-transparent hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,42,38,0.06)]"
            }`}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden>
              {option.emoji}
            </span>
            <span className="text-base font-semibold leading-snug text-[var(--cc-ink)] sm:text-lg">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
