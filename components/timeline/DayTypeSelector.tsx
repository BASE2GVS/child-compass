"use client";

import { DAY_TYPE_OPTIONS } from "@/lib/timeline/day-type";
import type { TimelineDayType } from "@/lib/types/database";

type DayTypeSelectorProps = {
  value: TimelineDayType;
  onChange: (value: TimelineDayType) => void;
  compact?: boolean;
};

export default function DayTypeSelector({ value, onChange, compact = false }: DayTypeSelectorProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && (
        <p className="text-sm font-medium text-[var(--cc-ink-muted)]">What kind of day was it?</p>
      )}
      <div className="flex flex-wrap gap-2">
        {DAY_TYPE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              title={option.hint}
              className={`cc-fw-chip ${active ? "cc-fw-chip-active" : "cc-fw-chip-inactive"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
