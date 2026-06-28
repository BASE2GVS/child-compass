import type { TimelineDayType } from "@/lib/types/database";

export const DAY_TYPE_OPTIONS: { value: TimelineDayType; label: string; hint: string }[] = [
  { value: "weekday", label: "Weekday", hint: "School or work day" },
  { value: "weekend", label: "Weekend", hint: "Saturday or Sunday" },
  { value: "holiday", label: "Holiday", hint: "Public holiday or break" },
  { value: "school_holiday", label: "School holiday", hint: "Term break or inset day" },
];

export function inferDayType(date: Date = new Date()): TimelineDayType {
  const day = date.getDay();
  if (day === 0 || day === 6) return "weekend";
  return "weekday";
}

export function dayTypeLabel(dayType: TimelineDayType | null | undefined): string | null {
  if (!dayType || dayType === "weekday") return null;
  return DAY_TYPE_OPTIONS.find((o) => o.value === dayType)?.label ?? null;
}

export function dayTypeContext(dayType: TimelineDayType | null | undefined): string | null {
  switch (dayType) {
    case "weekend":
      return "Weekend mornings usually begin more calmly.";
    case "holiday":
      return "A holiday rhythm — routines may feel different.";
    case "school_holiday":
      return "School is out — the day may unfold differently.";
    default:
      return null;
  }
}
