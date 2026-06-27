const SCRIPTED_PHRASES = [
  "that sounds incredibly hard",
  "i'm really glad you told me",
  "i'm here",
  "we don't need to solve everything",
  "one thing i've been learning",
  "i've started noticing",
  "the pattern i'm noticing",
  "knowing your family a little better",
];

function countPhraseInHistory(phrase: string, history: { role: string; content: string }[]): number {
  const needle = phrase.toLowerCase();
  return history
    .filter((m) => m.role === "assistant")
    .reduce((n, m) => n + (m.content.toLowerCase().split(needle).length - 1), 0);
}

const ALTERNATIVES: Record<string, string[]> = {
  "that sounds incredibly hard": [
    "That's a lot to carry.",
    "I hear how heavy this feels.",
    "No wonder you're drained.",
  ],
  "i'm really glad you told me": [
    "Thank you for sharing this with me.",
    "It matters that you said this out loud.",
    "I'm listening — truly.",
  ],
  "i'm here": [
    "I'm with you in this.",
    "You don't have to hold this alone.",
    "Take your time — I'm not going anywhere.",
  ],
};

export function diversifyPhrases(
  text: string,
  conversationHistory: { role: string; content: string }[],
): string {
  let result = text;

  for (const phrase of SCRIPTED_PHRASES) {
    const count = countPhraseInHistory(phrase, conversationHistory);
    if (count < 2) continue;

    const alts = ALTERNATIVES[phrase];
    if (!alts) continue;

    const regex = new RegExp(phrase, "gi");
    if (regex.test(result)) {
      const pick = alts[count % alts.length];
      result = result.replace(regex, pick);
    }
  }

  return result;
}

export function trimEnrichmentStack(
  parts: (string | null)[],
  maxParts: number,
): string {
  return parts.filter(Boolean).slice(0, maxParts).join(" ");
}
