import type { CoachMessage, DailyCheckin } from "@/lib/types/database";
import { buildPatientReturnWelcome } from "@/lib/companion/patient-companionship";

export type WelcomeContext = {
  parentName: string;
  childName: string;
  hour: number;
  dateKey: string;
  hasCheckinToday: boolean;
  weekCheckinCount: number;
  daysSinceLastCoachMessage: number | null;
  yesterdayWasDifficult: boolean;
  recentDifficultDays: number;
  coachMessagesThisWeek: number;
  patternsCount: number;
  weeklyTrend: "improving" | "stable" | "declining" | null;
  isFirstVisitToday: boolean;
};

function pickVariant<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

function timeGreeting(hour: number, name: string): string[] {
  if (hour < 12) {
    return [
      `Good morning, ${name}.`,
      `Morning, ${name} — I'm glad you're here.`,
      `Good morning, ${name}. Take a breath — we'll take today one step at a time.`,
    ];
  }
  if (hour < 17) {
    return [
      `Good afternoon, ${name}.`,
      `Hi ${name} — welcome back.`,
      `Good afternoon, ${name}. How is the day unfolding?`,
    ];
  }
  return [
    `Good evening, ${name}.`,
    `Evening, ${name} — you've made it through another day.`,
    `Good evening, ${name}. However today felt, you're here now.`,
  ];
}

export function buildDailyWelcome(ctx: WelcomeContext): { headline: string; subline: string } {
  const seed = `${ctx.dateKey}-${ctx.parentName}-${ctx.weekCheckinCount}-${ctx.coachMessagesThisWeek}`;

  if (ctx.daysSinceLastCoachMessage !== null && ctx.daysSinceLastCoachMessage >= 3) {
    return buildPatientReturnWelcome(
      ctx.parentName,
      ctx.childName,
      ctx.daysSinceLastCoachMessage,
    );
  }

  if (ctx.yesterdayWasDifficult) {
    return {
      headline: pickVariant(
        [
          `${ctx.parentName}, I've been thinking about yesterday.`,
          `Good ${ctx.hour < 12 ? "morning" : ctx.hour < 17 ? "afternoon" : "evening"}, ${ctx.parentName} — yesterday sounded hard.`,
          `${ctx.parentName}, I'm here. Yesterday took a lot.`,
        ],
        seed + "hard",
      ),
      subline: pickVariant(
        [
          `There's no need to have it all figured out yet. We can start gently with ${ctx.childName}.`,
          `Some days leave a mark. Let's see what today needs — together.`,
          `You showed up again. That matters more than a perfect morning.`,
        ],
        seed + "hard-sub",
      ),
    };
  }

  if (ctx.coachMessagesThisWeek >= 2 && !ctx.hasCheckinToday) {
    return {
      headline: pickVariant(timeGreeting(ctx.hour, ctx.parentName), seed + "time"),
      subline: pickVariant(
        [
          `We've talked a few times this week — would it help to tell me how today went for ${ctx.childName}?`,
          `I remember our recent conversations. When you're ready, a quick check-in helps me walk alongside you.`,
        ],
        seed + "coach-no-checkin",
      ),
    };
  }

  if (ctx.weeklyTrend === "improving" && ctx.weekCheckinCount >= 3) {
    return {
      headline: pickVariant(timeGreeting(ctx.hour, ctx.parentName), seed + "improving"),
      subline: pickVariant(
        [
          `I've started noticing some encouraging patterns for ${ctx.childName} this week.`,
          `${ctx.childName}'s week has some gentle bright spots — I'll share what I'm seeing below.`,
          `Something is shifting in a good direction. Let's build on it calmly.`,
        ],
        seed + "improving-sub",
      ),
    };
  }

  if (ctx.weekCheckinCount >= 3 && ctx.patternsCount > 0) {
    return {
      headline: pickVariant(timeGreeting(ctx.hour, ctx.parentName), seed + "patterns"),
      subline: pickVariant(
        [
          `We're getting to know ${ctx.childName} better together — your check-ins this week are helping.`,
          `Each check-in adds clarity about ${ctx.childName}. I'm starting to see the shape of your family's story.`,
          `Your steady presence is quietly building a clearer picture of ${ctx.childName}.`,
        ],
        seed + "patterns-sub",
      ),
    };
  }

  if (!ctx.hasCheckinToday && ctx.hour < 12) {
    return {
      headline: pickVariant(timeGreeting(ctx.hour, ctx.parentName), seed + "morning"),
      subline: pickVariant(
        [
          `When you're ready, a short check-in opens today's picture of ${ctx.childName}.`,
          `No rush — start with how you're doing, or jump straight to ${ctx.childName}'s check-in.`,
          `Let's take today gently. A check-in takes about two minutes.`,
        ],
        seed + "morning-sub",
      ),
    };
  }

  return {
    headline: pickVariant(
      [
        ...timeGreeting(ctx.hour, ctx.parentName),
        `Welcome back, ${ctx.parentName}.`,
        `${ctx.parentName}, good to see you.`,
      ],
      seed + "default",
    ),
    subline: pickVariant(
      [
        `Here's a calm snapshot for ${ctx.childName} today.`,
        `Let's see what today is asking of you and ${ctx.childName}.`,
        `I'm here — for you and for ${ctx.childName}.`,
      ],
      seed + "default-sub",
    ),
  };
}

export function buildWelcomeContext(input: {
  parentName: string;
  childName: string;
  checkin: DailyCheckin | null;
  yesterdayCheckin: DailyCheckin | null;
  weekCheckins: DailyCheckin[];
  coachMessages: CoachMessage[];
  patternsCount: number;
  weeklyTrend: "improving" | "stable" | "declining" | null;
}): WelcomeContext {
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();

  const yesterdayWasDifficult = Boolean(
    input.yesterdayCheckin &&
      ((input.yesterdayCheckin.mood ?? 3) <= 2 ||
        (input.yesterdayCheckin.anxiety ?? 3) >= 4 ||
        (input.yesterdayCheckin.challenges?.length ?? 0) > 0),
  );

  const recentDifficultDays = input.weekCheckins.filter(
    (c) => (c.mood ?? 3) <= 2 || (c.anxiety ?? 3) >= 4,
  ).length;

  const lastCoach = input.coachMessages[input.coachMessages.length - 1];
  let daysSinceLastCoachMessage: number | null = null;
  if (lastCoach?.created_at) {
    const diff = Date.now() - new Date(lastCoach.created_at).getTime();
    daysSinceLastCoachMessage = Math.floor(diff / 86400000);
  }

  const weekAgo = Date.now() - 7 * 86400000;
  const coachMessagesThisWeek = input.coachMessages.filter(
    (m) => new Date(m.created_at).getTime() >= weekAgo,
  ).length;

  return {
    parentName: input.parentName,
    childName: input.childName,
    hour,
    dateKey: today,
    hasCheckinToday: input.checkin?.checkin_date === today,
    weekCheckinCount: input.weekCheckins.length,
    daysSinceLastCoachMessage,
    yesterdayWasDifficult,
    recentDifficultDays,
    coachMessagesThisWeek,
    patternsCount: input.patternsCount,
    weeklyTrend: input.weeklyTrend,
    isFirstVisitToday: true,
  };
}

export function isCheckinDifficult(c: DailyCheckin): boolean {
  return (c.mood ?? 3) <= 2 || (c.anxiety ?? 3) >= 4 || (c.challenges?.length ?? 0) > 0;
}
