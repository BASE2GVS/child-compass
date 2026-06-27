import type { ReactNode } from "react";
import Link from "next/link";
import { ds } from "./tokens";
import { typeScale } from "./tokens/typography";
import { motion } from "./tokens/motion";
import { PrimaryCard, SecondaryCard } from "./hero";

export {
  HeroCard,
  PrimaryCard,
  SecondaryCard,
  SupportingCard,
  MicroCard,
  PageHero,
} from "./hero";

/** @deprecated use PrimaryCard */
export function PremiumCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}) {
  return (
    <PrimaryCard className={className} padding={padding}>
      {children}
    </PrimaryCard>
  );
}

/** @deprecated use SecondaryCard */
export function GlassCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}) {
  return (
    <SecondaryCard className={className} padding={padding}>
      {children}
    </SecondaryCard>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  accent = "var(--cc-teal)",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <SecondaryCard padding="sm" className={motion.liftCard}>
      <p className={typeScale.micro}>{label}</p>
      <p
        className="mt-2 font-display text-2xl font-semibold text-[var(--cc-ink)]"
        style={accent !== "var(--cc-teal)" ? { color: accent } : undefined}
      >
        {value}
      </p>
      {hint && <p className={`mt-1 ${typeScale.caption}`}>{hint}</p>}
    </SecondaryCard>
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
  const className = `group block rounded-[1.75rem] border border-[var(--cc-border-soft)] bg-[var(--cc-paper)]/95 p-6 shadow-[0_2px_8px_rgba(45,42,38,0.04)] backdrop-blur-sm ${motion.liftCard} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]/30`;
  const inner = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cc-teal-wash)] text-[var(--cc-teal)] transition-transform group-hover:scale-105 motion-reduce:transform-none">
        {icon}
      </div>
      <h3 className={`mt-4 ${typeScale.cardTitle} group-hover:text-[var(--cc-teal)]`}>{title}</h3>
      <p className={`mt-2 ${typeScale.caption}`}>{description}</p>
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
    <article className={`overflow-hidden rounded-[1.75rem] border border-[var(--cc-border-soft)] bg-[var(--cc-paper)] ${motion.liftCard}`}>
      <div className="bg-gradient-to-br from-[var(--cc-teal-deep)] to-[var(--cc-teal)] p-5">
        <p className={typeScale.eyebrow}>Summary</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/90">{summary}</p>
      </div>
      <div className="p-5">
        <h3 className={typeScale.cardTitle}>{title}</h3>
        {lastGenerated && (
          <p className={`mt-1 ${typeScale.micro}`}>Last shared {lastGenerated}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={href} className={ds.btnPrimary + " !min-h-10 !px-4 !py-2.5 !text-xs"}>
            Preview
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
    <article className={`rounded-3xl border ${border} ${bg} p-5 ${motion.liftCard}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={typeScale.subheading}>{label}</span>
            <time className={typeScale.micro}>{time}</time>
          </div>
          <p className={`mt-1 line-clamp-3 ${typeScale.caption}`}>{summary}</p>
        </div>
      </div>
    </article>
  );
}

export function AIInsightCard({
  title,
  content,
  confidence,
  accent = "var(--cc-teal)",
}: {
  title: string;
  content: string;
  confidence?: number;
  accent?: string;
}) {
  const pct = confidence ? Math.round(confidence * 100) : null;
  return (
    <SecondaryCard padding="sm" className={motion.liftCard}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={typeScale.cardTitle}>{title}</h3>
        {pct != null && (
          <span className={`shrink-0 rounded-full bg-[var(--cc-cream-100)] px-2.5 py-1 ${typeScale.micro}`}>
            {pct}% sure
          </span>
        )}
      </div>
      <p className={`mt-2 ${typeScale.caption}`}>{content}</p>
      {pct != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--cc-cream-200)]">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
      )}
    </SecondaryCard>
  );
}
