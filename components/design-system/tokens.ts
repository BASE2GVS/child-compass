/**
 * Child Compass 3.0 — unified `ds` surface + legacy compatibility.
 * New pages should import from `./tokens/*` directly; `ds` maps emotional tokens.
 */
import { layoutSpace } from "./tokens/spacing";
import { typeScale } from "./tokens/typography";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";
import { motion } from "./tokens/motion";

/** @deprecated use layoutSpace from ./tokens */
export const space = layoutSpace;

export const ds = {
  /* Surfaces */
  card: `${radius.cardHero} border border-white/80 bg-white/90 ${shadows.raised} backdrop-blur-xl`,
  glass: `${radius.cardHero} border border-white/72 bg-white/86 ${shadows.paper} backdrop-blur-xl`,
  paper: `${radius.card} border border-white/68 bg-white/88 ${shadows.paper} backdrop-blur-lg`,
  hero: `${radius.hero} bg-gradient-to-br from-[var(--cc-paper-elevated)] via-[var(--cc-paper)] to-[var(--cc-teal-wash)]/40 ${shadows.hero}`,

  /* Forms */
  /* Forms — unified field language */
  input: "cc-fw-input w-full",
  label: "mb-1.5 block text-sm font-semibold text-[var(--cc-ink)]",
  hint: "mt-1.5 text-sm leading-relaxed text-[var(--cc-ink-faint)]",
  fieldError: "mt-1.5 text-sm font-medium text-[var(--cc-danger)]",

  /* Typography shortcuts */
  eyebrow: typeScale.eyebrow,
  heading: typeScale.title,
  subtext: `mt-3 max-w-2xl ${typeScale.body}`,

  /* Buttons — delegate to Application Framework (Sprint 5) */
  btnPrimary: "cc-fw-btn cc-fw-btn-primary",
  btnSecondary: "cc-fw-btn cc-fw-btn-secondary",
  btnGhost: "cc-fw-btn cc-fw-btn-ghost",
  btnPill: "cc-fw-btn cc-fw-btn-pill cc-fw-btn-md",
  btnFab: "cc-fw-btn cc-fw-btn-pill cc-fw-btn-fab",

  /* Motion */
  hoverLift: motion.liftCard,
  fadeIn: motion.fadeIn,
  stagger: "animate-cc-stagger-in",
} as const;
