import type { CoachMessage, DailyCheckin, PatternFinding } from "@/lib/types/database";

export type EveningReflection = {
  learned: string;
  encouraging: string;
  tomorrowMind: string;
};

function messagesToday(messages: CoachMessage[]): CoachMessage[] {
  const today = new Date().toISOString().split("T")[0];
  return messages.filter((m) => m.created_at.startsWith(today));
}

export function buildEveningReflection(input: {
  childName: string;
  checkin: DailyCheckin | null;
  yesterdayCheckin: DailyCheckin | null;
  coachMessages: CoachMessage[];
  patterns: PatternFinding[];
  weeklyTrend: "improving" | "stable" | "declining" | null;
}): EveningReflection {
  const { childName, checkin, coachMessages, patterns, weeklyTrend } = input;
  const todayCoach = messagesToday(coachMessages);
  const parentTalkedToday = todayCoach.some((m) => m.role === "parent");

  let learned = `Today added another piece to understanding ${childName}.`;
  if (checkin?.challenges?.length) {
    learned = `One thing I learned today — ${childName} found "${checkin.challenges[0]}" especially hard.`;
  } else if (patterns[0] && parentTalkedToday) {
    learned = `One thing I learned today — ${patterns[0].description.charAt(0).toLowerCase()}${patterns[0].description.slice(1)}`;
  } else if (checkin && (checkin.sleep_quality ?? 3) <= 2) {
    learned = `One thing I learned today — sleep was rough, and that shaped how much ${childName} could carry.`;
  } else if (parentTalkedToday) {
    learned = "One thing I learned today — you showed up to talk, even when it wasn't easy.";
  }

  let encouraging = "You don't need a perfect day. Showing up is enough.";
  if (checkin?.wins?.length) {
    encouraging = `One encouraging observation — "${checkin.wins[0]}". That matters.`;
  } else if (weeklyTrend === "improving") {
    encouraging = `One encouraging observation — there's a gentle lift in ${childName}'s week.`;
  } else if (parentTalkedToday) {
    encouraging = "One encouraging observation — you made space to think things through today.";
  } else if (checkin && (checkin.mood ?? 3) >= 4) {
    encouraging = `One encouraging observation — ${childName} had some steadier moments today.`;
  }

  let tomorrowMind = "Tomorrow can start fresh — no need to solve tonight.";
  if (checkin && (checkin.anxiety ?? 3) >= 4) {
    tomorrowMind = "One thing to keep in mind tomorrow — go slowly in the morning. Regulation first.";
  } else if (patterns.some((p) => p.description.toLowerCase().includes("morning"))) {
    tomorrowMind = "One thing to keep in mind tomorrow — mornings may need extra preparation time.";
  } else if ((checkin?.sleep_quality ?? 3) <= 2) {
    tomorrowMind = "One thing to keep in mind tomorrow — protect bedtime tonight if you can.";
  } else if (todayCoach.length > 0) {
    tomorrowMind = "One thing to keep in mind tomorrow — we can build on what you shared today.";
  }

  return { learned, encouraging, tomorrowMind };
}
