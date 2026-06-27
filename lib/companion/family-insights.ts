import type { ChildContext } from "@/lib/types/database";

export type FamilyInsight = {
  id: string;
  text: string;
  topics: string[];
  confidence: number;
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function buildFamilyInsights(context: ChildContext): FamilyInsight[] {
  const name = context.child.nickname || context.child.first_name;
  const insights: FamilyInsight[] = [];
  const checkins = context.recentCheckins;

  for (const p of context.patterns) {
    const lower = `${p.title} ${p.description}`.toLowerCase();
    const topics: string[] = [];
    if (lower.includes("morning") || lower.includes("school")) topics.push("morning", "school");
    if (lower.includes("sleep")) topics.push("sleep", "morning");
    if (lower.includes("sensory")) topics.push("sensory", "overwhelm");
    if (lower.includes("transition")) topics.push("transition", "change");

    insights.push({
      id: `pattern-${p.title}`,
      text: `${name} ${p.description.charAt(0).toLowerCase()}${p.description.slice(1)}`,
      topics,
      confidence: p.confidence ?? 0.75,
    });
  }

  const challenges = context.profile?.challenges ?? [];
  if (challenges.some((c) => /morning|transition/i.test(c))) {
    insights.push({
      id: "challenge-morning",
      text: `school mornings seem to ask extra emotional energy from ${name}`,
      topics: ["morning", "school", "transition"],
      confidence: 0.8,
    });
  }

  if (challenges.some((c) => /change|unexpected|transition/i.test(c))) {
    insights.push({
      id: "challenge-change",
      text: `unexpected change tends to land hardest for ${name}`,
      topics: ["transition", "change", "unexpected"],
      confidence: 0.82,
    });
  }

  const visualStrategies = [
    ...(context.profile?.successful_strategies ?? []),
    ...(context.profile?.calming_strategies ?? []),
  ].filter((s) => /visual|timer|schedule|picture|chart/i.test(s));

  if (visualStrategies.length) {
    insights.push({
      id: "visual-prep",
      text: `this family responds well when there's visual preparation — ${visualStrategies[0]} has come up before`,
      topics: ["visual", "planning", "transition"],
      confidence: 0.78,
    });
  }

  if (checkins.length >= 3) {
    const recent = checkins.slice(0, 3);
    const older = checkins.slice(3, 7);
    if (older.length >= 2) {
      const recentAnxiety = avg(recent.map((c) => c.anxiety ?? 3));
      const olderAnxiety = avg(older.map((c) => c.anxiety ?? 3));
      if (recentAnxiety < olderAnxiety - 0.4) {
        insights.push({
          id: "recovery-shorter",
          text: `${name} seems to recover a little faster after difficult moments lately`,
          topics: ["recovery", "regulation", "improving"],
          confidence: 0.7,
        });
      }

      const recentMood = avg(recent.map((c) => c.mood ?? 3));
      const olderMood = avg(older.map((c) => c.mood ?? 3));
      if (recentMood > olderMood + 0.4) {
        insights.push({
          id: "mood-lifting",
          text: `there's been a gentle lift in ${name}'s mood over recent weeks`,
          topics: ["mood", "improving"],
          confidence: 0.68,
        });
      }
    }
  }

  if (checkins.length >= 2) {
    const poorSleepHardSchool = checkins.filter(
      (c) => (c.sleep_quality ?? 3) <= 2 && (c.school_rating ?? 3) <= 2,
    );
    if (poorSleepHardSchool.length >= 2) {
      insights.push({
        id: "sleep-school-link",
        text: `when sleep is rough, the next school day often asks more of ${name}`,
        topics: ["sleep", "school", "morning"],
        confidence: 0.85,
      });
    }
  }

  for (const g of context.graphInsights ?? []) {
    insights.push({
      id: `graph-${g.slice(0, 20)}`,
      text: g.replace(new RegExp(`^${name}\\b`, "i"), name),
      topics: ["pattern"],
      confidence: 0.72,
    });
  }

  return insights
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}

export function insightForMessage(
  insights: FamilyInsight[],
  message: string,
): FamilyInsight | null {
  if (!insights.length) return null;
  const msg = message.toLowerCase();

  const scored = insights.map((insight) => {
    const topicHits = insight.topics.filter((t) => msg.includes(t)).length;
    const wordHits = insight.text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4)
      .filter((w) => msg.includes(w)).length;
    return { insight, score: topicHits * 2 + wordHits + insight.confidence * 0.5 };
  });

  scored.sort((a, b) => b.score - a.score);
  if (scored[0].score < 1) return null;
  return scored[0].insight;
}
