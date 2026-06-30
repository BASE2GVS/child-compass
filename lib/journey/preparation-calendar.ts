import { buildPreparationSuggestion, collectCalendarView } from "@/lib/journey/experience";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { Child } from "@/lib/types/database";

export type MemoryContext = {
  knownTriggers: string[];
  calmingStrategies: string[];
  successfulStrategies: string[];
  favouriteThings: string[];
  challenges: string[];
};

export type WeekAheadSummary = {
  items: JourneyEntry[];
  appointments: number;
  schoolEvents: number;
  birthdays: number;
  therapy: number;
  reminders: number;
};

function uniq(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function eventText(entry: JourneyEntry): string {
  return `${entry.title} ${entry.summary}`.toLowerCase();
}

function eventKind(entry: JourneyEntry): "therapy" | "school" | "medical" | "birthday" | "family" | "general" {
  const text = eventText(entry);
  if (text.includes("therapy") || text.includes("therapist")) return "therapy";
  if (text.includes("school")) return "school";
  if (text.includes("appointment") || text.includes("medical") || text.includes("health")) return "medical";
  if (text.includes("birthday")) return "birthday";
  if (text.includes("holiday") || text.includes("family") || text.includes("camp")) return "family";
  return "general";
}

export function getMemoryContext(entries: JourneyEntry[]): MemoryContext {
  const memories = entries.filter((entry) => entry.source === "memory");

  return {
    knownTriggers: uniq(memories.filter((entry) => entry.title === "Known trigger").map((entry) => entry.summary)),
    calmingStrategies: uniq(memories.filter((entry) => entry.title === "Calming strategy").map((entry) => entry.summary)),
    successfulStrategies: uniq(memories.filter((entry) => entry.title === "Successful strategy").map((entry) => entry.summary)),
    favouriteThings: uniq(memories.filter((entry) => entry.title === "Favourite thing").map((entry) => entry.summary)),
    challenges: uniq(memories.filter((entry) => entry.title === "Challenge").map((entry) => entry.summary)),
  };
}

export function buildPreparationDetails(
  entry: JourneyEntry,
  child: Child,
  memory: MemoryContext,
): {
  suggestions: string[];
  checklist: string[];
} {
  const kind = eventKind(entry);
  const supportNeed = child.support_needs.find((item) => item.trim().length > 0) || null;

  const suggestions: string[] = [];

  if (kind === "therapy" || kind === "medical") {
    memory.calmingStrategies.slice(0, 2).forEach((item) => suggestions.push(`Use calming strategy: ${item}`));
    memory.knownTriggers.slice(0, 1).forEach((item) => suggestions.push(`Plan around known trigger: ${item}`));
  }

  if (kind === "school") {
    memory.successfulStrategies.slice(0, 2).forEach((item) => suggestions.push(`Repeat successful strategy: ${item}`));
    memory.knownTriggers.slice(0, 1).forEach((item) => suggestions.push(`Reduce trigger risk: ${item}`));
  }

  if (kind === "birthday" || kind === "family") {
    memory.favouriteThings.slice(0, 2).forEach((item) => suggestions.push(`Bring familiar comfort: ${item}`));
    memory.calmingStrategies.slice(0, 1).forEach((item) => suggestions.push(`Use calming strategy: ${item}`));
  }

  if (kind === "general") {
    memory.successfulStrategies.slice(0, 1).forEach((item) => suggestions.push(`Repeat successful strategy: ${item}`));
    memory.calmingStrategies.slice(0, 1).forEach((item) => suggestions.push(`Use calming strategy: ${item}`));
  }

  if (supportNeed) {
    suggestions.push(`Keep support need in mind: ${supportNeed}`);
  }

  const baseline = buildPreparationSuggestion(entry, child);
  if (baseline) suggestions.push(baseline.replace(/^Preparation idea:\s*/i, ""));

  const dedupedSuggestions = uniq(suggestions).slice(0, 4);
  const checklist = dedupedSuggestions
    .map((item) =>
      item
        .replace(/^Use calming strategy:\s*/i, "")
        .replace(/^Repeat successful strategy:\s*/i, "")
        .replace(/^Bring familiar comfort:\s*/i, "")
        .replace(/^Plan around known trigger:\s*/i, "")
        .replace(/^Reduce trigger risk:\s*/i, "")
        .replace(/^Keep support need in mind:\s*/i, ""),
    )
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 4);

  return {
    suggestions: dedupedSuggestions,
    checklist,
  };
}

export function buildWeekAhead(upcoming: JourneyEntry[]): WeekAheadSummary {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const items = upcoming
    .filter((entry) => {
      const date = new Date(entry.date);
      return date >= now && date <= weekEnd;
    })
    .slice(0, 8);

  const appointments = items.filter((entry) => /appointment|medical|health/i.test(eventText(entry))).length;
  const schoolEvents = items.filter((entry) => /school/i.test(eventText(entry))).length;
  const birthdays = items.filter((entry) => /birthday/i.test(eventText(entry))).length;
  const therapy = items.filter((entry) => /therapy|therapist/i.test(eventText(entry))).length;
  const reminders = items.filter((entry) => /schedule|reminder|calendar/i.test(eventText(entry))).length;

  return {
    items,
    appointments,
    schoolEvents,
    birthdays,
    therapy,
    reminders,
  };
}

export function buildHelpfulPreparationNotes(entries: JourneyEntry[]): string[] {
  const now = new Date();
  const recentStart = new Date(now);
  recentStart.setDate(recentStart.getDate() - 14);

  const recent = entries.filter((entry) => {
    const date = new Date(entry.date);
    return date >= recentStart && date <= now;
  });

  const notes: string[] = [];
  const schoolMoments = recent.filter((entry) => /school/i.test(eventText(entry))).length;
  const sleepMoments = recent.filter((entry) => /sleep|bedtime/i.test(eventText(entry))).length;
  const therapyMoments = recent.filter((entry) => /therapy|therapist/i.test(eventText(entry))).length;

  if (schoolMoments > 0) {
    notes.push(`School-related moments appeared ${schoolMoments} times in recent journey history.`);
  }
  if (sleepMoments > 0) {
    notes.push(`Sleep-related moments appeared ${sleepMoments} times in recent journey history.`);
  }
  if (therapyMoments > 0) {
    notes.push(`Therapy-related moments appeared ${therapyMoments} times in recent journey history.`);
  }

  return notes.slice(0, 2);
}

export function collectTodayAhead(entries: JourneyEntry[]): JourneyEntry[] {
  const calendar = collectCalendarView(entries);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return calendar.upcoming
    .filter((entry) => {
      const date = new Date(entry.date);
      return date >= start && date < end;
    })
    .slice(0, 6);
}
