import type {
  ChildIntelligenceSnapshot,
  DailyCheckin,
  PatternFinding,
  UnifiedTimelineItem,
} from "@/lib/types/database";
import { detectCelebrations } from "@/lib/intelligence/celebrations";
import { generatePredictions } from "@/lib/intelligence/predictions";

export type BriefingSection = {
  emoji: string;
  label: string;
  message: string;
  confidence: number;
};

export type BriefingPayload = {
  sections: BriefingSection[];
  overallConfidence: number;
};

function ratingWord(value: number | null | undefined, positive: string, neutral: string, negative: string): string {
  const v = value ?? 3;
  if (v >= 4) return positive;
  if (v <= 2) return negative;
  return neutral;
}

function sleepComparison(today: DailyCheckin | null, yesterday: DailyCheckin | null): string {
  if (!today?.sleep_quality) {
    return "Complete a morning check-in to learn how rest is shaping today.";
  }
  const word = ratingWord(
    today.sleep_quality,
    "Rest looks supportive today.",
    "Sleep was average last night.",
    "Sleep was disrupted — extra gentleness may help.",
  );
  if (yesterday?.sleep_quality && today.sleep_quality > yesterday.sleep_quality) {
    return `Improved compared with yesterday. ${word}`;
  }
  if (yesterday?.sleep_quality && today.sleep_quality < yesterday.sleep_quality) {
    return `A little lower than yesterday. ${word}`;
  }
  return word;
}

export function buildDailyBriefing(
  childName: string,
  checkin: DailyCheckin | null,
  yesterdayCheckin: DailyCheckin | null,
  recommendation: string | null,
  weeklyTrendMessage: string | null,
  headlineInsight?: string | null,
): BriefingPayload {
  const moodMessage = checkin
    ? ratingWord(
        checkin.mood,
        "Calm and emotionally settled.",
        "Steady, with room to watch transitions.",
        "Emotions may feel closer to the surface today.",
      )
    : weeklyTrendMessage || `Start today's check-in to unlock ${childName}'s mood briefing.`;

  const sleepMessage = sleepComparison(checkin, yesterdayCheckin);

  const schoolMessage = checkin
    ? ratingWord(
        checkin.school_rating,
        "Transition may be easier today.",
        "School may need a predictable, low-demand approach.",
        "School tolerance looks lower — consider reducing morning pressure.",
      )
    : `Child Compass will predict school readiness as you track ${childName}'s mornings.`;

  const recMessage =
    recommendation ||
    headlineInsight ||
    "Offer choices rather than instructions when you can — it often lowers demand.";

  const sections: BriefingSection[] = [
    { emoji: "😊", label: "Mood", message: moodMessage, confidence: checkin ? 0.86 : 0.52 },
    { emoji: "😴", label: "Sleep", message: sleepMessage, confidence: checkin ? 0.84 : 0.48 },
    { emoji: "🎒", label: "School", message: schoolMessage, confidence: checkin ? 0.8 : 0.5 },
    { emoji: "❤️", label: "Recommendation", message: recMessage, confidence: recommendation ? 0.9 : 0.65 },
  ];

  const overallConfidence =
    sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length;

  return { sections, overallConfidence };
}

export function schoolReadinessScore(
  checkin: DailyCheckin | null,
  intelligence: ChildIntelligenceSnapshot,
): number {
  if (checkin?.school_rating) {
    return Math.round((checkin.school_rating / 5) * 100);
  }
  return Math.round(intelligence.demandTolerance);
}

export function schoolReadinessExplanation(
  checkin: DailyCheckin | null,
  intelligence: ChildIntelligenceSnapshot,
  childName: string,
): { explanation: string; confidence: number; confidenceLabel: string } {
  const score = schoolReadinessScore(checkin, intelligence);
  const hasCheckin = Boolean(checkin);

  if (!hasCheckin) {
    return {
      explanation: `Complete a check-in to help Child Compass understand ${childName}'s school readiness today.`,
      confidence: 0.45,
      confidenceLabel: "Building confidence",
    };
  }

  const sleepOk = (checkin!.sleep_quality ?? 3) >= 3;
  const sensoryOk = (checkin!.sensory_overload ?? 3) <= 3;
  const anxietyLow = (checkin!.anxiety ?? 3) <= 3;

  if (score >= 75 && sleepOk && sensoryOk) {
    return {
      explanation: "Good sleep and low sensory load suggest an easier transition this morning.",
      confidence: 0.88,
      confidenceLabel: "High confidence",
    };
  }
  if (score >= 50) {
    return {
      explanation: "Mixed signals today — predictable routines and extra transition time may help.",
      confidence: 0.72,
      confidenceLabel: "Moderate confidence",
    };
  }
  if (!sleepOk) {
    return {
      explanation: "Poor sleep and elevated demand may make school transitions harder this morning.",
      confidence: 0.78,
      confidenceLabel: "Moderate confidence",
    };
  }
  if (!anxietyLow) {
    return {
      explanation: "Higher anxiety today — consider a softer morning and fewer surprises before school.",
      confidence: 0.76,
      confidenceLabel: "Moderate confidence",
    };
  }
  return {
    explanation: `${childName} may need extra support at drop-off today. Go slowly and celebrate small steps.`,
    confidence: 0.68,
    confidenceLabel: "Moderate confidence",
  };
}

export type IntelligenceItem = {
  title: string;
  explanation: string;
  why: string;
  confidence: number;
  accent: string;
  accentBg: string;
  iconPath: string;
};

export function buildIntelligenceItems(
  childName: string,
  checkin: DailyCheckin | null,
  weeklyTrendMessage: string | null,
  recommendation: string | null,
  patterns: PatternFinding[],
  weekCheckins: DailyCheckin[] = [],
): IntelligenceItem[] {
  const triggerPattern = patterns.find((p) =>
    ["sleep", "school", "sensory", "general"].includes(p.category),
  );

  const checkinsForPrediction = weekCheckins.length ? weekCheckins : checkin ? [checkin] : [];
  const topPrediction = generatePredictions(childName, checkinsForPrediction, patterns)[0];

  const items: IntelligenceItem[] = [
    {
      title: "Mood Trend",
      explanation: checkin
        ? `${childName}'s mood feels ${ratingWord(checkin.mood, "settled", "mixed", "fragile")} today.`
        : weeklyTrendMessage || "Check in daily to reveal mood patterns.",
      why: checkin
        ? `Based on today's mood rating of ${checkin.mood}/5 and recent check-in history.`
        : "Child Compass needs at least a few check-ins to spot reliable mood trends.",
      confidence: checkin ? 0.88 : 0.55,
      accent: "#14B8A6",
      accentBg: "rgba(20,184,166,0.12)",
      iconPath: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Sleep Impact",
      explanation: checkin
        ? ratingWord(
            checkin.sleep_quality,
            "Rest is supporting regulation today.",
            "Sleep was average — watch for afternoon fatigue.",
            "Poor sleep may amplify demands and sensory sensitivity.",
          )
        : "Sleep patterns emerge after a few consecutive check-ins.",
      why: checkin
        ? `Sleep quality rated ${checkin.sleep_quality}/5. Child Compass links poor sleep to harder school days.`
        : "We compare sleep ratings with mood and school tolerance across the week.",
      confidence: checkin ? 0.84 : 0.5,
      accent: "#6366F1",
      accentBg: "rgba(99,102,241,0.12)",
      iconPath: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    },
    {
      title: "School Prediction",
      explanation: checkin
        ? ratingWord(
            checkin.school_rating,
            "School transition looks manageable today.",
            "School may need a flexible, low-pressure approach.",
            "School refusal risk may be higher — reduce morning demands.",
          )
        : `Track school ratings to predict ${childName}'s transitions.`,
      why: checkin
        ? `School rating ${checkin.school_rating}/5 combined with sleep and anxiety signals.`
        : "Predictions improve when school, sleep, and mood are logged together.",
      confidence: checkin ? 0.8 : 0.52,
      accent: "#F59E0B",
      accentBg: "rgba(245,158,11,0.12)",
      iconPath: "M12 14l9-5-9-5-9 5 9 5z",
    },
    {
      title: "Possible Trigger",
      explanation: triggerPattern
        ? triggerPattern.title
        : checkin && (checkin.anxiety ?? 3) >= 4
          ? "Elevated anxiety — transitions or sensory load may be contributing."
          : "No major trigger patterns flagged from recent data.",
      why: triggerPattern
        ? triggerPattern.description
        : "Child Compass scans patterns across sleep, school, sensory, and mood categories.",
      confidence: triggerPattern?.confidence ?? (checkin ? 0.7 : 0.45),
      accent: "#EF4444",
      accentBg: "rgba(239,68,68,0.1)",
      iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
    {
      title: "Best Support Strategy",
      explanation:
        recommendation ||
        "Reduce demands, offer choice, and build in recovery time before transitions.",
      why: recommendation
        ? "Drawn from today's check-in, active patterns, and regulation signals."
        : "Default gentle-PDA approach until more data personalises guidance.",
      confidence: recommendation ? 0.9 : 0.65,
      accent: "#14B8A6",
      accentBg: "rgba(20,184,166,0.12)",
      iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
  ];

  if (topPrediction) {
    items.push({
      title: "Looking Ahead",
      explanation: topPrediction.message,
      why: `${topPrediction.why} ${topPrediction.confidenceExplanation}`,
      confidence: topPrediction.confidence,
      accent: "#8B5CF6",
      accentBg: "rgba(139,92,246,0.12)",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    });
  }

  return items;
}

export type WeeklyLearning = {
  text: string;
  positive: boolean;
};

export function buildWeeklyLearnings(
  childName: string,
  patterns: PatternFinding[],
  weeklyTrend: { trend: string; message: string } | null,
  weekCheckins: DailyCheckin[],
): WeeklyLearning[] {
  const items: WeeklyLearning[] = [];

  if (weeklyTrend?.trend === "improving") {
    items.push({ text: `${childName}'s regulation has been trending upward this week.`, positive: true });
  } else if (weeklyTrend?.trend === "declining") {
    items.push({ text: "This week has felt harder — extra gentleness is warranted.", positive: false });
  }

  for (const p of patterns.slice(0, 3)) {
    const positive = p.category === "sleep" || p.title.toLowerCase().includes("improv");
    items.push({ text: p.description, positive });
  }

  const sleepPatterns = patterns.filter((p) => p.category === "sleep");
  if (sleepPatterns.length > 0) {
    items.push({ text: "Sleep continues to influence regulation and school tolerance.", positive: true });
  }

  if (weekCheckins.length >= 3) {
    const avgWins = weekCheckins.reduce((n, c) => n + (c.wins?.length ?? 0), 0) / weekCheckins.length;
    if (avgWins >= 1) {
      items.push({ text: "Small wins are appearing more often in daily check-ins.", positive: true });
    }
  }

  if (items.length === 0) {
    items.push({
      text: `Keep checking in — Child Compass learns ${childName}'s unique rhythms over time.`,
      positive: true,
    });
  }

  return items.slice(0, 5);
}

export type ParentWin = {
  emoji: string;
  message: string;
};

export function buildParentWins(
  checkin: DailyCheckin | null,
  weekCheckins: DailyCheckin[],
  patterns: PatternFinding[],
  weeklyTrend: { trend: string; message: string } | null,
  childName: string,
): ParentWin[] {
  const celebrations = detectCelebrations(
    childName,
    checkin,
    weekCheckins,
    patterns,
    weeklyTrend,
  );
  return celebrations.map((c) => ({ emoji: c.emoji, message: c.message }));
}

export type EmotionalEvent = {
  id: string;
  emoji: string;
  label: string;
  summary: string;
  time: string;
  bg: string;
  border: string;
};

const EMOTIONAL_MAP: Record<string, { emoji: string; label: string; bg: string; border: string }> = {
  checkin: { emoji: "😊", label: "Great Morning", bg: "bg-emerald-50", border: "border-emerald-100" },
  victory: { emoji: "🌟", label: "Big Achievement", bg: "bg-violet-50", border: "border-violet-100" },
  meltdown: { emoji: "😟", label: "School Refusal", bg: "bg-rose-50", border: "border-rose-100" },
  school: { emoji: "📚", label: "Teacher Feedback", bg: "bg-amber-50", border: "border-amber-100" },
  debrief: { emoji: "❤️", label: "Family Reflection", bg: "bg-indigo-50", border: "border-indigo-100" },
  sleep: { emoji: "😴", label: "Rest & Recovery", bg: "bg-sky-50", border: "border-sky-100" },
  ai_insight: { emoji: "✨", label: "New Insight", bg: "bg-teal-50", border: "border-teal-100" },
};

export function mapEmotionalEvent(event: UnifiedTimelineItem): EmotionalEvent {
  const key = event.event_type || event.source;
  const meta = EMOTIONAL_MAP[key] ?? {
    emoji: "💛",
    label: "Family Moment",
    bg: "bg-slate-50",
    border: "border-slate-100",
  };
  return {
    id: event.id,
    emoji: meta.emoji,
    label: meta.label,
    summary: event.description || event.title,
    time: event.event_date,
    bg: meta.bg,
    border: meta.border,
  };
}

export function groupTimelineByDay(events: UnifiedTimelineItem[]): { day: string; events: EmotionalEvent[] }[] {
  const groups = new Map<string, EmotionalEvent[]>();

  for (const event of events) {
    const d = new Date(event.event_date);
    const day = d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const list = groups.get(day) ?? [];
    list.push(mapEmotionalEvent(event));
    groups.set(day, list);
  }

  return Array.from(groups.entries()).map(([day, dayEvents]) => ({
    day,
    events: dayEvents,
  }));
}

export const DAILY_ENCOURAGEMENTS = [
  "You don't need a perfect day. You only need one small win.",
  "Progress happens one moment at a time.",
  "The fact that you're here means you're already helping.",
  "Gentle consistency matters more than getting it right every time.",
  "Your child's pace is valid — trust the small steps.",
  "You are allowed to rest too. Caring for yourself helps your child.",
  "Not every hard moment means you're doing it wrong.",
  "Connection before correction — always.",
];

export function dailyEncouragement(): string {
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return DAILY_ENCOURAGEMENTS[dayIndex % DAILY_ENCOURAGEMENTS.length];
}
