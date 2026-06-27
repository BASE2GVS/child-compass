import type { ReactNode } from "react";
import { ds } from "./tokens";
import { typeScale } from "./tokens/typography";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";
import { motion } from "./tokens/motion";

const paddingMap = { sm: "p-6", md: "p-8", lg: "p-10", xl: "p-11" } as const;

export type CardPadding = keyof typeof paddingMap;

/* ─── Hero — welcoming focal surface ─── */
export function HeroCard({
  children,
  className = "",
  padding = "xl",
  accent = "teal",
}: {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
  accent?: "teal" | "lavender" | "amber" | "coral" | "mint";
}) {
  const washes: Record<string, string> = {
    teal: "from-white/70 via-white/55 to-[var(--cc-teal-wash)]/40",
    lavender: "from-white/70 via-white/55 to-[var(--cc-lavender)]/20",
    amber: "from-white/70 via-white/55 to-[var(--cc-amber)]/18",
    coral: "from-white/70 via-white/55 to-[var(--cc-coral)]/18",
    mint: "from-white/70 via-white/55 to-[var(--cc-mint)]/25",
  };
  return (
    <div
      className={`${radius.hero} border border-white/50 bg-gradient-to-br ${washes[accent]} ${shadows.hero} backdrop-blur-xl ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Primary — main paper card ─── */
export function PrimaryCard({
  children,
  className = "",
  padding = "md",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
  interactive?: boolean;
}) {
  return (
    <div
      className={`${ds.card} ${paddingMap[padding]} ${interactive ? motion.liftCard : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Secondary — soft bordered surface ─── */
export function SecondaryCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
}) {
  return (
    <div className={`${ds.glass} ${paddingMap[padding]} ${className}`}>{children}</div>
  );
}

/* ─── Supporting — tinted whisper background ─── */
export function SupportingCard({
  children,
  className = "",
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "mint" | "lavender" | "amber";
}) {
  const tones = {
    cream: "bg-[var(--cc-cream-200)]/60 border-[var(--cc-border-soft)]",
    mint: "bg-[var(--cc-teal-wash)]/40 border-[var(--cc-teal-wash)]",
    lavender: "bg-[var(--cc-lavender)]/15 border-[var(--cc-lavender)]/30",
    amber: "bg-[var(--cc-amber)]/12 border-[var(--cc-amber)]/25",
  };
  return (
    <div className={`${radius.lg} border p-5 ${tones[tone]} ${className}`}>{children}</div>
  );
}

/* ─── Micro — compact inline card ─── */
export function MicroCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${radius.micro} border border-white/45 bg-white/55 px-4 py-3 ${shadows.paper} backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Page hero layout block ─── */
export function PageHero({
  eyebrow,
  title,
  description,
  action,
  children,
  accent = "teal",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  accent?: "teal" | "lavender" | "amber" | "coral" | "mint";
}) {
  return (
    <HeroCard accent={accent} className="flex flex-wrap items-start justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <p className={typeScale.eyebrow}>{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : ""} ${typeScale.display}`}>{title}</h1>
        {description && <p className={`mt-4 ${typeScale.bodyLarge}`}>{description}</p>}
        {children}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div>}
    </HeroCard>
  );
}
