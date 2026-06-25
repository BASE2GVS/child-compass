import type { ReactNode } from "react";

type ProgressRingProps = {
  label: string;
  value: number;
  icon: ReactNode;
  colour?: string;
  size?: number;
};

export default function ProgressRing({
  label,
  value,
  icon,
  colour = "#14B8A6",
  size = 88,
}: ProgressRingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const centre = size / 2;

  return (
    <div className="group flex flex-col items-center text-center">
      <div className="relative transition-transform duration-500 ease-out group-hover:scale-105">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke="#E8E4DC"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke={colour}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-[#0F172A]"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="text-[#64748B]">{icon}</span>
          <span className="text-sm font-bold tabular-nums">{clamped}%</span>
        </div>
      </div>
      <p className="mt-3 max-w-[7rem] text-xs font-semibold leading-snug text-[#475569]">{label}</p>
    </div>
  );
}
