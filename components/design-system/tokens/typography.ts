/**
 * Typography scale — comfortable for parents 50+, clear hierarchy.
 * Pair with --font-body (Nunito) and --font-display (Fraunces) in layout.
 */
export const fontFamily = {
  body: "var(--font-body), system-ui, sans-serif",
  display: "var(--font-display), Georgia, serif",
} as const;

export const typeScale = {
  /** Page heroes — welcoming, large */
  display: "font-display text-4xl font-semibold leading-[1.15] tracking-tight text-[var(--cc-ink)] sm:text-5xl",
  /** Primary page titles */
  title: "font-display text-3xl font-semibold leading-[1.2] tracking-tight text-[var(--cc-ink)] sm:text-4xl",
  /** Section headings */
  heading: "font-display text-2xl font-semibold leading-snug text-[var(--cc-ink)]",
  /** Card titles */
  cardTitle: "text-lg font-semibold leading-snug text-[var(--cc-ink)]",
  /** Subsection labels */
  subheading: "text-base font-semibold leading-normal text-[var(--cc-ink)]",
  /** Body — generous line-height for readability */
  body: "text-base font-normal leading-relaxed text-[var(--cc-ink-soft)]",
  bodyLarge: "text-lg font-normal leading-relaxed text-[var(--cc-ink-soft)]",
  /** Secondary copy */
  caption: "text-sm leading-relaxed text-[var(--cc-ink-muted)]",
  /** Fine print */
  micro: "text-xs leading-relaxed text-[var(--cc-ink-faint)]",
  /** Eyebrow — warm, not corporate uppercase shouting */
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]",
  /** Inviting link style */
  link: "font-semibold text-[var(--cc-teal)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]/30 rounded",
} as const;
