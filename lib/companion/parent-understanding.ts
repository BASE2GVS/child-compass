import type { ParentMood } from "@/lib/companion/parent-checkin";
import type { ConversationRhythm } from "@/lib/companion/conversation-rhythm";

const PLANNING_SIGNALS = ["prepare", "plan", "tomorrow", "weekend", "schedule", "what should we"];
const REFLECTION_SIGNALS = ["why did", "make sense", "understand why", "happened", "meltdown", "explain"];
const SELF_BLAME_SIGNALS = [
  "my fault",
  "i failed",
  "i'm failing",
  "bad parent",
  "should have",
  "shouldn't have",
  "i messed up",
  "blame myself",
];
const WORRY_SIGNALS = ["worried", "anxious about school", "before school", "morning dread", "what if"];

export function inferParentUnderstanding(
  conversationHistory: { role: string; content: string }[],
  parentMood?: ParentMood | null,
  rhythm?: ConversationRhythm,
): string | null {
  const parentMessages = conversationHistory
    .filter((m) => m.role === "parent")
    .map((m) => m.content.toLowerCase());

  const combined = parentMessages.join(" ");
  if (!combined.length && !parentMood) return null;

  if (parentMood === "need_to_talk" || parentMood === "exhausted") {
    return "You often carry a lot quietly — I'm glad you're letting some of it out here.";
  }

  if (parentMood === "worried" || WORRY_SIGNALS.some((s) => combined.includes(s))) {
    return "You often worry before the hard parts of the day — that care comes from love, not weakness.";
  }

  if (SELF_BLAME_SIGNALS.some((s) => combined.includes(s))) {
    return "You tend to turn inward after difficult days — please know that hard moments don't mean you're failing.";
  }

  const planningCount = parentMessages.filter((m) =>
    PLANNING_SIGNALS.some((s) => m.includes(s)),
  ).length;
  const reflectionCount = parentMessages.filter((m) =>
    REFLECTION_SIGNALS.some((s) => m.includes(s)),
  ).length;

  if (planningCount >= 2 && planningCount > reflectionCount) {
    return "You often ask for practical planning — I'll keep things concrete when that helps.";
  }

  if (reflectionCount >= 2 && reflectionCount > planningCount) {
    return "You often like to talk things through before acting — we can take our time with that.";
  }

  if (rhythm === "brief" || (parentMessages.length >= 3 && avgLen(parentMessages) < 50)) {
    return "You usually prefer shorter answers — I'll keep things focused unless you want more detail.";
  }

  if (rhythm === "detailed") {
    return "You tend to appreciate a fuller picture — I'll explain my thinking when it might help.";
  }

  const recentWins = parentMessages.filter((m) =>
    /stayed calmer|handled|better today|proud|win|recovered faster/i.test(m),
  );
  if (recentWins.length >= 1) {
    return "You've become more confident in how you respond — that growth is real, even on messy days.";
  }

  return null;
}

function avgLen(messages: string[]): number {
  if (!messages.length) return 0;
  return messages.reduce((s, m) => s + m.length, 0) / messages.length;
}
