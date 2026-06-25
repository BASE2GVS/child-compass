export type ConfidenceBand = "high" | "medium" | "low";

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 0.8) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}

export function confidenceLabel(band: ConfidenceBand): string {
  if (band === "high") return "High confidence";
  if (band === "medium") return "Medium confidence";
  return "Low confidence";
}

export function explainConfidence(score: number, factors: string[]): string {
  const band = confidenceBand(score);
  const factorText =
    factors.length > 0
      ? factors.join(". ")
      : "Child Compass is still learning from your family's check-ins.";
  return `${confidenceLabel(band)} — ${factorText}`;
}

export function confidenceFromDataDepth(input: {
  checkinCount: number;
  patternCount: number;
  hasTodayCheckin: boolean;
  memoryCount: number;
}): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0.45;

  if (input.hasTodayCheckin) {
    score += 0.15;
    factors.push("today's check-in adds fresh context");
  }
  if (input.checkinCount >= 7) {
    score += 0.2;
    factors.push(`${input.checkinCount} recent check-ins strengthen the picture`);
  } else if (input.checkinCount >= 3) {
    score += 0.1;
    factors.push("a few check-ins are beginning to reveal patterns");
  } else {
    factors.push("more daily check-ins will sharpen guidance");
  }
  if (input.patternCount > 0) {
    score += 0.1;
    factors.push(`${input.patternCount} pattern${input.patternCount === 1 ? "" : "s"} observed in your history`);
  }
  if (input.memoryCount > 0) {
    score += 0.05;
    factors.push("previous wins and strategies inform this suggestion");
  }

  return { score: Math.min(0.95, score), factors };
}
