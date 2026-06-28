"use client";

import {
  TIME_FILTERS,
  THEME_FILTERS,
  type ThemeFilter,
  type TimeFilter,
} from "@/components/track/track-filters";
import TimelineSearch from "@/components/timeline/TimelineSearch";

type JourneyFiltersProps = {
  timeFilter: TimeFilter;
  themeFilter: ThemeFilter;
  searchQuery: string;
  onTimeChange: (f: TimeFilter) => void;
  onThemeChange: (f: ThemeFilter) => void;
  onSearchChange: (q: string) => void;
};

export default function JourneyFilters({
  timeFilter,
  themeFilter,
  searchQuery,
  onTimeChange,
  onThemeChange,
  onSearchChange,
}: JourneyFiltersProps) {
  return (
    <div className="space-y-4" role="search" aria-label="Filter your family timeline">
      <TimelineSearch value={searchQuery} onChange={onSearchChange} />

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
