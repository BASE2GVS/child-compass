import type { FamilyBrainInput } from "@/lib/intelligence/family-brain";
import { inferDayType } from "@/lib/timeline/day-type";
import type { DailyCheckin, UnifiedTimelineItem } from "@/lib/types/database";

export type CompanionInsightType = "noticing" | "positive" | "watching" | "strategy";

export type CompanionInsight = {
  id: string;
  type: CompanionInsightType;
  body: string;
  displayText: string;
  confidence: number;
  confidenceLabel: string;
  topics: string[];
  supportingEvents: { label: string; date?: string }[];
};

const PREFIX: Record<CompanionInsightType, string> = {
  noticing: "We're beginning to notice that ",
  positive: "Something positive: ",
  watching: "Something worth watching: ",
  strategy: "A strategy that's helping: ",
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function confidenceLabel(confidence: number, evidenceCount: number): string {
  if (evidenceCount <= 1 || confidence < 0.55) {
    return "We're only beginning to learn about this.";
  }
  if (confidence < 0.75 || evidenceCount <= 3) {
    return "We've seen this a few times in your family's story.";
  }
  return "This has been consistently true in what you've shared.";
}

export function formatCompanionInsight(
  type: CompanionInsightType,
  body: string,
  confidence: number,
  supportingEvents: CompanionInsight["supportingEvents"],
): CompanionInsight {
  const label = confidenceLabel(confidence, supportingEvents.length);
  const displayBody = body.charAt(0).toLowerCase() + body.slice(1).replace(/\.$/, "");
  return {
    id: `${type}-${displayBody.slice(0, 24).replace(/\W+/g, "-")}`,
    type,
    body,
    displayText: `${PREFIX[type]}${displayBody}.`,
    confidence,
    confidenceLabel: label,
    topics: [],
    supportingEvents,
  };
}

function withTopics(insight: CompanionInsight, topics: string[]): CompanionInsight {
  return { ...insight, topics };
}

function supportFromCheckins(checkins: DailyCheckin[], filter: (c: DailyCheckin) => boolean): CompanionInsight["supportingEvents"] {
  return checkins
    .filter(filter)
    .slice(0, 4)
    .map((c) => ({
      label: `Check-in · mood ${c.mood}/5 · sleep ${c.sleep_quality}/5`,
      date: c.checkin_date,
    }));
}

function supportFromTimeline(items: UnifiedTimelineItem[], match: (t: string) => boolean): CompanionInsight["supportingEvents"] {
  return items
    .filter((i) => match(`${i.title} ${i.description ?? ""}`.toLowerCase()))
    .slice(0, 4)
    .map((i) => ({
      label: i.title,
      date: i.event_date.split("T")[0],
    }));
}

export function buildCompanionInsights(input: FamilyBrainInput): CompanionInsight[] {
  const name = input.child.nickname || input.child.first_name;
  const checkins = input.checkins;
  const patterns = input.patterns;
  const timeline = input.unifiedTimeline ?? [];
  const insights: CompanionInsight[] = [];
  const seen = new Set<string>();

  function add(insight: CompanionInsight) {
    const key = insight.body.slice(0, 50);
    if (seen.has(key)) return;
    seen.add(key);
    insights.push(insight);
  }

  for (const p of patterns) {
    const evidence = (p.evidence as Record<string, unknown>) ?? {};
    const count = Number(evidence.occurrences ?? evidence.low_sleep_days ?? evidence.high_sensory_days ?? 3);
    const support: CompanionInsight["supportingEvents"] = [
      { label: p.title, date: p.updated_at?.split("T")[0] },
    ];
    if (count >= 2) {
      support.push(...supportFromCheckins(checkins, () => true).slice(0, 2));
    }
    const lower = `${p.title} ${p.description}`.toLowerCase();
    const type: CompanionInsightType =
      lower.includes("recover") || lower.includes("improv") ? "positive" : "noticing";
    const desc = p.description.charAt(0).toLowerCase() + p.description.slice(1).replace(/\.$/, "");
    add(
      withTopics(
        formatCompanionInsight(type, `${desc} for ${name}`, p.confidence ?? 0.75, support),
        inferTopics(lower),
      ),
    );
  }

  const mondays = checkins.filter((c) => new Date(c.checkin_date).getDay() === 1);
  const sundays = checkins.filter((c) => new Date(c.checkin_date).getDay() === 0);
  if (mondays.length >= 2) {
    const mondayAnxiety = avg(mondays.map((c) => c.anxiety ?? 3));
    const otherAnxiety = avg(
      checkins.filter((c) => new Date(c.checkin_date).getDay() !== 1).map((c) => c.anxiety ?? 3),
    );
    const poorSunday = sundays.filter((c) => (c.sleep_quality ?? 3) <= 2);
    if (mondayAnxiety > otherAnxiety + 0.5) {
      const support = [
        ...supportFromCheckins(mondays, () => true),
        ...supportFromCheckins(poorSunday, () => true),
      ].slice(0, 4);
      add(
        withTopics(
          formatCompanionInsight(
            "noticing",
            `${name} often finds Monday mornings more difficult${poorSunday.length ? " after late or restless Sunday evenings" : ""}`,
            poorSunday.length >= 2 ? 0.78 : 0.65,
            support,
          ),
          ["monday", "school", "sleep", "morning"],
        ),
      );
    }
  }

  if (checkins.length >= 4) {
    const recent = checkins.slice(0, 4);
    const older = checkins.slice(4, 10);
    if (older.length >= 3) {
      const recentSensory = avg(recent.map((c) => c.sensory_overload ?? 3));
      const olderSensory = avg(older.map((c) => c.sensory_overload ?? 3));
      if (recentSensory < olderSensory - 0.45) {
        add(
          withTopics(
            formatCompanionInsight(
              "positive",
              `recovery after sensory overload has become noticeably quicker over the past few weeks for ${name}`,
              0.72,
              supportFromCheckins(recent, (c) => (c.sensory_overload ?? 3) >= 3),
            ),
            ["recovery", "sensory", "regulation"],
          ),
        );
      }

      const recentSchool = avg(recent.map((c) => c.school_rating ?? 3));
      const olderSchool = avg(older.map((c) => c.school_rating ?? 3));
      if (recentSchool > olderSchool + 0.4) {
        add(
          withTopics(
            formatCompanionInsight(
              "positive",
              `school mornings have felt a little easier for ${name} over the last month`,
              0.7,
              supportFromCheckins(recent, (c) => (c.school_rating ?? 3) >= 4),
            ),
            ["school", "morning", "improving"],
          ),
        );
      }
    }
  }

  const shoppingEvents = supportFromTimeline(timeline, (t) =>
    /shop|shopping|supermarket|crowd|shoes|sensory overload/.test(t),
  );
  if (shoppingEvents.length >= 2) {
    add(
      withTopics(
        formatCompanionInsight(
          "watching",
          `we've only seen this ${shoppingEvents.length} times, but busy shopping trips have both been followed by overload for ${name}`,
          0.58,
          shoppingEvents,
        ),
        ["shopping", "sensory", "overwhelm", "shop", "supermarket"],
      ),
    );
  } else if (shoppingEvents.length === 1) {
    add(
      withTopics(
        formatCompanionInsight(
          "watching",
          `we've only seen this once so far, but a busy shopping trip preceded a difficult moment for ${name}`,
          0.48,
          shoppingEvents,
        ),
        ["shopping", "sensory", "shop", "supermarket"],
      ),
    );
  }

  const strategies = [
    ...(input.profile?.successful_strategies ?? []),
    ...(input.profile?.calming_strategies ?? []),
  ];
  const wins = checkins.flatMap((c) => c.wins ?? []);
  for (const strategy of strategies) {
    const lower = strategy.toLowerCase();
    const winHits = wins.filter((w) => w.toLowerCase().includes(lower.split(" ")[0] ?? lower)).length;
    const timelineHits = timeline.filter((i) =>
      `${i.title} ${i.description ?? ""}`.toLowerCase().includes(lower.split(" ")[0] ?? lower),
    ).length;
    if (winHits + timelineHits >= 1) {
      const support = [
        ...wins.filter((w) => w.toLowerCase().includes(lower.split(" ")[0] ?? lower)).slice(0, 2).map((w) => ({ label: w })),
        ...supportFromTimeline(timeline, (t) => t.includes(lower.split(" ")[0] ?? lower)),
      ].slice(0, 3);
      const body = /choice/i.test(strategy)
        ? `offering ${name} two choices continues to work well in difficult transitions`
        : `${strategy} continues to come up in moments that went well for ${name}`;
      add(
        withTopics(
          formatCompanionInsight("strategy", body, Math.min(0.85, 0.6 + winHits * 0.1), support),
          ["strategy", "transition", "choice"],
        ),
      );
    }
  }

  const resolveDayType = (c: DailyCheckin) =>
    c.day_type ?? inferDayType(new Date(c.checkin_date));

  const weekend = checkins.filter((c) => resolveDayType(c) === "weekend");
  const weekday = checkins.filter((c) => resolveDayType(c) === "weekday");
  if (weekend.length >= 2 && weekday.length >= 4) {
    const wkndMood = avg(weekend.map((c) => c.mood ?? 3));
    const dayMood = avg(weekday.map((c) => c.mood ?? 3));
    if (Math.abs(wkndMood - dayMood) >= 0.5) {
      const easier = wkndMood > dayMood ? "weekends" : "weekdays";
      add(
        withTopics(
          formatCompanionInsight(
            "noticing",
            `${name}'s mood tends to be ${easier === "weekends" ? "gentler on weekends" : " steadier on school days"} — routines may shape how days feel`,
            0.68,
            supportFromCheckins(easier === "weekends" ? weekend : weekday, () => true).slice(0, 3),
          ),
          ["weekend", "weekday", "rhythm"],
        ),
      );
    }
  }

  const medEvents = timeline.filter((i) => i.category === "medication" || /medication|melatonin/i.test(`${i.title} ${i.description}`));
  if (medEvents.length >= 2) {
    add(
      withTopics(
        formatCompanionInsight(
          "watching",
          `medication notes appear regularly in ${name}'s timeline — worth keeping sleep and mood alongside them`,
          0.62,
          medEvents.slice(0, 3).map((i) => ({ label: i.title, date: i.event_date.split("T")[0] })),
        ),
        ["medication", "health", "sleep"],
      ),
    );
  }

  const therapyEvents = timeline.filter((i) => i.source === "therapy" || i.category === "therapy");
  if (therapyEvents.length >= 2) {
    add(
      withTopics(
        formatCompanionInsight(
          "noticing",
          `therapy sessions are part of ${name}'s recent rhythm — you may notice shifts in the days around them`,
          0.65,
          therapyEvents.slice(0, 3).map((i) => ({ label: i.title, date: i.event_date.split("T")[0] })),
        ),
        ["therapy", "regulation"],
      ),
    );
  }

  const poorSleepSchool = checkins.filter((c) => (c.sleep_quality ?? 3) <= 2 && (c.school_rating ?? 3) <= 2);
  if (poorSleepSchool.length >= 2) {
    add(
      withTopics(
        formatCompanionInsight(
          "noticing",
          `when sleep is rough, the next school day often asks more of ${name}`,
          0.8,
          supportFromCheckins(poorSleepSchool, () => true),
        ),
        ["sleep", "school"],
      ),
    );
  }

  for (const stored of input.aiInsights?.slice(0, 4) ?? []) {
    add(
      withTopics(
        {
          ...formatCompanionInsight(
            stored.content.toLowerCase().includes("improv") ? "positive" : "noticing",
            stored.content.replace(/\.$/, ""),
            stored.confidence ?? 0.7,
            [{ label: stored.title, date: stored.created_at.split("T")[0] }],
          ),
          id: `stored-${stored.id}`,
        },
        stored.title.toLowerCase().split(/\W+/).filter((w) => w.length > 4),
      ),
    );
  }

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
}

function inferTopics(text: string): string[] {
  const topics: string[] = [];
  if (/school|morning|monday/.test(text)) topics.push("school", "morning");
  if (/sleep|bed|night|sunday/.test(text)) topics.push("sleep");
  if (/sensory|shop|crowd|overload/.test(text)) topics.push("sensory", "shopping");
  if (/recover|regulat/.test(text)) topics.push("recovery", "regulation");
  if (/therap/.test(text)) topics.push("therapy");
  if (/medication|medicine/.test(text)) topics.push("medication");
  if (/transition|choice/.test(text)) topics.push("transition");
  if (/weekend|holiday/.test(text)) topics.push("weekend");
  return topics;
}

export function insightForMessage(insights: CompanionInsight[], message: string): CompanionInsight | null {
  const msg = message.toLowerCase();
  const scored = insights.map((insight) => {
    const topicHits = insight.topics.filter((t) => msg.includes(t)).length;
    const supportHits = insight.supportingEvents.filter((e) =>
      msg.split(/\W+/).some((w) => w.length > 4 && e.label.toLowerCase().includes(w)),
    ).length;
    const wordHits = insight.body
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4)
      .filter((w) => msg.includes(w)).length;
    return { insight, score: topicHits * 2 + wordHits + supportHits + insight.confidence * 0.4 };
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored[0]?.score < 0.8) return null;
  return scored[0].insight;
}

export function headlineCompanionInsight(insights: CompanionInsight[]): CompanionInsight | null {
  return insights[0] ?? null;
}

export function insightsForReport(
  insights: CompanionInsight[],
  reportType: string,
): CompanionInsight[] {
  const topicMap: Record<string, string[]> = {
    teacher_guide: ["school", "morning", "sensory", "strategy", "transition"],
    pda_passport: ["strategy", "transition", "sensory", "recovery"],
    school_support: ["school", "morning", "sleep"],
    weekly_summary: ["school", "sleep", "recovery", "improving", "weekend"],
    therapist_summary: ["therapy", "regulation", "recovery", "sensory"],
    monthly_progress: ["improving", "school", "sleep", "recovery"],
  };
  const topics = topicMap[reportType] ?? [];
  if (!topics.length) return insights.slice(0, 4);
  return insights
    .filter((i) => i.topics.some((t) => topics.includes(t)) || topics.some((t) => i.body.toLowerCase().includes(t)))
    .slice(0, 5);
}

export function insightDisplayWithSupport(insight: CompanionInsight): string {
  if (!insight.supportingEvents.length) return `${insight.displayText} ${insight.confidenceLabel}`;
  const refs = insight.supportingEvents
    .slice(0, 2)
    .map((e) => (e.date ? `${e.label} (${e.date})` : e.label))
    .join("; ");
  return `${insight.displayText} ${insight.confidenceLabel} Based on: ${refs}.`;
}

export async function loadCompanionInsights(childId: string): Promise<CompanionInsight[]> {
  const { loadFamilyBrainInput } = await import("@/lib/intelligence/family-brain");
  const input = await loadFamilyBrainInput(childId);
  if (!input) return [];
  return buildCompanionInsights(input);
}
