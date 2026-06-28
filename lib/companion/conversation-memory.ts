export function adviceAlreadyGiven(priorAssistantText: string, newAdvice: string): boolean {
  if (!priorAssistantText || !newAdvice) return false;
  const prior = priorAssistantText.toLowerCase();
  const words = newAdvice
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 5);
  const matches = words.filter((w) => prior.includes(w));
  return matches.length >= 4;
}

export function buildConversationContinuity(
  history: { role: string; content: string }[],
  currentMessage: string,
): string | null {
  if (history.length < 2) return null;

  const parentTurns = history.filter((m) => m.role === "parent");
  if (parentTurns.length === 0) return null;

  const lastParent = parentTurns[parentTurns.length - 1];
  const snippet = lastParent.content.slice(0, 70);
  const currentLower = currentMessage.toLowerCase();

  if (
    currentLower.includes("yes") ||
    currentLower.includes("that") ||
    currentLower.includes("still") ||
    currentLower.includes("again") ||
    currentLower.includes("follow")
  ) {
    return `Building on what you said about "${snippet}${lastParent.content.length > 70 ? "…" : ""}" — `;
  }

  if (parentTurns.length >= 2) {
    return "Continuing from our earlier messages in this conversation — ";
  }

  return null;
}

export function extractPriorAdviceTopics(
  history: { role: string; content: string }[],
): string[] {
  return history
    .filter((m) => m.role === "assistant")
    .flatMap((m) => {
      const templateMatch = m.content.match(/Something you could try\n"([^"]+)"/);
      if (templateMatch) return [templateMatch[1]];

      const thoughtMatch = m.content.match(/One thought — (.+?)(?:\n|$)/i);
      if (thoughtMatch) return [thoughtMatch[1].replace(/\.$/, "")];

      const quotedMatch = m.content.match(/"([^"]{15,})"/);
      if (quotedMatch) return [quotedMatch[1]];

      const tryMatch = m.content.match(
        /(?:you might try|try saying|what if you|consider)\s+([^.!?]{10,}[.!?])/i,
      );
      if (tryMatch) return [tryMatch[1]];

      return [];
    });
}
