import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { CoachMode } from "@/lib/ai/coach-mode";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import { beliefGuidedPresence } from "@/lib/companion/family-beliefs";

const PRESENCE_SIGNALS = [
  "just need to talk",
  "just needed to share",
  "needed to tell someone",
  "so heavy",
  "incredibly heavy",
  "can't stop crying",
  "falling apart",
  "nobody understands",
  "had to get this out",
  "not looking for advice",
  "don't need advice",
  "just venting",
];

const HEAVY_WITHOUT_QUESTION = [
  "that was awful",
  "worst day",
  "brutal day",
  "i'm broken",
  "completely drained",
  "at my limit",
];

export function needsPresenceFirst(
  message: string,
  conversationHistory: { role: string; content: string }[],
  parentMood?: ParentMood | null,
  mode?: CoachMode,
): boolean {
  if (mode === "emergency" || mode === "product_help" || mode === "navigation") return false;

  const lower = message.toLowerCase().trim();

  if (parentMood === "need_to_talk" || parentMood === "exhausted") {
    if (!asksForAdvice(lower)) return true;
  }

  if (PRESENCE_SIGNALS.some((s) => lower.includes(s))) return true;

  if (
    !lower.includes("?") &&
    HEAVY_WITHOUT_QUESTION.some((s) => lower.includes(s)) &&
    lower.length < 120
  ) {
    return true;
  }

  const parentTurns = conversationHistory.filter((m) => m.role === "parent").length;
  if (parentTurns === 0 && lower.length < 35 && !asksForAdvice(lower)) {
    if (/hard|heavy|rough|awful|drained|overwhelmed/i.test(lower)) return true;
  }

  return false;
}

function asksForAdvice(text: string): boolean {
  return (
    text.includes("?") ||
    text.includes("what should") ||
    text.includes("how do") ||
    text.includes("how can") ||
    text.includes("any advice") ||
    text.includes("help me with") ||
    text.includes("what can i")
  );
}

export function buildPresenceResponse(
  parentMessage: string,
  context: ChildContext,
  parentMood?: ParentMood | null,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const lower = parentMessage.toLowerCase();

  let opening = beliefGuidedPresence("That sounds incredibly heavy.");
  if (lower.includes("glad") || lower.includes("thank")) {
    opening = beliefGuidedPresence("I'm really glad you told me.");
  } else if (lower.includes("heavy") || lower.includes("awful") || lower.includes("brutal")) {
    opening = beliefGuidedPresence("That sounds incredibly heavy.");
  } else if (parentMood === "exhausted" || lower.includes("drained") || lower.includes("tired")) {
    opening = beliefGuidedPresence("You're carrying a lot right now.");
  } else if (parentMood === "need_to_talk") {
    opening = beliefGuidedPresence("I'm really glad you told me.");
  }

  return {
    likely_trigger: "You needed presence before problem-solving.",
    behaviour_explanation: opening,
    emotional_interpretation: beliefGuidedPresence(
      "We don't need to solve everything right now. I'm here with you.",
    ),
    suggested_response: beliefGuidedPresence("I'm here."),
    things_not_to_say: [],
    tomorrow_plan: beliefGuidedPresence(
      "When you're ready — about you, about " + name + ", or about tomorrow — we can take the next step together.",
    ),
    long_term_recommendation: beliefGuidedPresence(
      `Hard days don't define you or ${name}. Progress matters more than perfection.`,
    ),
    confidence_level: 0.92,
    follow_up_questions: [],
  };
}
