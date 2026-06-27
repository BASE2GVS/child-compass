import type { ChildContext } from "@/lib/types/database";

const JUDGMENT_SIGNALS = [
  "being naughty",
  "was naughty",
  "just naughty",
  "being difficult",
  "being defiant",
  "manipulative",
  "attention seeking",
  "attention-seeking",
  "on purpose",
  "chose to",
  "won't listen",
  "disobedient",
  "bad behaviour",
  "bad behavior",
];

export function detectsJudgment(message: string): boolean {
  const lower = message.toLowerCase();
  return JUDGMENT_SIGNALS.some((s) => lower.includes(s));
}

export function buildGentleChallenge(
  message: string,
  context: ChildContext,
): string | null {
  if (!detectsJudgment(message)) return null;

  const name = context.child.nickname || context.child.first_name;
  return `I wonder if there could be another explanation for ${name}'s behaviour — not because you're wrong to feel frustrated, but because what looks like defiance is often a nervous system saying "I can't right now."`;
}
