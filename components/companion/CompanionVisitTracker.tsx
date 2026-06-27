"use client";

import { useEffect } from "react";

const LAST_VISIT_KEY = "cc-last-visit";
const DAYS_AWAY_KEY = "cc-days-away";

/** Records visit time; computes days away before updating (local only) */
export default function CompanionVisitTracker() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_VISIT_KEY);
      const daysAway = raw
        ? Math.floor((Date.now() - new Date(raw).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      sessionStorage.setItem(DAYS_AWAY_KEY, String(daysAway));
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}

export function readDaysAway(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = sessionStorage.getItem(DAYS_AWAY_KEY);
    if (stored != null) return Number(stored) || 0;
    const raw = localStorage.getItem(LAST_VISIT_KEY);
    if (!raw) return 0;
    return Math.floor((Date.now() - new Date(raw).getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
