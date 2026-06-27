"use client";

import { FrameworkButtonLink } from "@/components/framework";
import type { ContextualNextStep } from "@/lib/companion/contextual-next-step";

const STEP_HEADING: Record<string, string> = {
  checkin: "Today's check-in",
  coach: "Talk",
  reflect: "Talk",
  prepare: "Tomorrow",
  review: "Continue",
  teacher: "Share with school",
};

const STEP_BUTTON: Record<string, string> = {
  checkin: "Check in",
  coach: "Talk",
  reflect: "Talk",
  prepare: "Plan tomorrow",
  review: "Continue",
  teacher: "Share with school",
};

/** One clear step — readable in ten seconds */
export default function TodayFocusFeature({ step }: { step: ContextualNextStep }) {
  const { primary } = step;
  if (primary.href === "#skip") return null;

  const heading = STEP_HEADING[primary.id] ?? "Today's step";
  const buttonLabel = STEP_BUTTON[primary.id] ?? "Continue";

  return (
    <section aria-labelledby="today-focus-heading" className="mt-6 lg:mt-0">
      <p className="text-sm font-medium text-[var(--cc-teal-deep)]">How are we doing?</p>
      <h2 id="today-focus-heading" className="mt-2 font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        {heading}
      </h2>
      {primary.description && (
        <p className="mt-3 max-w-lg text-base leading-relaxed text-[var(--cc-ink-muted)]">{primary.description}</p>
      )}
      <FrameworkButtonLink href={primary.href} variant="pill" className="mt-6">
        {buttonLabel}
      </FrameworkButtonLink>
    </section>
  );
}
