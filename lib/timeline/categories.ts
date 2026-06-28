import type { TimelineCategory, UnifiedTimelineItem } from "@/lib/types/database";

export type CategoryFilter = "all" | TimelineCategory;

export const TIMELINE_CATEGORIES: {
  id: TimelineCategory;
  label: string;
  emoji: string;
  tint: string;
  ring: string;
}[] = [
  { id: "sleep", label: "Sleep", emoji: "🌙", tint: "bg-[#E8F0FA]", ring: "ring-[#B8CCE8]" },
  { id: "school", label: "School", emoji: "🏫", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E8]" },
  { id: "health", label: "Health", emoji: "❤️", tint: "bg-[#FBEFEC]", ring: "ring-[#E8B8B0]" },
  { id: "medication", label: "Medication", emoji: "💊", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D8CC]" },
  { id: "behaviour", label: "Behaviour", emoji: "🧠", tint: "bg-[#F5F0E8]", ring: "ring-[#D8C8A8]" },
  { id: "wins", label: "Wins", emoji: "😊", tint: "bg-[#FBF4E6]", ring: "ring-[#E8D4A8]" },
  { id: "challenges", label: "Challenges", emoji: "⚠", tint: "bg-[#FBEFEC]", ring: "ring-[#E8B0A8]" },
  { id: "observation", label: "Observation", emoji: "📝", tint: "bg-[#FAF8F4]", ring: "ring-[#E8E4DC]" },
  { id: "therapy", label: "Therapy", emoji: "👩‍⚕", tint: "bg-[#EEF5F0]", ring: "ring-[#B8D8C0]" },
  { id: "child_compass", label: "Child Compass", emoji: "🤖", tint: "bg-[#E8F6F3]", ring: "ring-[#88C8BC]" },
  { id: "documents", label: "Documents", emoji: "📄", tint: "bg-[#F0F5EE]", ring: "ring-[#C0D8B8]" },
  { id: "milestones", label: "Milestones", emoji: "🎉", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C888]" },
];

export const CATEGORY_FILTERS: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "school", label: "School", emoji: "🏫" },
  { id: "health", label: "Health", emoji: "❤️" },
  { id: "behaviour", label: "Behaviour", emoji: "🧠" },
  { id: "medication", label: "Medication", emoji: "💊" },
  { id: "therapy", label: "Therapy", emoji: "👩‍⚕" },
  { id: "wins", label: "Wins", emoji: "😊" },
  { id: "documents", label: "Documents", emoji: "📄" },
];

const MIRRORED_TIMELINE_TYPES = new Set(["checkin", "debrief", "report", "ai_insight"]);

export function isMirroredTimelineEvent(eventType: string): boolean {
  return MIRRORED_TIMELINE_TYPES.has(eventType);
}

export function categoryMeta(category: TimelineCategory) {
  return TIMELINE_CATEGORIES.find((c) => c.id === category) ?? TIMELINE_CATEGORIES[7];
}

export function resolveCategory(input: {
  source: UnifiedTimelineItem["source"];
  event_type: string;
  title?: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
}): TimelineCategory {
  const type = input.event_type?.toLowerCase() ?? "";
  const text = `${input.title ?? ""} ${input.description ?? ""}`.toLowerCase();
  const kind = String(input.metadata?.observation_kind ?? input.metadata?.kind ?? "").toLowerCase();

  if (kind === "funny" || kind === "win") return "wins";
  if (kind === "difficult" || kind === "challenge") return "challenges";
  if (kind === "behaviour" || kind === "behavior") return "behaviour";
  if (kind === "important" || kind === "observation") return "observation";
  if (kind === "milestone") return "milestones";

  if (input.source === "health") {
    if (type === "medication") return "medication";
    if (type === "sleep") return "sleep";
    return "health";
  }
  if (input.source === "school") return "school";
  if (input.source === "therapy") return "therapy";
  if (input.source === "document") return "documents";
  if (input.source === "report") return "documents";
  if (input.source === "coach" || input.source === "debrief" || input.source === "insight") {
    return "child_compass";
  }
  if (input.source === "checkin") {
    if (text.includes("win")) return "wins";
    if (text.includes("challeng")) return "challenges";
    return "observation";
  }

  if (type === "sleep") return "sleep";
  if (type === "school") return "school";
  if (type === "medication") return "medication";
  if (type === "meltdown" || type === "behaviour" || type === "behavior") return "behaviour";
  if (type === "victory") return "wins";
  if (type === "appointment") return "health";
  if (type === "report") return "documents";
  if (type === "debrief" || type === "ai_insight" || type === "coach") return "child_compass";
  if (type === "checkin") return "observation";
  if (type === "note" || type === "observation") return "observation";
  if (text.includes("medication")) return "medication";
  if (text.includes("therap")) return "therapy";
  if (text.includes("school")) return "school";
  if (text.includes("win") || text.includes("celebrat")) return "wins";
  if (text.includes("challeng") || text.includes("difficult") || text.includes("overload")) return "challenges";
  if (text.includes("milestone")) return "milestones";

  return "observation";
}

export function matchesCategoryFilter(event: UnifiedTimelineItem, filter: CategoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "health") {
    return ["health", "medication", "sleep"].includes(event.category);
  }
  return event.category === filter;
}
