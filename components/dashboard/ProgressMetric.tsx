type ProgressMetricProps = {
  label: string;
  value: number;
  colour: string;
  delay?: number;
};

export default function ProgressMetric({ label, value, colour, delay = 0 }: ProgressMetricProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[#0F172A]">{label}</span>
        <span className="font-bold tabular-nums text-[#64748B]" aria-hidden="true">
          {clamped}%
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#F1EDE6]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{
            width: `${clamped}%`,
            backgroundColor: colour,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}
