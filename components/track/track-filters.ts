import type { UnifiedTimelineItem } from "@/lib/types/database";

export type TimeFilter = "all" | "today" | "week" | "month";
export type ThemeFilter = "all" | "school" | "home" | "celebrations" | "challenges";

export const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export const THEME_FILTERS: { id: ThemeFilter; label: string; emoji: string; tint: string }[] = [
  { id: "all", label: "Everything", emoji: "✨", tint: "bg-[#FFFCF8]" },
  { id: "school", label: "School", emoji: "🏫", tint: "bg-[#F3EFFA]" },
  { id: "home", label: "Home", emoji: "🏠", tint: "bg-[#E8F6F3]" },
  { id: "celebrations", label: "Celebrations", emoji: "🌟", tint: "bg-[#FBF4E6]" },
  { id: "challenges", label: "Challenges", emoji: "💛", tint: "bg-[#FBEFEC]" },
];

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isWithinDays(dateStr: string, days: number): boolean {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

function matchesTheme(event: UnifiedTimelineItem, theme: ThemeFilter): boolean {
  if (theme === "all") return true;
  const type = event.event_type?.toLowerCase() ?? "";
  const source = event.source;
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (theme === "school") {
    return type === "school" || text.includes("school");
  }
  if (theme === "home") {
    return ["sleep", "note", "checkin", "debrief"].includes(type) || source === "checkin" || source === "debrief";
  }
  if (theme === "celebrations") {
    return type === "victory" || text.includes("win") || text.includes("celebrat");
  }
  if (theme === "challenges") {
    return type === "meltdown" || text.includes("challeng") || text.includes("hard") || text.includes("difficult");
  }
  return true;
}

export function filterTimelineEvents(
  events: UnifiedTimelineItem[],
  timeFilter: TimeFilter,
  themeFilter: ThemeFilter,
): UnifiedTimelineItem[] {
  return events.filter((event) => {
    if (timeFilter === "today" && !isToday(event.event_date)) return false;
    if (timeFilter === "week" && !isWithinDays(event.event_date, 7)) return false;
    if (timeFilter === "month" && !isWithinDays(event.event_date, 30)) return false;
    if (!matchesTheme(event, themeFilter)) return false;
    return true;
  });
}

export function timeOfDay(dateStr: string): { label: string; emoji: string } {
  const hour = new Date(dateStr).getHours();
  if (hour < 12) return { label: "Morning", emoji: "☀️" };
  if (hour < 17) return { label: "Afternoon", emoji: "🌤️" };
  return { label: "Evening", emoji: "🌙" };
}

export function isMemoryMoment(event: UnifiedTimelineItem): boolean {
  const type = event.event_type?.toLowerCase() ?? "";
  return (
    type === "victory" ||
    type === "appointment" ||
    event.source === "debrief" ||
    type === "meltdown"
  );
}

export const REFLECTION_MESSAGES = [
  "One thing we're slowly learning… small routines continue to help.",
  "Patterns take time — every moment you notice matters.",
  "Gentle consistency is building a clearer picture.",
  "Hard days and good days both belong in the story.",
  "You're creating space for understanding to grow.",
];
