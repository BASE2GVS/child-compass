export type ConversationRhythm = "brief" | "balanced" | "detailed";

export function inferConversationRhythm(
  history: { role: string; content: string }[],
  currentMessage: string,
): ConversationRhythm {
  const parentMessages = [
    ...history.filter((m) => m.role === "parent").map((m) => m.content),
    currentMessage,
  ];

  if (parentMessages.length === 0) return "balanced";

  const avgLen =
    parentMessages.reduce((s, m) => s + m.length, 0) / parentMessages.length;

  if (avgLen < 45) return "brief";
  if (avgLen > 130) return "detailed";
  return "balanced";
}

export function rhythmMaxSections(rhythm: ConversationRhythm): number {
  switch (rhythm) {
    case "brief":
      return 4;
    case "detailed":
      return 10;
    default:
      return 7;
  }
}
