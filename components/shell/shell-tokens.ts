/**
 * Child Compass shell design tokens.
 * CSS mirrors live in app/globals.css — keep in sync.
 */
export const shellTokens = {
  maxWidth: "93.75rem", // 1500px
  paper: "#FFFDF9",
  overlay: "rgba(255, 248, 242, 0.78)",
  padding: {
    x: { base: "1.5rem", lg: "2.5rem" },
    y: { base: "1.25rem", lg: "1.5rem" },
  },
  radius: {
    card: "1.625rem", // 26px
    nav: "1.25rem",
    button: "9999px",
  },
  shadow: {
    paper: "0 2px 12px rgba(45, 42, 38, 0.04)",
    card: "0 12px 48px rgba(45, 42, 38, 0.08), 0 2px 12px rgba(45, 42, 38, 0.04)",
    float: "0 8px 32px rgba(45, 42, 38, 0.08)",
    hero: "0 16px 64px rgba(45, 42, 38, 0.1)",
    teal: "0 8px 28px var(--cc-teal-glow)",
  },
  typography: {
    display: "cc-type-display",
    title: "cc-type-title",
    heading: "cc-type-heading",
    lead: "cc-type-lead",
    body: "cc-type-body",
    caption: "cc-type-caption",
    eyebrow: "cc-type-eyebrow",
  },
  button: {
    primary: "cc-btn cc-btn-primary",
    secondary: "cc-btn cc-btn-secondary",
    ghost: "cc-btn cc-btn-ghost",
  },
  card: {
    base: "cc-shell-paper",
    sm: "cc-shell-paper cc-shell-paper--sm",
    lg: "cc-shell-paper cc-shell-paper--lg",
  },
  illustration: {
    hero: "cc-shell-hero",
    slot: "cc-shell-illustration",
    bleed: "cc-shell-illustration cc-shell-illustration--bleed",
  },
} as const;

export type ShellShadow = keyof typeof shellTokens.shadow;
export type ShellButtonVariant = keyof typeof shellTokens.button;
export type ShellTypography = keyof typeof shellTokens.typography;
