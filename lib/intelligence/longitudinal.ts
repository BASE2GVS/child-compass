import type { DailyCheckin, PatternFinding } from "@/lib/types/database";
import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";

export type LongitudinalPeriod = "30d" | "90d" | "180d" | "365d";

export type LongitudinalReview = {
  period: LongitudinalPeriod;
  periodLabel: string;
  headline: string;
  progress: string[];
  recurringChallenges: string[];
  helpfulStrategies: string[];
  changesOverTime: string[];
  comparisonNote: string;
};

const PERIOD_DAYS: Record<LongitudinalPeriod, number> = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

const PERIOD_LABELS: Record<LongitudinalPeriod, string> = {
  "30d": "30-day review",
  "90d": "90-day review",
  "180d": "6-month review",
  "365d": "Annual review",
};

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function filterByDays(checkins: DailyCheckin[], days: number): DailyCheckin[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return checkins.filter((c) => c.checkin_date >= cutoffStr);
}

export function generateLongitudinalReview(
  childName: string,
  allCheckins: DailyCheckin[],
  patterns: PatternFinding[],
  period: LongitudinalPeriod,
): LongitudinalReview {
  const days = PERIOD_DAYS[period];
  const periodCheckins = filterByDays(allCheckins, days);
  const priorCheckins = filterByDays(allCheckins, days * 2).filter(
    (c) => !periodCheckins.some((p) => p.id === c.id),
  );

  const moodNow = avg(periodCheckins.map((c) => c.mood ?? 3));
  const moodPrior = avg(priorCheckins.map((c) => c.mood ?? 3));
  const anxietyNow = avg(periodCheckins.map((c) => c.anxiety ?? 3));
  const anxietyPrior = avg(priorCheckins.map((c) => c.anxiety ?? 3));
  const sleepNow = avg(periodCheckins.map((c) => c.sleep_quality ?? 3));
  const schoolNow = avg(periodCheckins.map((c) => c.school_rating ?? 3));

  const trend = compareWeeklyRegulation(periodCheckins.slice(0, 7));
  const wins = periodCheckins.flatMap((c) => c.wins || []);
  const challenges = periodCheckins.flatMap((c) => c.challenges || []);

  const progress: string[] = [];
  if (moodNow > moodPrior + 0.3) {
    progress.push(`${childName}'s average mood improved compared with the previous ${days} days.`);
  }
  if (anxietyNow < anxietyPrior - 0.3) {
    progress.push("Anxiety ratings are gently lower than the prior period.");
  }
  if (wins.length >= 3) {
    progress.push(`Families logged ${wins.length} wins — including: ${wins[0]}`);
  }
  if (progress.length === 0) {
    progress.push(`You have built a ${periodCheckins.length}-check-in picture of ${childName}'s rhythms — that consistency is meaningful progress.`);
  }

  const recurringChallenges = [
    ...new Set([
      ...challenges.slice(0, 3),
      ...patterns.slice(0, 2).map((p) => p.title),
    ]),
  ].filter(Boolean);

  const helpfulStrategies = wins.slice(0, 4);
  if (helpfulStrategies.length === 0) {
    helpfulStrategies.push("Keep noting what helps, even in small moments — strategies emerge over time.");
  }

  const changesOverTime: string[] = [];
  if (sleepNow >= 3.5) changesOverTime.push("Sleep ratings have been relatively supportive recently.");
  if (schoolNow >= 3.5) changesOverTime.push("School tolerance has been steadier in this period.");
  if (trend.trend === "improving") changesOverTime.push(trend.message);
  if (trend.trend === "declining") changesOverTime.push("Regulation has felt harder lately — extra gentleness is warranted.");
  if (changesOverTime.length === 0) {
    changesOverTime.push("Patterns are still forming — longitudinal insight strengthens with continued check-ins.");
  }

  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    headline: `${PERIOD_LABELS[period]} for ${childName}`,
    progress,
    recurringChallenges,
    helpfulStrategies,
    changesOverTime,
    comparisonNote: `This review compares ${childName} only with their own earlier history — never with other children.`,
  };
}

export const LONGITUDINAL_REPORT_TYPES: { period: LongitudinalPeriod; reportType: string }[] = [
  { period: "30d", reportType: "review_30d" },
  { period: "90d", reportType: "review_90d" },
  { period: "180d", reportType: "review_6mo" },
  { period: "365d", reportType: "review_annual" },
];
