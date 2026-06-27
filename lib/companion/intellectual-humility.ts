import type { ChildContext } from "@/lib/types/database";

export function buildHumilityNote(context: ChildContext): string | null {
  const checkins = context.recentCheckins.length;
  const patterns = context.patterns.length;

  if (checkins === 0) {
    return "I'm not sure yet — I don't have much to go on today.";
  }

  if (checkins < 3 && patterns === 0) {
    return "I'm not sure yet — we're still early in learning your family's rhythms.";
  }

  if (patterns === 1 && checkins < 7) {
    return "We've only seen this a couple of times — I'd like to understand it better before calling it a pattern.";
  }

  if (checkins < 5 && patterns < 2) {
    return "I'm still forming a picture — please hold this lightly until we know more.";
  }

  return null;
}

export function capConfidenceForEvidence(
  confidence: number,
  context: ChildContext,
): number {
  const checkins = context.recentCheckins.length;
  const patterns = context.patterns.length;

  let cap = 0.92;
  if (checkins < 3) cap = 0.62;
  else if (checkins < 7) cap = 0.78;
  if (patterns === 0) cap = Math.min(cap, 0.7);
  if (patterns === 1) cap = Math.min(cap, 0.82);

  return Math.min(confidence, cap);
}

export function humilityPhraseForConfidence(score: number): string | null {
  if (score >= 0.75) return null;
  if (score >= 0.55) return "I could be wrong — ";
  return "I'm not certain yet, but ";
}
