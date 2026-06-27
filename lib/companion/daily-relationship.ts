import type { CoachMode } from "@/lib/ai/coach-mode";

export type RelationshipContext = {
  childName: string;
  weekCheckinCount: number;
  patternsCount: number;
  weeklyTrend: "improving" | "stable" | "declining" | null;
  coachConversationsThisWeek: number;
};

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

export function buildRelationshipNote(ctx: RelationshipContext, dayIndex: number): string | null {
  if (ctx.weekCheckinCount === 0) return null;

  if (ctx.weekCheckinCount >= 3 && ctx.patternsCount > 0) {
    return pick(
      [
        `We're getting to know ${ctx.childName} better together.`,
        `I've started noticing some encouraging patterns for ${ctx.childName}.`,
        `Your check-ins are quietly building a clearer picture of ${ctx.childName}.`,
      ],
      dayIndex,
    );
  }

  if (ctx.weekCheckinCount >= 2) {
    return pick(
      [
        `You've shared ${ctx.weekCheckinCount} check-ins this week — that's helping me understand ${ctx.childName}.`,
        `${ctx.weekCheckinCount} check-ins this week. Each one makes guidance more personal.`,
        `Thank you for showing up for ${ctx.childName} ${ctx.weekCheckinCount} times this week.`,
      ],
      dayIndex,
    );
  }

  if (ctx.coachConversationsThisWeek >= 2) {
    return pick(
      [
        "We've talked a few times this week — I'm remembering what matters to your family.",
        "Our conversations this week are helping me support you more personally.",
      ],
      dayIndex,
    );
  }

  if (ctx.weeklyTrend === "improving") {
    return `Something gentle is shifting in a good direction for ${ctx.childName} this week.`;
  }

  return null;
}

export function buildConversationOpener(mode: CoachMode, childName: string): string | null {
  switch (mode) {
    case "parent_support":
      return "Before we talk about strategies — how are you holding up?";
    case "behaviour_reflection":
      return `Take your time. Tell me what happened with ${childName}, in your own words.`;
    case "emergency":
      return "I'm here. Tell me what's happening right now.";
    default:
      return null;
  }
}
