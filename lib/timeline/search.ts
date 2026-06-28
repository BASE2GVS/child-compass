import type { UnifiedTimelineItem } from "@/lib/types/database";

export function searchTimelineItems(items: UnifiedTimelineItem[], query: string): UnifiedTimelineItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((event) => {
    const haystack = [
      event.title,
      event.description ?? "",
      event.event_type,
      event.category,
      event.source,
      JSON.stringify(event.metadata),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
