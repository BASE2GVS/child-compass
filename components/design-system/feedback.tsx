import Link from "next/link";
import type { CSSProperties } from "react";
import { EditorialIllustration, type IllustrationName } from "./illustrations";
import { ds } from "./tokens";
import { typeScale } from "./tokens/typography";
import { motion } from "./tokens/motion";
import { radius } from "./tokens/radius";
import { SecondaryCard } from "./hero";

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  why,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  illustration?: IllustrationName;
  title: string;
  description: string;
  why?: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className={`cc-fw-empty flex flex-col items-center ${motion.fadeUp} px-6 py-12 text-center sm:px-10 sm:py-14`}>
      <SecondaryCard padding="lg" className="w-full max-w-lg">
        {illustration ? (
          <EditorialIllustration name={illustration} className="mx-auto animate-cc-breathe motion-reduce:animate-none" />
        ) : (
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center ${radius.xl} bg-gradient-to-br from-[var(--cc-teal-wash)] via-[var(--cc-paper)] to-[var(--cc-lavender)]/30 text-5xl ${ds.hoverLift}`}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <h2 className={`mt-6 ${typeScale.heading}`}>{title}</h2>
        <p className={`mt-3 ${typeScale.body}`}>{description}</p>
        {why ? <p className={`mt-4 ${typeScale.caption}`}>{why}</p> : null}
        <div className="mt-8">
          <Link href={actionHref} className={`${ds.btnPill} cc-fw-btn-md`}>
            {actionLabel}
          </Link>
        </div>
      </SecondaryCard>
    </div>
  );
}

/** Premium warm shimmer — alive, not generic grey blocks */
export function ShimmerBlock({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-cc-shimmer rounded-2xl bg-gradient-to-r from-[var(--cc-cream-200)]/80 via-[var(--cc-paper)] to-[var(--cc-cream-200)]/80 bg-[length:200%_100%] ${className}`}
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
    <SecondaryCard padding="md">
      <ShimmerBlock className="mb-4 h-5 w-1/3 rounded-xl" />
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBlock key={i} className="mb-2.5 h-3.5 rounded-lg" style={{ width: `${92 - i * 14}%` }} />
      ))}
    </SecondaryCard>
  );
}

export function SkeletonChart() {
  return (
    <SecondaryCard padding="md">
      <ShimmerBlock className="mb-6 h-4 w-1/4 rounded-lg" />
      <div className="flex h-32 items-end gap-3">
        {[38, 62, 48, 72, 52, 66].map((h, i) => (
          <ShimmerBlock key={i} className="flex-1 rounded-t-xl" style={{ height: `${h}%` }} />
        ))}
      </div>
    </SecondaryCard>
  );
}

export function SkeletonReport() {
  return (
    <SecondaryCard padding="sm" className="overflow-hidden !p-0">
      <ShimmerBlock className="h-28 rounded-none" />
      <div className="space-y-3 p-6">
        <ShimmerBlock className="h-5 w-2/3 rounded-lg" />
        <ShimmerBlock className="h-3 w-full rounded-lg" />
        <ShimmerBlock className="h-3 w-4/5 rounded-lg" />
      </div>
    </SecondaryCard>
  );
}

export function SkeletonPage({ label = "Getting everything ready…" }: { label?: string }) {
  return (
    <div className="space-y-10 animate-cc-fade-in" aria-busy="true" aria-label={label}>
      <p className="cc-fw-loading-label">{label}</p>
      <div>
        <ShimmerBlock className="mb-4 h-11 w-1/2 max-w-md rounded-xl" />
        <ShimmerBlock className="h-4 w-1/3 max-w-xs rounded-lg" />
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

export function LoadingPulse({ label = "Just a moment…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12" role="status" aria-live="polite">
      <ShimmerBlock className="h-12 w-12 rounded-full motion-reduce:animate-none" />
      <p className="cc-fw-loading-label">{label}</p>
    </div>
  );
}

export { ProgressBar, ProgressRing, StepProgress } from "./progress";
