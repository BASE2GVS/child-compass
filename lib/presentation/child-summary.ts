import {
  buildDailyBriefing,
  schoolReadinessScore,
} from "@/lib/dashboard/briefing";
import type { ChildIntelligenceSnapshot, DailyCheckin } from "@/lib/types/database";

const MOOD_EMOJI = ["😢", "😕", "😐", "🙂", "😊"];

export function moodEmoji(mood: number | null | undefined): string {
  const v = mood ?? 3;
  return MOOD_EMOJI[Math.max(0, Math.min(4, v - 1))];
}

export function moodLabel(mood: number | null | undefined): string {
  const v = mood ?? 3;
  if (v >= 4) return "Feeling good";
  if (v <= 2) return "Having a tough day";
  return "Steady";
}

export function buildChildCardSummary(
  childName: string,
  checkin: DailyCheckin | null,
  intelligence: ChildIntelligenceSnapshot,
) {
  const briefing = buildDailyBriefing(childName, checkin, null, null, null);
  const recommendation = briefing.sections.find((s) => s.label === "Recommendation");
  const mood = briefing.sections.find((s) => s.label === "Mood");
  const readiness = schoolReadinessScore(checkin, intelligence);

  return {
    moodEmoji: moodEmoji(checkin?.mood),
    moodLabel: moodLabel(checkin?.mood),
    aiSummary: mood?.message ?? `Start a check-in to unlock insights for ${childName}.`,
    schoolReadiness: readiness,
    todayRecommendation: recommendation?.message ?? "When you're ready, a check-in opens a personalised tip.",
    hasCheckin: Boolean(checkin),
  };
}
