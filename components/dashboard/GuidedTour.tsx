"use client";

import { useState } from "react";

const TOUR_KEY = "cc-guided-tour-completed";

export default function GuidedTour() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(TOUR_KEY) !== "true";
  });
  const [showSteps, setShowSteps] = useState(false);

  function completeTour() {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
    setShowSteps(false);
  }

  if (!visible) return null;

  return (
    <div className="mt-8 rounded-[1.75rem] border border-[var(--cc-teal)]/20 bg-[#E8F6F3]/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-[var(--cc-ink)]">Optional guided tour</p>
          <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">
            A quick look at Today, check-ins, talking together, and sharing with school.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSteps((s) => !s)}
            className="rounded-full bg-[var(--cc-paper-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--cc-ink)] shadow-sm"
          >
            {showSteps ? "Hide" : "Start tour"}
          </button>
          <button
            type="button"
            onClick={completeTour}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--cc-ink-muted)]"
          >
            Dismiss
          </button>
        </div>
      </div>
      {showSteps && (
        <ol className="mt-5 grid gap-2 text-sm text-[var(--cc-ink-soft)] sm:grid-cols-2">
          <li>1. Today — your calm starting point.</li>
          <li>2. Check-in — a short snapshot of how your child is doing.</li>
          <li>3. Ask Child Compass — talk or reflect after a hard moment.</li>
          <li>4. Timeline — your family&apos;s story in one place.</li>
          <li>5. Documents — shareable summaries for your care team.</li>
          <li>
            <button type="button" onClick={completeTour} className="font-semibold text-[var(--cc-teal)] hover:underline">
              Mark complete
            </button>
          </li>
        </ol>
      )}
    </div>
  );
}
