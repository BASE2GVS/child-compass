import Link from "next/link";
import type { CSSProperties } from "react";
import { EditorialIllustration, type IllustrationName } from "./illustrations";
import { ds } from "./tokens";

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  why,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: {
  icon?: string;
  illustration?: IllustrationName;
  title: string;
  description: string;
  why: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}) {
  return (
    <div className={`flex flex-col items-center ${ds.glass} px-6 py-12 text-center sm:px-10 sm:py-14 animate-fade-in`}>
      {illustration ? (
        <EditorialIllustration name={illustration} className="mx-auto" />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#14B8A6]/15 via-white to-indigo-100/50 text-5xl shadow-inner"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h2 className="mt-6 text-2xl font-bold text-[#0F172A]">{title}</h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-[#64748B]">{description}</p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[#94A3B8]">{why}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href={actionHref} className={ds.btnPrimary}>
          {actionLabel}
        </Link>
        {secondaryActionLabel && secondaryActionHref && (
          <Link href={secondaryActionHref} className={ds.btnSecondary}>
            {secondaryActionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function ShimmerBlock({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-shimmer rounded-2xl bg-gradient-to-r from-[#E8E4DC]/50 via-[#F5F2EC]/80 to-[#E8E4DC]/50 bg-[length:200%_100%] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonLoader({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <ShimmerBlock className={className} style={style} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className={`${ds.glass} p-7`}>
      <ShimmerBlock className="mb-4 h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBlock key={i} className="mb-2 h-3" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className={`${ds.glass} p-7`}>
      <ShimmerBlock className="mb-6 h-4 w-1/4" />
      <div className="flex h-32 items-end gap-3">
        {[40, 65, 50, 80, 55, 70].map((h, i) => (
          <ShimmerBlock key={i} className="flex-1 rounded-t-xl" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className={`${ds.glass} overflow-hidden`}>
      <ShimmerBlock className="h-28 rounded-none" />
      <div className="space-y-3 p-6">
        <ShimmerBlock className="h-5 w-2/3" />
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-10 animate-fade-in" aria-busy="true" aria-label="Loading page">
      <div>
        <ShimmerBlock className="mb-3 h-10 w-1/2 max-w-md" />
        <ShimmerBlock className="h-4 w-1/3 max-w-xs" />
      </div>
      <SkeletonCard lines={4} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function ProgressBar({
  label,
  value,
  colour = "#14B8A6",
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
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[#0F172A]">{label}</span>
        <span className="font-bold tabular-nums text-[#64748B]">{clamped}%</span>
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
          style={{ width: `${clamped}%`, backgroundColor: colour, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  label,
  value,
  colour = "#14B8A6",
  size = 96,
  showValue = true,
}: {
  label: string;
  value: number;
  colour?: string;
  size?: number;
  showValue?: boolean;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const centre = size / 2;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${label} ${clamped} percent`}>
          <circle cx={centre} cy={centre} r={radius} stroke="#F1EDE6" strokeWidth="8" fill="none" />
          <circle
            cx={centre}
            cy={centre}
            r={radius}
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
            <span className="text-xl font-bold tabular-nums text-[#0F172A]">{clamped}%</span>
          </div>
        )}
      </div>
      <p className="mt-3 max-w-[8rem] text-xs font-semibold text-[#64748B]">{label}</p>
    </div>
  );
}
