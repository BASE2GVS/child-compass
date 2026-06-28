import type { UnifiedTimelineItem } from "@/lib/types/database";
import { matchesCategoryFilter, type CategoryFilter } from "@/lib/timeline/categories";
import { searchTimelineItems } from "@/lib/timeline/search";

export type TimeFilter = "all" | "today" | "week" | "month";
export type ThemeFilter = CategoryFilter;

export const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export { CATEGORY_FILTERS as THEME_FILTERS } from "@/lib/timeline/categories";

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

export function filterTimelineEvents(
  events: UnifiedTimelineItem[],
  timeFilter: TimeFilter,
  categoryFilter: CategoryFilter,
  searchQuery = "",
): UnifiedTimelineItem[] {
  let filtered = events.filter((event) => {
    if (timeFilter === "today" && !isToday(event.event_date)) return false;
    if (timeFilter === "week" && !isWithinDays(event.event_date, 7)) return false;
    if (timeFilter === "month" && !isWithinDays(event.event_date, 30)) return false;
    if (!matchesCategoryFilter(event, categoryFilter)) return false;
    return true;
  });

  if (searchQuery.trim()) {
    filtered = searchTimelineItems(filtered, searchQuery);
  }

  return filtered;
}

export function timeOfDay(dateStr: string): { label: string; emoji: string } {
  const hour = new Date(dateStr).getHours();
  if (hour < 12) return { label: "Morning", emoji: "☀️" };
  if (hour < 17) return { label: "Afternoon", emoji: "🌤️" };
  return { label: "Evening", emoji: "🌙" };
}

export function isMemoryMoment(event: UnifiedTimelineItem): boolean {
  return (
    event.category === "wins" ||
    event.category === "milestones" ||
    event.category === "challenges" ||
    event.source === "debrief" ||
    event.event_type === "meltdown"
  );
}

export const REFLECTION_MESSAGES = [
  "One thing we're slowly learning… small routines continue to help.",
  "Patterns take time — every moment you notice matters.",
  "Gentle consistency is building a clearer picture.",
  "Hard days and good days both belong in the story.",
  "You're creating space for understanding to grow.",
];
