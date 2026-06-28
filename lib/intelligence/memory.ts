import type {
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
  UnifiedTimelineItem,
} from "@/lib/types/database";

export type MemoryCategory =
  | "calming_strategy"
  | "trigger"
  | "successful_transition"
  | "school_pattern"
  | "sensory_event"
  | "sleep_relationship"
  | "communication"
  | "recovery"
  | "win";

export type FamilyMemory = {
  category: MemoryCategory;
  text: string;
  date: string | null;
  source: "checkin" | "debrief" | "timeline" | "profile" | "pattern";
};

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString("en-GB", { weekday: "long" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

export function buildFamilyMemory(input: {
  profile: ChildProfile | null;
  checkins: DailyCheckin[];
  debriefs: ParentDebrief[];
  timeline: TimelineEvent[];
  patterns: PatternFinding[];
  unifiedTimeline?: UnifiedTimelineItem[];
}): FamilyMemory[] {
  const memories: FamilyMemory[] = [];
  const seen = new Set<string>();

  function add(memory: FamilyMemory) {
    const key = `${memory.category}:${memory.text.slice(0, 80)}`;
    if (seen.has(key)) return;
    seen.add(key);
    memories.push(memory);
  }

  for (const strategy of input.profile?.calming_strategies || []) {
    add({ category: "calming_strategy", text: strategy, date: null, source: "profile" });
  }
  for (const strategy of input.profile?.successful_strategies || []) {
    add({ category: "successful_transition", text: strategy, date: null, source: "profile" });
  }
  for (const trigger of input.profile?.known_triggers || []) {
    add({ category: "trigger", text: trigger, date: null, source: "profile" });
  }

  for (const c of input.checkins) {
    for (const win of c.wins || []) {
      const lower = win.toLowerCase();
      const category: MemoryCategory =
        lower.includes("school") || lower.includes("transition")
          ? "successful_transition"
          : lower.includes("sleep") || lower.includes("bed")
            ? "sleep_relationship"
            : lower.includes("choice") || lower.includes("calm")
              ? "communication"
              : "win";
      add({ category, text: win, date: c.checkin_date, source: "checkin" });
    }
    if ((c.sleep_quality ?? 3) <= 2 && (c.school_rating ?? 3) <= 2) {
      add({
        category: "sleep_relationship",
        text: "Poor sleep coincided with a harder school day.",
        date: c.checkin_date,
        source: "checkin",
      });
    }
    if ((c.sensory_overload ?? 3) >= 4) {
      add({
        category: "sensory_event",
        text: "Sensory overload was elevated — recovery time may have helped.",
        date: c.checkin_date,
        source: "checkin",
      });
    }
  }

  for (const d of input.debriefs) {
    if (d.suggested_response) {
      add({
        category: "communication",
        text: d.suggested_response,
        date: d.created_at.split("T")[0],
        source: "debrief",
      });
    }
    if (d.tomorrow_plan) {
      add({
        category: "successful_transition",
        text: d.tomorrow_plan,
        date: d.created_at.split("T")[0],
        source: "debrief",
      });
    }
  }

  for (const e of input.timeline) {
    if (e.event_type === "victory") {
      add({
        category: "win",
        text: e.description || e.title,
        date: e.event_date.split("T")[0],
        source: "timeline",
      });
    }
    if (e.event_type === "meltdown") {
      add({
        category: "trigger",
        text: e.description || e.title,
        date: e.event_date.split("T")[0],
        source: "timeline",
      });
    }
    if (e.event_type === "school") {
      add({
        category: "school_pattern",
        text: e.description || e.title,
        date: e.event_date.split("T")[0],
        source: "timeline",
      });
    }
  }

  for (const p of input.patterns) {
    add({
      category: p.category === "sleep" ? "sleep_relationship" : "school_pattern",
      text: p.description,
      date: null,
      source: "pattern",
    });
  }

  for (const item of input.unifiedTimeline ?? []) {
    const text = `${item.title} ${item.description ?? ""}`;
    const lower = text.toLowerCase();
    const date = item.event_date.split("T")[0];

    if (item.category === "medication" || lower.includes("medication")) {
      add({ category: "trigger", text: item.title, date, source: "timeline" });
    }
    if (item.category === "therapy" || item.source === "therapy") {
      add({ category: "communication", text: item.title, date, source: "timeline" });
    }
    if (textMentionsShopping(lower)) {
      add({
        category: "sensory_event",
        text: item.description || item.title,
        date,
        source: "timeline",
      });
    }
    if (item.category === "wins" || item.event_type === "victory") {
      add({ category: "win", text: item.description || item.title, date, source: "timeline" });
    }
    if (item.category === "challenges" || item.event_type === "meltdown") {
      add({ category: "trigger", text: item.description || item.title, date, source: "timeline" });
    }
    if (/quiet|recovery|calm/i.test(lower)) {
      add({
        category: "recovery",
        text: item.description || item.title,
        date,
        source: "timeline",
      });
    }
    if (/countdown|visual timer|picture schedule|choices/i.test(lower)) {
      add({
        category: "successful_transition",
        text: item.description || item.title,
        date,
        source: "timeline",
      });
    }
  }

  return memories.slice(0, 50);
}

function textMentionsShopping(lower: string): boolean {
  return ["shop", "shopping", "supermarket", "crowd", "shoes", "sensory overload"].some((t) =>
    lower.includes(t),
  );
}

export function formatMemoryReference(memory: FamilyMemory): string {
  if (memory.date) {
    return `On ${formatDayLabel(memory.date)}, ${memory.text.charAt(0).toLowerCase()}${memory.text.slice(1)}`;
  }
  return memory.text;
}

export function findRelevantMemories(
  memories: FamilyMemory[],
  keywords: string[],
  limit = 2,
): FamilyMemory[] {
  const lower = keywords.map((k) => k.toLowerCase());
  return memories
    .filter((m) => {
      const text = m.text.toLowerCase();
      return lower.some((k) => text.includes(k));
    })
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      return 1;
    })
    .slice(0, limit);
}

export function memoryReferenceForContext(
  memories: FamilyMemory[],
  parentMessage: string,
): string | null {
  const msg = parentMessage.toLowerCase();
  const keywordSets: Record<string, string[]> = {
    school: ["school", "transition", "morning", "refusal"],
    sensory: ["loud", "noise", "shop", "shopping", "crowd", "sensory", "supermarket", "shoes"],
    sleep: ["sleep", "tired", "bed", "night"],
    choice: ["choice", "options", "demand"],
    recovery: ["recover", "quiet", "calm", "regulate", "overload"],
  };

  for (const [, keys] of Object.entries(keywordSets)) {
    if (keys.some((k) => msg.includes(k))) {
      const relevant = findRelevantMemories(memories, keys, 1);
      if (relevant[0]) return formatMemoryReference(relevant[0]);
    }
  }

  const recentWin = memories.find((m) => m.category === "win" && m.date);
  if (recentWin) return formatMemoryReference(recentWin);

  return null;
}
