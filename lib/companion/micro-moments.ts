import type { ChildContext } from "@/lib/types/database";

const MOMENTS = [
  "I'm glad we talked today.",
  "Thank you for sharing that with me.",
  "I'll hold onto what we've learned together.",
  "This matters — thank you for trusting me with it.",
  "I'm here whenever you need to pick this up again.",
];

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

export function buildMicroMoment(
  parentMessage: string,
  context: ChildContext,
  conversationTurns: number,
): string | null {
  if (parentMessage.length < 15 && conversationTurns < 2) return null;

  const seed = parentMessage + String(conversationTurns) + context.child.id;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  if (h % 4 !== 0) return null;

  return pick(MOMENTS, seed);
}
