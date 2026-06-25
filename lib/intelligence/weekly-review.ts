import type { DailyCheckin, PatternFinding } from "@/lib/types/database";
import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";
import type { FamilyMemory } from "@/lib/intelligence/memory";
import { formatMemoryReference } from "@/lib/intelligence/memory";
import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import { buildWeeklySummaryPrompt } from "@/lib/ai/prompt-builder";
import { parseWeeklySummary } from "@/lib/ai/response-parser";

export type WeeklyFamilyReview = {
  headline: string;
  biggestSuccess: string;
  biggestChallenge: string;
  progressMade: string;
  patternsDiscovered: string[];
  recommendationsNextWeek: string[];
  celebration: string;
  learnings: { text: string; positive: boolean }[];
};

export function buildWeeklyFamilyReview(
  childName: string,
  weekCheckins: DailyCheckin[],
  patterns: PatternFinding[],
  memories: FamilyMemory[],
): WeeklyFamilyReview {
  const trend = compareWeeklyRegulation(weekCheckins);
  const wins = weekCheckins.flatMap((c) => c.wins || []);
  const challenges = weekCheckins.flatMap((c) => c.challenges || []);

  const biggestSuccess =
    wins[0] ||
    (trend.trend === "improving"
      ? `${childName}'s regulation has been gently improving this week.`
      : weekCheckins.length >= 3
        ? `You completed ${weekCheckins.length} check-ins — that consistency matters.`
        : `You showed up for ${childName} this week, and that counts.`);

  const biggestChallenge =
    challenges[0] ||
    (trend.trend === "declining"
      ? "Regulation felt lower at times — extra gentleness was warranted."
      : "Some days were harder than others, which is expected on this journey.");

  const progressMade =
    trend.trend === "improving"
      ? `${childName} recovered more easily across the week. ${trend.message}`
      : trend.trend === "stable"
        ? `Steady rhythms are building. ${trend.message}`
        : `You noticed what was hard and kept tracking — that awareness is progress.`;

  const patternsDiscovered =
    patterns.length > 0
      ? patterns.slice(0, 3).map((p) => p.title)
      : ["Keep checking in — patterns emerge with gentle consistency."];

  const memoryTip = memories.find((m) => m.date && m.category === "successful_transition");
  const recommendationsNextWeek = [
    memoryTip ? `Try again what helped before: ${formatMemoryReference(memoryTip)}` : null,
    "Keep mornings predictable and low-demand before school.",
    "Celebrate one small win each evening, however quiet.",
    trend.trend === "declining" ? "Build in extra recovery time after busy days." : null,
  ].filter((x): x is string => Boolean(x));

  const celebration =
    wins.length > 0
      ? `This week's brightest moment: ${wins[0]}`
      : `Your steady presence is helping ${childName} feel safer.`;

  const learnings = [
    { text: progressMade, positive: trend.trend !== "declining" },
    ...patternsDiscovered.map((p) => ({ text: p, positive: true })),
    { text: celebration, positive: true },
  ].slice(0, 5);

  return {
    headline:
      trend.trend === "improving"
        ? `A week of gentle progress for ${childName}`
        : `Your week with ${childName} — noticed and understood`,
    biggestSuccess,
    biggestChallenge,
    progressMade,
    patternsDiscovered,
    recommendationsNextWeek,
    celebration,
    learnings,
  };
}

export async function generateWeeklyFamilyReview(
  childName: string,
  weekCheckins: DailyCheckin[],
  patterns: PatternFinding[],
  memories: FamilyMemory[],
): Promise<WeeklyFamilyReview> {
  const local = buildWeeklyFamilyReview(childName, weekCheckins, patterns, memories);

  if (!isExternalLLMConfigured() || weekCheckins.length < 3) {
    return local;
  }

  try {
    const weekData = weekCheckins
      .map(
        (c) =>
          `${c.checkin_date}: sleep ${c.sleep_quality}/5, mood ${c.mood}/5, school ${c.school_rating}/5, wins: ${(c.wins || []).join("; ") || "none"}`,
      )
      .join("\n");
    const provider = getLLMProvider();
    const raw = await provider.complete(buildWeeklySummaryPrompt(childName, weekData), {
      temperature: 0.5,
    });
    const parsed = parseWeeklySummary(raw);
    if (!parsed) return local;

    const highlights = Array.isArray(parsed.highlights) ? parsed.highlights.map(String) : [];
    const challenges = Array.isArray(parsed.challenges) ? parsed.challenges.map(String) : [];
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
      : local.recommendationsNextWeek;

    return {
      ...local,
      headline: String(parsed.headline || local.headline),
      biggestSuccess: highlights[0] || local.biggestSuccess,
      biggestChallenge: challenges[0] || local.biggestChallenge,
      recommendationsNextWeek: recommendations.length ? recommendations : local.recommendationsNextWeek,
      progressMade: local.progressMade,
      patternsDiscovered: local.patternsDiscovered,
      celebration: local.celebration,
      learnings: local.learnings,
    };
  } catch {
    return local;
  }
}
