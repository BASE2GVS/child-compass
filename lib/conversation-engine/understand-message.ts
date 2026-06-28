import type { ParentMood } from "@/lib/companion/parent-checkin";
import { detectCoachMode } from "@/lib/ai/coach-mode";
import { classifyParentNeed, type ParentNeed } from "@/lib/conversation/parent-need";
import { needsProfessionalHelp } from "@/lib/conversation/safety";

export type MessageIntent =
  | "emotional_support"
  | "problem_solving"
  | "planning"
  | "celebration"
  | "reflection"
  | "urgent_safety"
  | "information"
  | "presence";

export type ConversationEngineInput = {
  message: string;
  conversationHistory: { role: string; content: string }[];
  parentMood?: ParentMood | null;
  preferReflection?: boolean;
};

function contains(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

export function understandMessage(input: ConversationEngineInput): MessageIntent {
  const { message, conversationHistory, parentMood, preferReflection } = input;
  const lower = message.toLowerCase();
  const mode = detectCoachMode(message, { preferReflection, parentMood });

  if (
    needsProfessionalHelp(message) ||
    mode === "emergency" ||
    contains(lower, [
      "self-harm",
      "self harm",
      "not eating",
      "not drinking",
      "won't eat",
      "won't drink",
      "medical emergency",
      "suicidal",
    ])
  ) {
    return "urgent_safety";
  }

  if (mode === "product_help" || mode === "navigation") return "information";
  if (mode === "behaviour_reflection" || preferReflection) return "reflection";

  const need = classifyParentNeed(message, { parentMood, conversationHistory });

  switch (need) {
    case "presence_only":
    case "being_heard":
      return "presence";
    case "emotional_support":
      return "emotional_support";
    case "celebration":
      return "celebration";
    case "preparation":
      return "planning";
    case "new_ideas":
    case "problem_solving":
    default:
      if (contains(lower, ["what is", "how do i use", "where is", "take me to"])) {
        return "information";
      }
      return "problem_solving";
  }
}

export function parentNeedToIntent(need: ParentNeed): MessageIntent {
  switch (need) {
    case "presence_only":
    case "being_heard":
      return "presence";
    case "emotional_support":
      return "emotional_support";
    case "celebration":
      return "celebration";
    case "preparation":
      return "planning";
    default:
      return "problem_solving";
  }
}
