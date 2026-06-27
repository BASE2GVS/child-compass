/**
 * Child Compass 3.0 — Emotional colour tokens.
 * Warm, calm, companion-grade. WCAG AA contrast on text pairings documented inline.
 */
export const palette = {
  cream: {
    50: "#FDFBF7",
    100: "#FAF8F4",
    200: "#F5F1EA",
    300: "#EDE8DF",
    400: "#E3DDD2",
  },
  paper: {
    DEFAULT: "#FFFEFC",
    warm: "#FFFCF8",
    elevated: "#FFFFFF",
  },
  ink: {
    DEFAULT: "#2D2A26",
    soft: "#4A4540",
    muted: "#6B6560",
    faint: "#948E88",
    whisper: "#B8B2AB",
  },
  teal: {
    DEFAULT: "#3D9B8F",
    soft: "#5BB5A8",
    muted: "#8FCEC4",
    wash: "#D4EDE8",
    deep: "#2D7A70",
    glow: "rgba(61, 155, 143, 0.22)",
  },
  mint: {
    DEFAULT: "#A8D5CC",
    soft: "#C8E8E2",
    wash: "#E8F6F3",
  },
  coral: {
    DEFAULT: "#E8A598",
    soft: "#F0C4BB",
    wash: "#FBEFEC",
  },
  amber: {
    DEFAULT: "#E8C47A",
    soft: "#F0D9A8",
    wash: "#FBF4E6",
  },
  lavender: {
    DEFAULT: "#C9B8E0",
    soft: "#DDD2F0",
    wash: "#F3EFFA",
  },
  success: {
    DEFAULT: "#5BA88A",
    wash: "#E8F5EF",
  },
  warning: {
    DEFAULT: "#D4A85C",
    wash: "#FBF4E6",
  },
  danger: {
    DEFAULT: "#D4847A",
    wash: "#FBEFEC",
  },
} as const;

/** CSS custom property names — wired in globals.css */
export const colorVars = {
  background: "--cc-bg",
  foreground: "--cc-fg",
  paper: "--cc-paper",
  paperElevated: "--cc-paper-elevated",
  border: "--cc-border",
  borderSoft: "--cc-border-soft",
  teal: "--cc-teal",
  tealSoft: "--cc-teal-soft",
  tealWash: "--cc-teal-wash",
  ink: "--cc-ink",
  inkMuted: "--cc-ink-muted",
  inkFaint: "--cc-ink-faint",
  coral: "--cc-coral",
  mint: "--cc-mint",
  amber: "--cc-amber",
  lavender: "--cc-lavender",
} as const;
