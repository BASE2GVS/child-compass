/**
 * Child Compass 3.0 — Application Framework tokens.
 * Single source of truth for cards, buttons, type, shadows, radii, motion.
 */
import { duration, easing, motion } from "@/components/design-system/tokens/motion";
import { radius as radiusTokens } from "@/components/design-system/tokens/radius";
import { shadows as shadowTokens } from "@/components/design-system/tokens/shadows";
import { typeScale } from "@/components/design-system/tokens/typography";

/** Maximum content width — 1500px editorial column */
export const FRAMEWORK_MAX_WIDTH = "93.75rem";

/** Vertical rhythm between page regions */
export const frameworkRhythm = {
  header: "0",
  hero: "2rem",
  primary: "2rem",
  supporting: "1.5rem",
  reflection: "2rem",
} as const;

/** Three corner radii only */
export const frameworkRadius = {
  sm: radiusTokens.sm,
  md: radiusTokens.md,
  hero: radiusTokens.hero,
} as const;

/** Three elevations only */
export const frameworkShadow = {
  paper: shadowTokens.paper,
  raised: shadowTokens.raised,
  hero: shadowTokens.hero,
} as const;

/** Five typography levels only */
export const frameworkType = {
  display: typeScale.display,
  heroTitle: typeScale.title,
  sectionTitle: typeScale.heading,
  body: typeScale.body,
  caption: typeScale.caption,
} as const;

/** Four button variants */
export const frameworkButton = {
  primary: "cc-fw-btn cc-fw-btn-primary",
  secondary: "cc-fw-btn cc-fw-btn-secondary",
  ghost: "cc-fw-btn cc-fw-btn-ghost",
  pill: "cc-fw-btn cc-fw-btn-pill",
} as const;

/** Four card variants */
export const frameworkCard = {
  hero: "cc-fw-card cc-fw-card-hero",
  primary: "cc-fw-card cc-fw-card-primary",
  secondary: "cc-fw-card cc-fw-card-secondary",
  supporting: "cc-fw-card cc-fw-card-supporting",
} as const;

/** Unified motion */
export const frameworkMotion = {
  duration,
  easing,
  hover: motion.lift,
  fade: motion.fadeIn,
  fadeUp: motion.fadeUp,
  lift: motion.liftCard,
  page: "cc-page-enter",
  shimmer: motion.shimmer,
  press: motion.press,
} as const;

export type FrameworkRhythmSlot = keyof typeof frameworkRhythm;
export type FrameworkCardVariant = keyof typeof frameworkCard;
export type FrameworkButtonVariant = keyof typeof frameworkButton;
