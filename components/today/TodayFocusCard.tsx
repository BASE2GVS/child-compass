"use client";

import Link from "next/link";
import FocusIllustration from "@/components/today/illustrations/FocusIllustration";
import type { ContextualNextStep } from "@/lib/companion/contextual-next-step";

export default function TodayFocusCard({ step }: { step: ContextualNextStep }) {
  const { primary, alternates } = step;
  const skipOnly = primary.href === "#skip" && alternates.length === 0;

  if (skipOnly) return null;

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-[var(--cc-border-soft)] bg-gradient-to-br from-[#FFFCF8] via-[var(--cc-paper-elevated)] to-[#F5E6C8]/30 p-8 shadow-[0_8px_32px_rgba(45,42,38,0.06)] sm:p-10"
      aria-labelledby="today-focus-heading"
    >
      <div className="pointer-events-none absolute -right-6 top-0 h-32 w-32 rounded-full bg-[#E8C47A]/15 blur-2xl" aria-hidden />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-lg space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]">
            Today&apos;s focus
          </p>
          <h2 id="today-focus-heading" className="font-display text-3xl font-semibold leading-tight text-[var(--cc-ink)]">
            {primary.label}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--cc-ink-muted)]">{primary.description}</p>

          {primary.href !== "#skip" && (
            <Link
              href={primary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--cc-teal)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_28px_var(--cc-teal-glow)] transition-all hover:bg-[var(--cc-teal-deep)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {primary.label.length > 40 ? "When you're ready" : primary.label}
            </Link>
          )}

          {alternates.length > 0 && (
            <div className="flex flex-wrap gap-4 border-t border-[var(--cc-border-soft)] pt-5">
              {alternates.map((alt) =>
                alt.href === "#skip" ? (
                  <span key={alt.id} className="text-sm text-[var(--cc-ink-faint)]">
                    {alt.label}
                  </span>
                ) : (
                  <Link
                    key={alt.id}
                    href={alt.href}
                    className="text-sm font-semibold text-[var(--cc-teal)] underline-offset-4 hover:underline"
                  >
                    {alt.label}
                  </Link>
                ),
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:block">
          <FocusIllustration />
        </div>
      </div>
    </section>
  );
}
