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
    <div className="rounded-3xl border border-[#14B8A6]/30 bg-[#14B8A6]/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0F172A]">Optional guided tour</p>
          <p className="text-sm text-slate-600">Discover Dashboard, Check-In, Parent Debrief™, Timeline and Reports.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSteps((s) => !s)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0F172A]"
          >
            {showSteps ? "Hide Tour" : "Start Tour"}
          </button>
          <button
            type="button"
            onClick={completeTour}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Skip
          </button>
        </div>
      </div>
      {showSteps && (
        <ol className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <li>1. Dashboard: daily overview and next best actions.</li>
          <li>2. Check-In: quick daily snapshot in under 2 minutes.</li>
          <li>3. Parent Debrief™: AI explains likely triggers and response.</li>
          <li>4. Timeline: your child&apos;s story in one place.</li>
          <li>5. Reports: printable summaries for school and support team.</li>
          <li>
            <button type="button" onClick={completeTour} className="font-semibold text-[#14B8A6] hover:underline">
              Mark tour complete
            </button>
          </li>
        </ol>
      )}
    </div>
  );
}
