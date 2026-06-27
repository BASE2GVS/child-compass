"use client";

import {
  TIME_FILTERS,
  THEME_FILTERS,
  type ThemeFilter,
  type TimeFilter,
} from "@/components/track/track-filters";

type JourneyFiltersProps = {
  timeFilter: TimeFilter;
  themeFilter: ThemeFilter;
  onTimeChange: (f: TimeFilter) => void;
  onThemeChange: (f: ThemeFilter) => void;
};

export default function JourneyFilters({
  timeFilter,
  themeFilter,
  onTimeChange,
  onThemeChange,
}: JourneyFiltersProps) {
  return (
    <div className="space-y-4" role="search" aria-label="Filter your family journey">
      <div className="flex flex-wrap gap-2">
        {TIME_FILTERS.map((f) => {
          const active = timeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onTimeChange(f.id)}
              aria-pressed={active}
              className={`cc-fw-chip ${active ? "cc-fw-chip-active" : "cc-fw-chip-inactive"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {THEME_FILTERS.map((f) => {
          const active = themeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onThemeChange(f.id)}
              aria-pressed={active}
              className={`cc-fw-chip ${active ? "cc-fw-chip-active" : "cc-fw-chip-inactive"}`}
            >
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
