import { typeScale } from "./tokens/typography";

export function ProgressBar({
  label,
  value,
  colour = "var(--cc-teal)",
  delay = 0,
}: {
  label: string;
  value: number;
  colour?: string;
  delay?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className={`font-medium ${typeScale.caption} !text-[var(--cc-ink)]`}>{label}</span>
        <span className="font-semibold tabular-nums text-[var(--cc-ink-muted)]">{clamped}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--cc-cream-200)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: `${clamped}%`, backgroundColor: colour, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  label,
  value,
  colour = "var(--cc-teal)",
  size = 96,
  showValue = true,
}: {
  label: string;
  value: number;
  colour?: string;
  size?: number;
  showValue?: boolean;
}) {
  const radiusPx = (size - 12) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const centre = size / 2;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${label} ${clamped} percent`}>
          <circle cx={centre} cy={centre} r={radiusPx} stroke="var(--cc-cream-200)" strokeWidth="8" fill="none" />
          <circle
            cx={centre}
            cy={centre}
            r={radiusPx}
            stroke={colour}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out motion-reduce:transition-none"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-xl font-semibold tabular-nums text-[var(--cc-ink)]">{clamped}%</span>
          </div>
        )}
      </div>
      <p className={`mt-3 max-w-[8rem] ${typeScale.micro} font-semibold`}>{label}</p>
    </div>
  );
}

export function StepProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <span className={typeScale.caption}>{label}</span>
          <span className={typeScale.micro}>
            Step {current} of {total}
          </span>
        </div>
      )}
      <ProgressBar label={label ?? "Progress"} value={pct} />
    </div>
  );
}
