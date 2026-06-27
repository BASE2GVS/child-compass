export type DayPhase = "morning" | "day" | "evening";

export function getDayPhase(hour = new Date().getHours()): DayPhase {
  if (hour < 11) return "morning";
  if (hour < 18) return "day";
  return "evening";
}

export function phaseLabel(phase: DayPhase): string {
  switch (phase) {
    case "morning":
      return "Morning";
    case "day":
      return "Today";
    case "evening":
      return "Evening";
  }
}
