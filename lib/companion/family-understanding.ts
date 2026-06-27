import type { ChildContext } from "@/lib/types/database";
import { buildFamilyInsights, insightForMessage } from "@/lib/companion/family-insights";

const UNDERSTANDING_OPENERS = [
  "One thing I've been learning about",
  "I've started noticing that",
  "I'm beginning to understand that",
  "This seems important for",
];

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

function formatInsight(name: string, text: string, seed: string): string {
  const opener = pick(UNDERSTANDING_OPENERS, seed);
  const body = text.charAt(0).toLowerCase() + text.slice(1);
  if (opener.endsWith("for")) {
    return `${opener} ${name} — ${body}.`;
  }
  return `${opener} ${name} — ${body}.`;
}

function messageRelatesToMemory(message: string, memoryText: string): boolean {
  const msg = message.toLowerCase();
  const words = memoryText
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  return words.some((w) => msg.includes(w));
}

export function weaveFamilyUnderstanding(
  context: ChildContext,
  parentMessage: string,
): string | null {
  const name = context.child.nickname || context.child.first_name;
  const insights = buildFamilyInsights(context);

  const matched = insightForMessage(insights, parentMessage);
  if (matched) {
    return formatInsight(name, matched.text, parentMessage);
  }

  const msg = parentMessage.toLowerCase();
  const schoolish = ["school", "morning", "homework", "refused"].some((k) => msg.includes(k));
  const sensoryish = ["loud", "shop", "crowd", "overwhelm", "sensory"].some((k) => msg.includes(k));
  const sleepish = ["sleep", "tired", "bed", "night"].some((k) => msg.includes(k));
  const changeish = ["change", "unexpected", "transition", "party", "visit"].some((k) =>
    msg.includes(k),
  );

  for (const ref of context.memoryReferences) {
    if (messageRelatesToMemory(parentMessage, ref)) {
      return formatInsight(name, ref, ref);
    }
  }

  const topical = insights.find((insight) => {
    const lower = insight.text.toLowerCase();
    if (schoolish && (lower.includes("morning") || lower.includes("school"))) return true;
    if (sensoryish && lower.includes("sensory")) return true;
    if (sleepish && lower.includes("sleep")) return true;
    if (changeish && (lower.includes("change") || lower.includes("unexpected"))) return true;
    return false;
  });

  if (topical) {
    return formatInsight(name, topical.text, topical.id);
  }

  return null;
}

/** @deprecated use weaveFamilyUnderstanding */
export function weaveNaturalMemory(context: ChildContext, parentMessage: string): string | null {
  return weaveFamilyUnderstanding(context, parentMessage);
}
