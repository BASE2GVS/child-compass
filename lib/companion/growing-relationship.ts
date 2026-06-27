import type { ChildContext } from "@/lib/types/database";

export function dataDepthScore(context: ChildContext): number {
  let score = 0;
  score += Math.min(context.recentCheckins.length, 7) * 2;
  score += context.patterns.length * 3;
  score += context.memoryReferences.length;
  score += (context.familyInsights?.length ?? 0) * 2;
  score += context.recentTimeline.length;
  score += context.recentDebriefs.length;
  return score;
}

export function buildRelationshipDepth(
  context: ChildContext,
  conversationHistory: { role: string; content: string }[],
): string | null {
  const depth = dataDepthScore(context);
  const turns = conversationHistory.filter((m) => m.role === "parent").length;
  const name = context.child.nickname || context.child.first_name;

  if (depth < 8 && turns < 4) return null;

  if (turns >= 6 && depth >= 10) {
    return `The more we talk, the more I understand what helps ${name} and what helps you — `;
  }

  if (depth >= 15) {
    return `Knowing your family a little better each time we talk, `;
  }

  if (context.patterns.length >= 2 && depth >= 10) {
    return `I'm starting to recognise your family's rhythms — `;
  }

  return null;
}
