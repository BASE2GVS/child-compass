import type { ReactNode } from "react";
import Link from "next/link";
import { ds } from "./tokens";

const paddingMap = { sm: "p-5", md: "p-7", lg: "p-9" } as const;

export function PremiumCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: keyof typeof paddingMap;
}) {
  return (
    <div className={`${ds.card} ${paddingMap[padding]} ${className}`}>{children}</div>
  );
}

export function GlassCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: keyof typeof paddingMap;
}) {
  return (
    <div className={`${ds.glass} ${paddingMap[padding]} ${className}`}>{children}</div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  accent = "#14B8A6",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <GlassCard padding="sm" className={ds.hoverLift}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F172A]" style={{ color: accent === "#14B8A6" ? undefined : accent }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
    </GlassCard>
  );
}

export function ActionTile({
  href,
  title,
  description,
  icon,
  onClick,
}: {
  href?: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const className = `group block rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm ${ds.hoverLift} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40`;
  const inner = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] transition-transform group-hover:scale-110 motion-reduce:transform-none">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-[#0F172A] group-hover:text-[#14B8A6]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{description}</p>
    </>
  );
  if (href) return <Link href={href} className={className}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className={`${className} w-full text-left`}>
      {inner}
    </button>
  );
}

export function ReportCard({
  title,
  summary,
  lastGenerated,
  href,
  actions,
}: {
  title: string;
  summary: string;
  lastGenerated?: string;
  href: string;
  actions?: ReactNode;
}) {
  return (
    <article className={`overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.05)] ${ds.hoverLift}`}>
      <div className="h-24 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B8A6]">Report</p>
        <p className="mt-2 line-clamp-2 text-sm text-white/90">{summary}</p>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-[#0F172A]">{title}</h3>
        {lastGenerated && (
          <p className="mt-1 text-xs text-[#94A3B8]">Last generated {lastGenerated}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={href} className="rounded-xl bg-[#14B8A6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D9488]">
            Preview report
          </Link>
          {actions}
        </div>
      </div>
    </article>
  );
}

export function TimelineCard({
  emoji,
  label,
  summary,
  time,
  bg,
  border,
}: {
  emoji: string;
  label: string;
  summary: string;
  time: string;
  bg: string;
  border: string;
}) {
  return (
    <article className={`rounded-[24px] border ${border} ${bg} p-5 ${ds.hoverLift}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#0F172A]">{label}</span>
            <time className="text-[11px] text-[#94A3B8]">{time}</time>
          </div>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#64748B]">{summary}</p>
        </div>
      </div>
    </article>
  );
}

export function AIInsightCard({
  title,
  content,
  confidence,
  accent = "#14B8A6",
}: {
  title: string;
  content: string;
  confidence?: number;
  accent?: string;
}) {
  const pct = confidence ? Math.round(confidence * 100) : null;
  return (
    <GlassCard padding="sm" className={ds.hoverLift}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-[#0F172A]">{title}</h3>
        {pct != null && (
          <span className="shrink-0 rounded-full bg-[#FAF8F4] px-2.5 py-1 text-[10px] font-bold uppercase text-[#94A3B8]">
            {pct}% confidence
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{content}</p>
      {pct != null && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#F1EDE6]">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
      )}
    </GlassCard>
  );
}
