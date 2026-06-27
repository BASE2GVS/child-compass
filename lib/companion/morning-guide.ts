import type { DailyCheckin, PatternFinding, CoachMessage } from "@/lib/types/database";
import { buildDailyWelcome, buildWelcomeContext } from "@/lib/companion/daily-welcome";
import { buildRelationshipNote } from "@/lib/companion/daily-relationship";

export type MorningGuide = {
  greeting: string;
  subline: string;
  noticing: string | null;
  gentleRecommendation: string | null;
  nextStepHint: string | null;
};

function ratingWord(
  value: number | null | undefined,
  positive: string,
  neutral: string,
  negative: string,
): string {
  const v = value ?? 3;
  if (v >= 4) return positive;
  if (v <= 2) return negative;
  return neutral;
}

function buildNoticing(
  childName: string,
  checkin: DailyCheckin | null,
  yesterdayCheckin: DailyCheckin | null,
  patterns: PatternFinding[],
  headlineInsight: string | null,
): string | null {
  if (headlineInsight) return headlineInsight;

  const pattern = patterns[0];
  if (pattern) {
    return `I've started noticing that ${pattern.description.charAt(0).toLowerCase()}${pattern.description.slice(1)}`;
  }

  if (!checkin) {
    if (yesterdayCheckin && (yesterdayCheckin.mood ?? 3) <= 2) {
      return `Yesterday felt heavy for ${childName} — we'll take today gently.`;
    }
    return null;
  }

  const sleep = checkin.sleep_quality ?? 3;
  const mood = checkin.mood ?? 3;
  if (sleep <= 2) {
    return `${childName} may need extra patience this morning — sleep was disrupted.`;
  }
  if (mood >= 4) {
    return `${childName} seems a little steadier this morning.`;
  }
  if (mood <= 2) {
    return `Emotions may feel closer to the surface for ${childName} today.`;
  }

  return ratingWord(
    checkin.school_rating,
    `${childName}'s morning looks manageable so far.`,
    `A predictable, low-demand morning may help ${childName}.`,
    `School may ask a lot of ${childName} today — go slowly.`,
  );
}

export function buildMorningGuide(input: {
  parentName: string;
  childName: string;
  checkin: DailyCheckin | null;
  yesterdayCheckin: DailyCheckin | null;
  weekCheckins: DailyCheckin[];
  coachMessages: CoachMessage[];
  patterns: PatternFinding[];
  recommendation: string | null;
  headlineInsight: string | null;
  weeklyTrend: "improving" | "stable" | "declining" | null;
}): MorningGuide {
  const welcomeCtx = buildWelcomeContext({
    parentName: input.parentName,
    childName: input.childName,
    checkin: input.checkin,
    yesterdayCheckin: input.yesterdayCheckin,
    weekCheckins: input.weekCheckins,
    coachMessages: input.coachMessages,
    patternsCount: input.patterns.length,
    weeklyTrend: input.weeklyTrend,
  });
  const welcome = buildDailyWelcome(welcomeCtx);

  const relationshipNote = buildRelationshipNote(
    {
      childName: input.childName,
      weekCheckinCount: input.weekCheckins.length,
      patternsCount: input.patterns.length,
      weeklyTrend: input.weeklyTrend,
      coachConversationsThisWeek: welcomeCtx.coachMessagesThisWeek,
    },
    new Date().getDate(),
  );

  const noticing = buildNoticing(
    input.childName,
    input.checkin,
    input.yesterdayCheckin,
    input.patterns,
    input.headlineInsight,
  );

  const gentleRecommendation =
    input.recommendation ||
    (input.checkin
      ? "Offer choices rather than instructions when you can — it often lowers demand."
      : "When you're ready, a two-minute check-in opens today's picture.");

  let nextStepHint: string | null = null;
  if (!input.checkin) {
    nextStepHint = "When you're ready, a quick check-in opens today's picture.";
  } else if (welcomeCtx.coachMessagesThisWeek === 0) {
    nextStepHint = "If something's on your mind, I'm here to talk it through.";
  } else {
    nextStepHint = relationshipNote;
  }

  return {
    greeting: welcome.headline,
    subline: welcome.subline,
    noticing,
    gentleRecommendation,
    nextStepHint,
  };
}
