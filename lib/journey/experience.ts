import type { Child } from "@/lib/types/database";
import type { JourneyEntry, JourneyFilter } from "@/lib/journey/timeline";
import { getDayPhase } from "@/lib/companion/daily-rhythm";

export type JourneySection = "overview" | "timeline" | "calendar" | "milestones";

export type JourneyPeriodCard = {
  id: string;
  kind: "week" | "month";
  label: string;
  startDate: string;
  endDate: string;
  eventCount: number;
  conversationCount: number;
  mainFocus: string | null;
  biggestWin: string | null;
  biggestChallenge: string | null;
  milestoneCount: number;
  therapyCount: number;
  upcomingImportantEvent: JourneyEntry | null;
};

export type JourneyOverviewData = {
  greeting: string;
  todayJourneySummary: string;
  emotionalTone: string;
  thisWeekCount: number;
  thisWeekSummary: string;
  focusAreas: string[];
  recentWins: JourneyEntry[];
  recentChallenges: JourneyEntry[];
  upcomingEvents: JourneyEntry[];
  helpfulInsights: string[];
  recentWeeks: JourneyPeriodCard[];
  recentMonths: JourneyPeriodCard[];
};

const FOCUS_LABELS: Record<JourneyFilter, string> = {
  all: "All",
  conversations: "Conversations",
  health: "Health",
  sleep: "Sleep",
  school: "School",
  milestones: "Milestones",
  calendar: "Calendar",
  reports: "Reports",
  memories: "Memories",
};

function toDate(value: string): Date {
  return new Date(value);
}

function toIsoDate(value: Date): string {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
  const today = startOfToday();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date): Date {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return current;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function weekOfYear(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function startOfDaysAgo(days: number): Date {
  const day = startOfToday();
  day.setDate(day.getDate() - days);
  return day;
}

function includesMilestoneLanguage(text: string): boolean {
  return /milestone|first\s|breakthrough|victory|achievement|holiday|birthday|slept through/i.test(text);
}

function isChallenge(entry: JourneyEntry): boolean {
  const text = `${entry.title} ${entry.summary}`;
  return /challenge|challenging|difficult|hard|struggle|anxiety|meltdown|overwhelm|tough/i.test(text);
}

function firstName(name?: string | null): string {
  if (!name) return "there";
  const value = name.trim();
  if (!value) return "there";
  return value.split(" ")[0] || "there";
}

function greetingForParent(parentName?: string | null): string {
  const phase = getDayPhase();
  const name = firstName(parentName);
  if (phase === "morning") return `Good morning, ${name}.`;
  if (phase === "evening") return `Good evening, ${name}.`;
  return `Hello, ${name}.`;
}

function toneLabel(weekEntries: JourneyEntry[], wins: JourneyEntry[], challenges: JourneyEntry[]): string {
  if (!weekEntries.length) return "Settling";

  if (wins.length >= challenges.length + 2) return "Steady and hopeful";
  if (challenges.length >= wins.length + 2) return "Needs gentle support";
  return "Balanced and building";
}

function topFocusAreas(weekEntries: JourneyEntry[]): string[] {
  const counts = new Map<string, number>();

  for (const entry of weekEntries) {
    if (entry.filter !== "all") {
      const mapped = FOCUS_LABELS[entry.filter];
      if (mapped && mapped !== "All") {
        counts.set(mapped, (counts.get(mapped) || 0) + 1);
      }
    }

    const text = `${entry.title} ${entry.summary}`.toLowerCase();
    if (text.includes("anxiety")) counts.set("Anxiety", (counts.get("Anxiety") || 0) + 1);
    if (text.includes("sensory")) counts.set("Sensory", (counts.get("Sensory") || 0) + 1);
    if (text.includes("routine") || text.includes("transition")) {
      counts.set("Routine", (counts.get("Routine") || 0) + 1);
    }
    if (text.includes("communication") || text.includes("conversation")) {
      counts.set("Communication", (counts.get("Communication") || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label]) => label);
}

function buildTodaySummary(params: {
  childName: string;
  weekEntries: JourneyEntry[];
  wins: JourneyEntry[];
  challenges: JourneyEntry[];
  focusAreas: string[];
}): string {
  if (!params.weekEntries.length) {
    return `${params.childName}'s journey is quiet today. New moments will appear here as your week unfolds.`;
  }

  const winsPart = params.wins.length
    ? `${params.wins.length} recent wins are visible`
    : "wins are still building";
  const challengesPart = params.challenges.length
    ? `${params.challenges.length} recent challenges need gentle attention`
    : "no major challenges stand out right now";
  const focusPart = params.focusAreas.length ? `Focus areas: ${params.focusAreas.join(", ")}.` : "Focus areas are still emerging.";

  return `${params.childName} has ${params.weekEntries.length} logged moments this week. ${winsPart}, and ${challengesPart}. ${focusPart}`;
}

function filterEntriesInRange(entries: JourneyEntry[], start: Date, end: Date): JourneyEntry[] {
  return entries.filter((entry) => {
    const date = toDate(entry.date);
    return date >= start && date <= end;
  });
}

function countByNeedle(entries: JourneyEntry[], needles: string[]): number {
  return entries.filter((entry) => {
    const text = `${entry.title} ${entry.summary}`.toLowerCase();
    return needles.some((needle) => text.includes(needle));
  }).length;
}

function buildPeriodMainFocus(entries: JourneyEntry[]): string | null {
  if (!entries.length) return null;
  const focus = topFocusAreas(entries);
  return focus[0] || null;
}

function buildPeriodCards(params: {
  entries: JourneyEntry[];
  now: Date;
}): { recentWeeks: JourneyPeriodCard[]; recentMonths: JourneyPeriodCard[] } {
  const { entries, now } = params;
  const todayStart = startOfToday();

  const upcomingFromNow = entries
    .filter((entry) => isCalendarMoment(entry) || entry.filter === "milestones")
    .filter((entry) => toDate(entry.date) >= todayStart)
    .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());

  const recentWeeks: JourneyPeriodCard[] = [];
  for (let index = 0; index < 6; index += 1) {
    const anchor = new Date(now);
    anchor.setDate(anchor.getDate() - index * 7);
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    const rangeEntries = filterEntriesInRange(entries, start, end);
    if (!rangeEntries.length) continue;

    const wins = rangeEntries.filter((entry) => isWin(entry));
    const challenges = rangeEntries.filter((entry) => isChallenge(entry));
    const conversationCount = rangeEntries.filter((entry) => entry.filter === "conversations").length;
    const milestoneCount = rangeEntries.filter((entry) => entry.filter === "milestones").length;
    const therapyCount = countByNeedle(rangeEntries, ["therapy", "therapist"]);
    const upcomingImportantEvent = upcomingFromNow.find((entry) => toDate(entry.date) >= start && toDate(entry.date) <= end) || null;

    recentWeeks.push({
      id: `week-${start.toISOString().slice(0, 10)}`,
      kind: "week",
      label: `Week ${weekOfYear(start)}`,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      eventCount: rangeEntries.length,
      conversationCount,
      mainFocus: buildPeriodMainFocus(rangeEntries),
      biggestWin: wins[0]?.title || null,
      biggestChallenge: challenges[0]?.title || null,
      milestoneCount,
      therapyCount,
      upcomingImportantEvent,
    });
  }

  const recentMonths: JourneyPeriodCard[] = [];
  for (let index = 0; index < 4; index += 1) {
    const anchor = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    const rangeEntries = filterEntriesInRange(entries, start, end);
    if (!rangeEntries.length) continue;

    const wins = rangeEntries.filter((entry) => isWin(entry));
    const challenges = rangeEntries.filter((entry) => isChallenge(entry));
    const conversationCount = rangeEntries.filter((entry) => entry.filter === "conversations").length;
    const milestoneCount = rangeEntries.filter((entry) => entry.filter === "milestones").length;
    const therapyCount = countByNeedle(rangeEntries, ["therapy", "therapist"]);
    const upcomingImportantEvent = upcomingFromNow.find((entry) => toDate(entry.date) >= start && toDate(entry.date) <= end) || null;

    recentMonths.push({
      id: `month-${start.toISOString().slice(0, 7)}`,
      kind: "month",
      label: start.toLocaleString("en-GB", { month: "long", year: "numeric" }),
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      eventCount: rangeEntries.length,
      conversationCount,
      mainFocus: buildPeriodMainFocus(rangeEntries),
      biggestWin: wins[0]?.title || null,
      biggestChallenge: challenges[0]?.title || null,
      milestoneCount,
      therapyCount,
      upcomingImportantEvent,
    });
  }

  return {
    recentWeeks,
    recentMonths,
  };
}

function isWin(entry: JourneyEntry): boolean {
  if (entry.filter === "milestones") return true;
  const text = `${entry.title} ${entry.summary}`;
  return /win|wins|progress|breakthrough|victory|success|achievement/i.test(text);
}

function isCalendarMoment(entry: JourneyEntry): boolean {
  if (entry.filter === "calendar" || entry.filter === "school") return true;
  const text = `${entry.title} ${entry.summary}`.toLowerCase();
  return (
    text.includes("appointment") ||
    text.includes("therapy") ||
    text.includes("session") ||
    text.includes("school") ||
    text.includes("event") ||
    text.includes("birthday") ||
    text.includes("holiday")
  );
}

export function formatJourneyDate(dateIso: string): string {
  return toDate(dateIso).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildJourneyOverview(entries: JourneyEntry[], params?: { parentName?: string | null; childName?: string }): JourneyOverviewData {
  const now = new Date();
  const thisWeekStart = startOfDaysAgo(6);
  const todayStart = startOfToday();
  const childName = params?.childName || "Your child";

  const thisWeekEntries = entries.filter((entry) => {
    const date = toDate(entry.date);
    return date >= thisWeekStart && date <= now;
  });

  const recentWins = entries
    .filter((entry) => isWin(entry))
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .slice(0, 4);

  const recentChallenges = entries
    .filter((entry) => isChallenge(entry))
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .slice(0, 3);

  const focusAreas = topFocusAreas(thisWeekEntries);

  const upcomingEvents = entries
    .filter((entry) => isCalendarMoment(entry) || entry.filter === "milestones")
    .filter((entry) => toDate(entry.date) >= todayStart)
    .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime())
    .slice(0, 6);

  const helpfulInsights: string[] = [];

  const weekWins = thisWeekEntries.filter((entry) => isWin(entry));
  const weekChallenges = thisWeekEntries.filter((entry) => isChallenge(entry));
  const schoolEntries = thisWeekEntries.filter((entry) => /school/i.test(`${entry.title} ${entry.summary}`));
  const sleepEntries = thisWeekEntries.filter((entry) => /sleep|bedtime/i.test(`${entry.title} ${entry.summary}`));

  if (weekWins.length > 0) {
    helpfulInsights.push(`${weekWins.length} positive moments were recorded this week, showing steady progress.`);
  }

  if (sleepEntries.length > 0 && weekWins.some((entry) => /sleep|bedtime/i.test(`${entry.title} ${entry.summary}`))) {
    helpfulInsights.push("Sleep-related moments are showing signs of improvement in recent entries.");
  }

  if (schoolEntries.length > 0 && weekChallenges.some((entry) => /school/i.test(`${entry.title} ${entry.summary}`))) {
    helpfulInsights.push("School-related moments remain an active area for support this week.");
  }

  if (helpfulInsights.length === 0) {
    if (thisWeekEntries.length > 0) {
      helpfulInsights.push("Recent entries suggest a balanced week with gradual progress.");
    } else {
      helpfulInsights.push("Your journey is ready. As moments are logged, insights will appear here.");
    }
  }

  const thisWeekSummary =
    thisWeekEntries.length > 0
      ? `${thisWeekEntries.length} moments were captured this week across your family journey.`
      : "No moments were logged this week yet. Your journey timeline is ready when you are.";

  const greeting = greetingForParent(params?.parentName);
  const emotionalTone = toneLabel(thisWeekEntries, weekWins, weekChallenges);
  const todayJourneySummary = buildTodaySummary({
    childName,
    weekEntries: thisWeekEntries,
    wins: weekWins,
    challenges: weekChallenges,
    focusAreas,
  });
  const periods = buildPeriodCards({ entries, now });

  return {
    greeting,
    todayJourneySummary,
    emotionalTone,
    thisWeekCount: thisWeekEntries.length,
    thisWeekSummary,
    focusAreas,
    recentWins,
    recentChallenges,
    upcomingEvents,
    helpfulInsights: helpfulInsights.slice(0, 2),
    recentWeeks: periods.recentWeeks,
    recentMonths: periods.recentMonths,
  };
}

export function collectCalendarView(entries: JourneyEntry[]) {
  const todayStart = startOfToday();

  const items = entries
    .filter((entry) => isCalendarMoment(entry) || entry.filter === "milestones")
    .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());

  return {
    upcoming: items.filter((entry) => toDate(entry.date) >= todayStart),
    recent: items.filter((entry) => toDate(entry.date) < todayStart).slice(-8).reverse(),
  };
}

export function collectMilestones(entries: JourneyEntry[]): JourneyEntry[] {
  return entries
    .filter((entry) => entry.filter === "milestones" || includesMilestoneLanguage(`${entry.title} ${entry.summary}`))
    .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
}

export function buildPreparationSuggestion(entry: JourneyEntry, child: Child): string | null {
  const childName = child.nickname || child.first_name;
  const primaryNeed = child.support_needs.find((item) => item.trim().length > 0) || child.diagnosis[0] || null;
  if (!primaryNeed) return null;

  const text = `${entry.title} ${entry.summary}`.toLowerCase();
  if (text.includes("school")) {
    return `Preparation idea: review the school plan in advance and protect transition time around ${primaryNeed.toLowerCase()} support.`;
  }

  if (text.includes("therapy") || text.includes("appointment") || text.includes("medical")) {
    return `Preparation idea: share what helps ${childName} feel safe and predictable before this appointment.`;
  }

  if (text.includes("birthday") || text.includes("holiday") || text.includes("event")) {
    return `Preparation idea: keep plans simple and include familiar anchors that support ${primaryNeed.toLowerCase()}.`;
  }

  return `Preparation idea: a short preview of the day can support ${childName} around ${primaryNeed.toLowerCase()}.`;
}
