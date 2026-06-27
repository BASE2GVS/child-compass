/**
 * Spacing rhythm — generous, intentional whitespace.
 */
export const spacing = {
  /** 4px base unit references */
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

/** Tailwind layout stacks */
export const layoutSpace = {
  page: "space-y-10 sm:space-y-12",
  section: "space-y-8",
  card: "space-y-5",
  cardTight: "space-y-3",
  field: "space-y-2",
  inline: "gap-3",
  inlineLoose: "gap-4",
  grid: "gap-5 sm:gap-6",
} as const;

/** Minimum touch target — WCAG / 48px */
export const touchTarget = "min-h-12 min-w-12" as const;
