/**
 * Motion tokens — fade, lift, breathe. Never flashy.
 */
export const duration = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  breathe: "3s",
} as const;

export const easing = {
  soft: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.45, 0, 0.55, 1)",
} as const;

export const motion = {
  fadeIn: "animate-cc-fade-in",
  fadeUp: "animate-cc-fade-up",
  breathe: "animate-cc-breathe",
  shimmer: "animate-cc-shimmer",
  lift:
    "transition-all duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  liftCard:
    "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(45,42,38,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  press: "active:scale-[0.98] motion-reduce:active:scale-100",
  reduced: "motion-reduce:transition-none motion-reduce:animate-none",
} as const;

export const stagger = (index: number, baseMs = 60) => ({
  animationDelay: `${index * baseMs}ms`,
});
