/**
 * Shadows — paper resting on a table, not floating SaaS widgets.
 */
export const shadows = {
  /** Barely lifted paper */
  paper:
    "shadow-[0_1px_2px_rgba(45,42,38,0.04),0_4px_12px_rgba(45,42,38,0.04)]",
  /** Standard card — soft depth (raised) */
  raised:
    "shadow-[0_2px_10px_rgba(45,42,38,0.06),0_10px_32px_rgba(232,196,122,0.08),0_4px_16px_rgba(45,42,38,0.04)]",
  /** @deprecated use raised */
  card:
    "shadow-[0_2px_10px_rgba(45,42,38,0.06),0_10px_32px_rgba(232,196,122,0.08),0_4px_16px_rgba(45,42,38,0.04)]",
  /** Hero / featured surfaces */
  hero:
    "shadow-[0_6px_20px_rgba(45,42,38,0.07),0_16px_48px_rgba(184,212,200,0.12)]",
  /** Hover lift — gentle */
  lift:
    "shadow-[0_8px_28px_rgba(45,42,38,0.08),0_2px_8px_rgba(45,42,38,0.04)]",
  /** Inset — pressed paper */
  inset: "shadow-[inset_0_1px_2px_rgba(45,42,38,0.06)]",
  /** Teal glow for primary actions */
  tealGlow: "shadow-[0_8px_28px_var(--cc-teal-glow)]",
  /** None */
  none: "shadow-none",
} as const;
