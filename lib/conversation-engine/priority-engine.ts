import type { MessageIntent } from "@/lib/conversation-engine/understand-message";

export type ConversationPriority = "urgent" | "high" | "normal" | "low";

function contains(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

export function classifyPriority(message: string, intent: MessageIntent): ConversationPriority {
  const lower = message.toLowerCase();

  if (intent === "urgent_safety") return "urgent";

  if (
    contains(lower, [
      "self-harm",
      "self harm",
      "not eating",
      "not drinking",
      "won't eat",
      "won't drink",
      "medical emergency",
      "unsafe",
      "running away",
      "ran away",
      "exclusion",
      "expelled",
    ])
  ) {
    return "urgent";
  }

  if (
    contains(lower, [
      "hit",
      "hitting",
      "violent",
      "aggression",
      "aggressive",
      "hurt her",
      "hurt him",
      "hurt them",
      "sibling safety",
      "bit ",
      "biting",
      "school exclusion",
      "police",
    ])
  ) {
    return "high";
  }

  if (intent === "celebration" || intent === "information" || intent === "presence") {
    return "low";
  }

  if (intent === "emotional_support" && lower.length < 60) {
    return "low";
  }

  if (intent === "planning" || intent === "reflection") {
    return "normal";
  }

  return "normal";
}

export function priorityGuidance(priority: ConversationPriority): string {
  switch (priority) {
    case "urgent":
      return "Safety first. Be calm and direct. Encourage appropriate professional or emergency support. No lengthy coaching.";
    case "high":
      return "Take seriously. Acknowledge risk. Practical de-escalation before broader advice.";
    case "low":
      return "Match energy. Brief warmth. No unsolicited deep analysis.";
    default:
      return "Thoughtful companion tone. One continuous conversation.";
  }
}
