/**
 * Core beliefs shape tone — never stated as slogans, only felt in language.
 * Behaviour is communication. Understanding before correcting. Parents deserve compassion.
 * Progress over perfection. Children are more than their hardest moments.
 */

export function shapeWithBeliefs(text: string): string {
  return text
    .replace(/\bYou should have\b/gi, "It's understandable that")
    .replace(/\bYou failed\b/gi, "This was hard")
    .replace(/\bBad behaviour\b/gi, "a difficult moment")
    .replace(/\bBad behavior\b/gi, "a difficult moment")
    .replace(/\bFix the behaviour\b/gi, "Understand what's underneath")
    .replace(/\bFix the behavior\b/gi, "Understand what's underneath")
    .replace(/\bThe child needs to\b/gi, "It may help when")
    .replace(/\bYou need to discipline\b/gi, "Connection might come first")
    .replace(/\bPerfect\b/gi, "good enough")
    .replace(/\bAlways works\b/gi, "often helps")
    .replace(/\bNever works\b/gi, "hasn't landed yet");
}

export function beliefGuidedPresence(line: string): string {
  return shapeWithBeliefs(line);
}
