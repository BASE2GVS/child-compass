import type { DailyCheckin, PatternFinding } from "@/lib/types/database";

export type Celebration = {
  emoji: string;
  message: string;
};

export function detectCelebrations(
  childName: string,
  checkin: DailyCheckin | null,
  weekCheckins: DailyCheckin[],
  patterns: PatternFinding[],
  weeklyTrend: { trend: string; message: string } | null,
): Celebration[] {
  const celebrations: Celebration[] = [];

  const calmMornings = weekCheckins.filter(
    (c) => (c.mood ?? 3) >= 4 && (c.anxiety ?? 3) <= 3,
  );
  if (calmMornings.length >= 3) {
    celebrations.push({
      emoji: "🌅",
      message: `Three calmer mornings this week — ${childName} found steadier starts.`,
    });
  }

  if (weekCheckins.length >= 5) {
    celebrations.push({
      emoji: "📅",
      message: `Five check-ins completed — Child Compass now understands ${childName} much more clearly.`,
    });
  } else if (weekCheckins.length >= 3) {
    celebrations.push({
      emoji: "✨",
      message: `${weekCheckins.length} check-ins this week — you're building a meaningful picture.`,
    });
  }

  if (weekCheckins.length >= 4) {
    const sleepAvg =
      weekCheckins.slice(0, 4).reduce((s, c) => s + (c.sleep_quality ?? 3), 0) / 4;
    const priorSleep =
      weekCheckins.slice(4, 7).reduce((s, c) => s + (c.sleep_quality ?? 3), 0) /
      Math.max(1, weekCheckins.slice(4, 7).length);
    if (sleepAvg > priorSleep + 0.5) {
      celebrations.push({
        emoji: "😴",
        message: "Bedtime routines may be supporting better rest lately.",
      });
    }
  }

  if (weeklyTrend?.trend === "improving") {
    celebrations.push({
      emoji: "💚",
      message: `${childName} recovered more easily after difficult moments this week.`,
    });
  }

  if (checkin?.wins?.length) {
    celebrations.push({
      emoji: "🎉",
      message: `Today's win: ${checkin.wins[0]}`,
    });
  }

  const freshPattern = patterns.find((p) => (p.confidence ?? 0) >= 0.75);
  if (freshPattern) {
    celebrations.push({
      emoji: "🔍",
      message: `A helpful pattern emerged: ${freshPattern.title.toLowerCase()}.`,
    });
  }

  if (celebrations.length === 0) {
    celebrations.push({
      emoji: "❤️",
      message: `You're showing up for ${childName} — that steady care is meaningful progress.`,
    });
  }

  return celebrations.slice(0, 4);
}
