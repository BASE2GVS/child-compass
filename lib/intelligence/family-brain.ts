import type {
  AIInsight,
  Child,
  ChildGoal,
  ChildProfile,
  DailyCheckin,
  GoalUpdate,
  Habit,
  HabitEntry,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
  UnifiedTimelineItem,
} from "@/lib/types/database";
import type { FamilyInsight } from "@/lib/companion/family-insights";
import {
  buildCompanionInsights,
  insightForMessage as companionInsightForMessage,
  type CompanionInsight,
} from "@/lib/intelligence/insight-engine";
import {
  buildFamilyMemory,
  findRelevantMemories,
  formatMemoryReference,
  type FamilyMemory,
} from "@/lib/intelligence/memory";
import { inferDayType } from "@/lib/timeline/day-type";

export type FamilyBrainInput = {
  child: Child;
  profile: ChildProfile | null;
  checkins: DailyCheckin[];
  debriefs: ParentDebrief[];
  patterns: PatternFinding[];
  timelineEvents: TimelineEvent[];
  unifiedTimeline?: UnifiedTimelineItem[];
  aiInsights?: AIInsight[];
  goals?: ChildGoal[];
  goalUpdates?: GoalUpdate[];
  habits?: Habit[];
  habitEntries?: HabitEntry[];
};

export type FamilyBrainSnapshot = {
  understanding: string[];
  memoryLines: string[];
  insightItems: FamilyInsight[];
  companionInsights: CompanionInsight[];
  rhythmNote: string | null;
  childAgeNote: string | null;
  memories: FamilyMemory[];
};

const SHOPPING_TERMS = ["shop", "shopping", "supermarket", "store", "crowd", "shoes"];
const RECOVERY_TERMS = ["quiet", "recovery", "calm", "regulate", "breath"];

function childAgeYears(child: Child): number | null {
  if (!child.date_of_birth) return null;
  const dob = new Date(child.date_of_birth);
  if (Number.isNaN(dob.getTime())) return null;
  const years = (Date.now() - dob.getTime()) / (365.25 * 86400000);
  return Math.max(0, Math.floor(years * 10) / 10);
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function unifiedToTimelineEvents(items: UnifiedTimelineItem[]): TimelineEvent[] {
  return items.map((item, i) => ({
    id: item.ref_id ?? `u-${i}`,
    child_id: "",
    family_id: "",
    user_id: "",
    event_type: item.event_type as TimelineEvent["event_type"],
    title: item.title,
    description: item.description,
    event_date: item.event_date,
    metadata: item.metadata,
    created_at: item.event_date,
  }));
}

function textMentionsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function reconcilePattern(pattern: PatternFinding, checkins: DailyCheckin[]): { text: string; confidence: number } {
  const recent = checkins.slice(0, 10);
  const baseConf = pattern.confidence ?? 0.75;
  const title = pattern.title.toLowerCase();

  if (title.includes("sleep") && title.includes("school")) {
    const lowSleep = recent.filter((c) => (c.sleep_quality ?? 3) <= 2);
    if (lowSleep.length >= 2) {
      const poorSchool = lowSleep.filter((c) => (c.school_rating ?? 3) <= 2);
      if (poorSchool.length / lowSleep.length < 0.4) {
        return {
          text: `${pattern.description} Recent days suggest this link may be easing.`,
          confidence: baseConf * 0.55,
        };
      }
    }
  }

  if (title.includes("monday") || title.includes("anxiety")) {
    const mondays = recent.filter((c) => new Date(c.checkin_date).getDay() === 1);
    if (mondays.length >= 2 && avg(mondays.map((c) => c.anxiety ?? 3)) <= avg(recent.map((c) => c.anxiety ?? 3))) {
      return {
        text: `${pattern.description} Lately Monday anxiety hasn't stood out as much.`,
        confidence: baseConf * 0.5,
      };
    }
  }

  return { text: pattern.description, confidence: baseConf };
}

function inferWeekendRhythm(checkins: DailyCheckin[], name: string): string | null {
  const weekend = checkins.filter(
    (c) => c.day_type === "weekend" || inferDayType(new Date(c.checkin_date)) === "weekend",
  );
  const weekday = checkins.filter(
    (c) => c.day_type === "weekday" || (!c.day_type && inferDayType(new Date(c.checkin_date)) === "weekday"),
  );
  if (weekend.length < 2 || weekday.length < 3) return null;

  const weekendMood = avg(weekend.map((c) => c.mood ?? 3));
  const weekdayMood = avg(weekday.map((c) => c.mood ?? 3));
  const weekendAnxiety = avg(weekend.map((c) => c.anxiety ?? 3));
  const weekdayAnxiety = avg(weekday.map((c) => c.anxiety ?? 3));

  if (weekendMood > weekdayMood + 0.5 && weekendAnxiety < weekdayAnxiety - 0.4) {
    return `${name} often settles more easily on weekends — routines may feel gentler without school pressure.`;
  }
  if (weekendAnxiety > weekdayAnxiety + 0.5) {
    return `Weekends can still be demanding for ${name} — unstructured time may need more scaffolding.`;
  }
  return null;
}

function inferFromUnifiedTimeline(items: UnifiedTimelineItem[], name: string): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  function add(line: string) {
    const key = line.slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);
    lines.push(line);
  }

  for (const item of items.slice(0, 40)) {
    const text = `${item.title} ${item.description ?? ""}`.toLowerCase();

    if (item.category === "medication" || text.includes("medication")) {
      add(`Medication observations are part of ${name}'s story — ${item.title}.`);
    }
    if (item.source === "therapy" || item.category === "therapy") {
      add(`Therapy sessions are logged — ${item.title}.`);
    }
    if (item.source === "school" || item.category === "school") {
      add(`School notes mention: ${item.title}.`);
    }
    if (textMentionsAny(text, SHOPPING_TERMS)) {
      add(`Shopping or crowded places have come up for ${name} — ${item.title}.`);
    }
    if (textMentionsAny(text, RECOVERY_TERMS)) {
      add(`Quiet recovery time has helped before: ${item.description?.slice(0, 100) ?? item.title}.`);
    }
    if (item.category === "wins" || item.event_type === "victory") {
      add(`A win to remember: ${item.title}.`);
    }
    if (item.source === "document" || item.category === "documents") {
      add(`Documents on file include: ${item.title}.`);
    }
    if (item.source === "debrief" || item.source === "insight") {
      add(`From Child Compass: ${(item.description ?? item.title).slice(0, 120)}.`);
    }
  }

  return lines.slice(0, 8);
}

function inferStrategySuccess(input: FamilyBrainInput, name: string): string[] {
  const lines: string[] = [];
  const strategies = [
    ...(input.profile?.successful_strategies ?? []),
    ...(input.profile?.calming_strategies ?? []),
  ];
  const wins = input.checkins.flatMap((c) => c.wins ?? []);
  const timelineText = (input.unifiedTimeline ?? [])
    .map((i) => `${i.title} ${i.description ?? ""}`)
    .join(" ")
    .toLowerCase();

  for (const strategy of strategies) {
    const lower = strategy.toLowerCase();
    const winHit = wins.some((w) => w.toLowerCase().includes(lower.split(" ")[0] ?? lower));
    const timelineHit = timelineText.includes(lower.split(" ")[0] ?? lower);
    if (winHit || timelineHit) {
      lines.push(`${name}'s family has seen "${strategy}" work more than once.`);
    }
  }

  const countdownHits =
    wins.filter((w) => /countdown|timer|visual|schedule|choice/i.test(w)).length +
    (timelineText.match(/countdown|timer|visual|schedule|choice/g)?.length ?? 0);
  if (countdownHits >= 2 && !lines.some((l) => /visual|timer|countdown/i.test(l))) {
    lines.push(`Visual preparation and countdown-style strategies keep showing up in ${name}'s wins.`);
  }

  return lines.slice(0, 4);
}

function inferRecoveryTime(checkins: DailyCheckin[], timeline: UnifiedTimelineItem[], name: string): string | null {
  const recoveryNotes = [
    ...checkins.flatMap((c) => c.wins ?? []),
    ...timeline.map((t) => t.description ?? t.title),
  ]
    .join(" ")
    .toLowerCase();

  if (/20 minute|15 minute|half an hour|quiet time|calm(ed)? down/i.test(recoveryNotes)) {
    return `We've noticed ${name} usually recovers within a short quiet window after overload — recovery time matters in this family.`;
  }
  if (checkins.length >= 4) {
    const recent = checkins.slice(0, 3);
    const older = checkins.slice(3, 7);
    if (older.length >= 2) {
      const recentSensory = avg(recent.map((c) => c.sensory_overload ?? 3));
      const olderSensory = avg(older.map((c) => c.sensory_overload ?? 3));
      if (recentSensory < olderSensory - 0.5) {
        return `${name} seems to bounce back a little faster after difficult moments lately.`;
      }
    }
  }
  return null;
}

function inferPeopleWhoHelp(profile: ChildProfile | null, debriefs: ParentDebrief[]): string[] {
  const lines: string[] = [];
  for (const person of profile?.support_team ?? []) {
    if (person.name) lines.push(`${person.name} (${person.role ?? "support"}) is part of the care team.`);
  }
  for (const d of debriefs.slice(0, 5)) {
    const msg = d.parent_message.toLowerCase();
    if (msg.includes("grandma") || msg.includes("grandad") || msg.includes("dad") || msg.includes("mum")) {
      lines.push(`Family members have been part of recent conversations about what helps.`);
      break;
    }
  }
  return lines.slice(0, 3);
}

export function buildFamilyBrain(input: FamilyBrainInput): FamilyBrainSnapshot {
  const name = input.child.nickname || input.child.first_name;
  const unified = input.unifiedTimeline ?? [];
  const mergedTimeline = [
    ...input.timelineEvents,
    ...unifiedToTimelineEvents(unified.filter((u) => u.source !== "timeline")),
  ];

  const reconciledPatterns = input.patterns.map((p) => {
    const { text, confidence } = reconcilePattern(p, input.checkins);
    return { ...p, description: text, confidence };
  });

  const memories = buildFamilyMemory({
    profile: input.profile,
    checkins: input.checkins,
    debriefs: input.debriefs,
    timeline: mergedTimeline,
    patterns: reconciledPatterns,
    unifiedTimeline: unified,
  });

  const companionInsights = buildCompanionInsights(input);
  const insightItems: FamilyInsight[] = companionInsights.map((i) => ({
    id: i.id,
    text: i.displayText,
    topics: i.topics,
    confidence: i.confidence,
  }));

  const understanding: string[] = [];

  for (const p of reconciledPatterns.slice(0, 4)) {
    understanding.push(`${name}: ${p.description}`);
  }

  understanding.push(...inferFromUnifiedTimeline(unified, name));
  understanding.push(...inferStrategySuccess(input, name));

  const recovery = inferRecoveryTime(input.checkins, unified, name);
  if (recovery) understanding.push(recovery);

  understanding.push(...inferPeopleWhoHelp(input.profile, input.debriefs));

  if (input.profile?.medication?.length) {
    understanding.push(`Medication is recorded in ${name}'s profile — treat medical questions with care.`);
  }
  if (input.profile?.favourite_things?.length) {
    understanding.push(`${name} enjoys: ${input.profile.favourite_things.slice(0, 4).join(", ")}.`);
  }
  if (input.profile?.notes?.trim()) {
    understanding.push(`Family notes: ${input.profile.notes.slice(0, 160)}.`);
  }

  for (const goal of input.goals?.filter((g) => g.status === "active").slice(0, 3) ?? []) {
    understanding.push(`Active goal: ${goal.title}.`);
  }
  for (const habit of input.habits?.slice(0, 3) ?? []) {
    understanding.push(`Family routine/habit: ${habit.title}.`);
  }

  const rhythmNote = inferWeekendRhythm(input.checkins, name);
  if (rhythmNote) understanding.push(rhythmNote);

  const childAgeNote = (() => {
    const age = childAgeYears(input.child);
    if (age == null) return null;
    return `${name} is about ${age} years old — age-appropriate expectations matter.`;
  })();

  const dedupedUnderstanding = [...new Set(understanding.map((l) => l.trim()))]
    .filter(Boolean)
    .slice(0, 14);

  const memoryLines = memories
    .filter((m) => m.date)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 10)
    .map(formatMemoryReference);

  return {
    understanding: dedupedUnderstanding,
    memoryLines,
    insightItems: insightItems.sort((a, b) => b.confidence - a.confidence).slice(0, 12),
    companionInsights,
    rhythmNote,
    childAgeNote,
    memories,
  };
}

export function selectBrainContextForMessage(
  brain: FamilyBrainSnapshot,
  message: string,
  limit = 8,
): { understanding: string[]; memoryLines: string[]; insightLines: string[] } {
  const msg = message.toLowerCase();
  const terms = msg.split(/\W+/).filter((w) => w.length > 3);

  const scoreLine = (line: string) => {
    const lower = line.toLowerCase();
    return terms.filter((t) => lower.includes(t)).length;
  };

  const understanding = [...brain.understanding]
    .sort((a, b) => scoreLine(b) - scoreLine(a))
    .slice(0, limit);

  const relevantMemories = findRelevantMemories(
    brain.memories,
    [...terms, ...SHOPPING_TERMS.filter((t) => msg.includes(t)), ...RECOVERY_TERMS.filter((t) => msg.includes(t))],
    3,
  );
  const memoryLines =
    relevantMemories.length > 0
      ? relevantMemories.map(formatMemoryReference)
      : brain.memoryLines.slice(0, 3);

  const matched = companionInsightForMessage(brain.companionInsights, message);
  const insightLines = matched
    ? [matched.displayText]
    : brain.companionInsights
        .sort((a, b) => scoreLine(b.body) - scoreLine(a.body))
        .slice(0, 3)
        .map((i) => i.displayText);

  return { understanding, memoryLines, insightLines };
}

export function formatBrainForPrompt(
  brain: FamilyBrainSnapshot,
  message?: string,
): string {
  const selected = message
    ? selectBrainContextForMessage(brain, message)
    : {
        understanding: brain.understanding.slice(0, 8),
        memoryLines: brain.memoryLines.slice(0, 6),
        insightLines: brain.companionInsights.slice(0, 4).map((i) => i.displayText),
      };

  const blocks: string[] = [];

  if (brain.childAgeNote) blocks.push(brain.childAgeNote);
  if (brain.rhythmNote) blocks.push(brain.rhythmNote);

  if (selected.understanding.length) {
    blocks.push("Family understanding (from THIS family's data — never invent beyond this):");
    blocks.push(...selected.understanding.map((l) => `- ${l}`));
  }

  if (selected.insightLines.length) {
    blocks.push("Evolving insights:");
    blocks.push(...selected.insightLines.map((l) => `- ${l}`));
  }

  if (selected.memoryLines.length) {
    blocks.push("Relevant memories:");
    blocks.push(...selected.memoryLines.map((l) => `- ${l}`));
  }

  return blocks.join("\n");
}

export async function loadFamilyBrainInput(childId: string): Promise<FamilyBrainInput | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const {
    getCheckins,
    getDebriefs,
    getGoals,
    getHabits,
    getInsights,
    getPatterns,
  } = await import("@/lib/data/queries");
  const { fetchUnifiedTimeline } = await import("@/lib/timeline/unified");

  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  if (!child) return null;

  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle();

  const [checkins, debriefs, patterns, unifiedTimeline, aiInsights, goalsData, habitsData] =
    await Promise.all([
      getCheckins(childId, 30),
      getDebriefs(childId),
      getPatterns(childId),
      fetchUnifiedTimeline(childId, 80),
      getInsights(childId, 10),
      getGoals(childId),
      getHabits(childId),
    ]);

  const { data: timelineEvents } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("child_id", childId)
    .order("event_date", { ascending: false })
    .limit(20);

  return {
    child,
    profile: profile ?? null,
    checkins,
    debriefs,
    patterns,
    timelineEvents: timelineEvents ?? [],
    unifiedTimeline,
    aiInsights,
    goals: goalsData.goals,
    goalUpdates: goalsData.updates,
    habits: habitsData.habits,
    habitEntries: habitsData.entries,
  };
}
