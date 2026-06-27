import type { ParentMood } from "@/lib/companion/parent-checkin";
import type { CoachMode } from "@/lib/ai/coach-mode";

export type ParentNeed =
  | "understanding"
  | "reassurance"
  | "advice"
  | "reflection"
  | "planning"
  | "being_heard";

const ADVICE_SIGNALS = [
  "what should",
  "how do i",
  "how can i",
  "any advice",
  "help me with",
  "what can i",
  "tell me what to",
];

const PLANNING_SIGNALS = ["prepare", "plan for", "tomorrow", "this weekend", "schedule"];

const REFLECTION_SIGNALS = [
  "why did",
  "what happened",
  "make sense",
  "understand why",
  "help me understand",
  "explain",
];

const REASSURANCE_SIGNALS = [
  "hope",
  "better today",
  "proud",
  "small win",
  "going well",
  "improving",
  "glad",
];

const HEARD_SIGNALS = [
  "just need",
  "need to talk",
  "need to vent",
  "crying",
  "cried",
  "so angry",
  "furious",
  "can't cope",
  "falling apart",
  "nobody understands",
  "not looking for advice",
];

export function detectParentNeed(
  message: string,
  conversationHistory: { role: string; content: string }[],
  parentMood?: ParentMood | null,
  mode?: CoachMode,
): ParentNeed {
  const lower = message.toLowerCase().trim();

  if (parentMood === "need_to_talk" || parentMood === "exhausted") {
    if (!ADVICE_SIGNALS.some((s) => lower.includes(s))) return "being_heard";
  }

  if (mode === "planning" || PLANNING_SIGNALS.some((s) => lower.includes(s))) {
    return "planning";
  }

  if (mode === "behaviour_reflection" || REFLECTION_SIGNALS.some((s) => lower.includes(s))) {
    return "reflection";
  }

  if (HEARD_SIGNALS.some((s) => lower.includes(s))) {
    return "being_heard";
  }

  if (REASSURANCE_SIGNALS.some((s) => lower.includes(s)) && !lower.includes("?")) {
    return "reassurance";
  }

  if (ADVICE_SIGNALS.some((s) => lower.includes(s)) || lower.includes("?")) {
    return "advice";
  }

  const parentTurns = conversationHistory.filter((m) => m.role === "parent").length;
  if (parentTurns === 0 && lower.length < 80) {
    return "understanding";
  }

  return "understanding";
}

export function shouldDeferAdvice(need: ParentNeed): boolean {
  return need === "being_heard" || need === "reassurance";
}

export function safestStartingPoint(need: ParentNeed): "presence" | "curiosity" | "guidance" {
  switch (need) {
    case "being_heard":
    case "reassurance":
      return "presence";
    case "understanding":
    case "reflection":
      return "curiosity";
    case "planning":
    case "advice":
      return "guidance";
  }
}
