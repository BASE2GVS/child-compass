import AppCard from "@/components/app/AppCard";

function gaugeColor(value: number): string {
  if (value >= 75) return "#14B8A6";
  if (value >= 45) return "#F59E0B";
  return "#EF4444";
}

export default function GaugeCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta?: number;
}) {
  const color = gaugeColor(value);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <AppCard className="flex flex-col items-center justify-center text-center" padding="sm">
      <svg width="96" height="96" viewBox="0 0 96 96" className="mb-2">
        <circle cx="48" cy="48" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="53" textAnchor="middle" className="fill-slate-900 text-sm font-bold">
          {value}%
        </text>
      </svg>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {typeof delta === "number" && (
        <p className={`mt-1 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} this week
        </p>
      )}
    </AppCard>
  );
}
