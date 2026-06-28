export const COMPANION_OPENINGS = [
  "I can see why today feels heavy.",
  "I smiled reading that.",
  "I've been thinking about what you shared.",
  "That must have been difficult to watch.",
  "You're carrying a lot at the moment.",
  "I imagine that left you feeling torn.",
  "I'm really glad you told me.",
  "That can't have been easy.",
  "What you're describing feels important.",
  "This sounds like one of those moments where nothing feels straightforward.",
  "I hear how much this is costing you.",
  "No wonder you're worn down.",
  "That would shake any parent.",
  "I can feel the weight in what you've written.",
  "Thank you for trusting me with this.",
  "You've been holding a lot.",
  "That moment sounds painfully long.",
  "I imagine your heart was in your throat.",
  "What a hard thing to navigate.",
  "I'm sitting with you in this.",
  "That takes so much out of you.",
  "I can see why you'd feel stuck.",
  "That's a lot for one day.",
  "You shouldn't have to figure this out alone.",
  "I imagine that felt endless.",
  "What you're carrying matters.",
  "That would leave anyone rattled.",
  "I'm glad you're not keeping this to yourself.",
  "That sounds like it landed hard.",
  "I can see why this feels urgent.",
  "You've been trying so hard.",
  "That would test anyone's patience.",
  "I imagine you felt quite alone in it.",
  "What you're describing would unsettle me too.",
  "That's a tender spot for any family.",
  "I hear the exhaustion in this.",
  "That would knock the wind out of you.",
  "I'm with you — this is a lot.",
  "What happened sounds deeply wearing.",
  "I can see why you'd want answers.",
  "That moment would stay with you.",
  "You're doing more than you think.",
  "I imagine tonight feels long.",
  "What you're facing isn't small.",
  "That would fray anyone's nerves.",
  "I'm glad you reached out.",
] as const;

export type OpeningMood = "celebration" | "heavy" | "neutral" | "warm";

const CELEBRATION_OPENINGS = [
  "I smiled reading that.",
  "That's wonderful to hear.",
  "What a lovely thing to share.",
  "I'm really glad you told me.",
];

const HEAVY_OPENINGS = COMPANION_OPENINGS.filter(
  (o) => !o.includes("smiled") && !o.includes("wonderful"),
);

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function pickCompanionOpening(
  seed: string,
  priorAssistantTexts: string[],
  mood: OpeningMood = "neutral",
): string {
  const used = new Set(
    priorAssistantTexts
      .map((t) => t.split(/\n\n+/)[0]?.trim().slice(0, 35).toLowerCase())
      .filter(Boolean),
  );

  const pool =
    mood === "celebration"
      ? CELEBRATION_OPENINGS
      : mood === "heavy"
        ? HEAVY_OPENINGS
        : [...COMPANION_OPENINGS];

  const available = pool.filter((o) => !used.has(o.slice(0, 35).toLowerCase()));
  const choices = available.length > 0 ? available : pool;
  return choices[hashSeed(seed) % choices.length];
}

export function isGenericOpening(paragraph: string): boolean {
  const p = paragraph.trim();
  if (!/^(That sounds|This sounds|It sounds)/i.test(p)) return false;
  // Keep emotionally specific acknowledgments — warmth beats variety here.
  if (
    /exhausting|heartbreaking|frustrating|confusing|worrying|lonely|drained|incredibly long|both children|look after|effort|already put|terrible parent|guilt|on your own|falling apart|overwhelm|disaster|meltdown|difficult|really hard|hard, especially/i.test(
      p,
    )
  ) {
    return false;
  }
  return true;
}

export function isCelebrationOpening(paragraph: string): boolean {
  return /^(I smiled|That's wonderful|Days like this|These moments)/i.test(paragraph.trim());
}
