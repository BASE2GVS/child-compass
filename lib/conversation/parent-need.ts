import type { ParentMood } from "@/lib/companion/parent-checkin";

export type ParentNeed =
  | "emotional_support"
  | "problem_solving"
  | "new_ideas"
  | "celebration"
  | "preparation"
  | "being_heard"
  | "presence_only";

function contains(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

export function classifyParentNeed(
  message: string,
  options?: {
    parentMood?: ParentMood | null;
    conversationHistory?: { role: string; content: string }[];
  },
): ParentNeed {
  const lower = message.toLowerCase().trim();
  const history = options?.conversationHistory ?? [];

  if (
    contains(lower, [
      "don't want advice",
      "no advice",
      "not looking for advice",
      "just vent",
      "just need to vent",
      "just listen",
      "don't tell me what to do",
      "no questions please",
      "just talking",
    ])
  ) {
    return "presence_only";
  }

  if (
    contains(lower, [
      "just need to talk",
      "need to be heard",
      "nobody understands",
      "hear me out",
      "just talking",
      "getting this off my chest",
    ]) ||
    (lower.length < 40 && contains(lower, ["listen", "heard", "alone"]))
  ) {
    return "being_heard";
  }

  if (
    options?.parentMood === "exhausted" ||
    options?.parentMood === "need_to_talk" ||
    contains(lower, [
      "i'm exhausted",
      "i am exhausted",
      "so tired",
      "can't cope",
      "i can't cope",
      "falling apart",
      "burnt out",
      "burned out",
      "i'm struggling",
      "i am struggling",
      "overwhelmed",
      "breaking down",
      "rough day",
      "brutal day",
      "bad day",
    ])
  ) {
    return "emotional_support";
  }

  if (
    contains(lower, [
      "fantastic day",
      "great day",
      "amazing day",
      "best day",
      "went well",
      "so proud",
      "breakthrough",
      "recovered faster",
      "calmer today",
      "win today",
      "celebrate",
      "lovely day",
      "good day",
      "amazing at",
      "was amazing",
      "lovely calm",
      "calm evening",
      "great at",
    ])
  ) {
    return "celebration";
  }

  if (
    contains(lower, [
      "tried everything",
      "nothing works",
      "already tried",
      "we've tried",
      "doesn't work anymore",
      "out of ideas",
      "what else",
      "different approach",
      "think differently",
    ])
  ) {
    return "new_ideas";
  }

  if (
    contains(lower, [
      "tomorrow",
      "prepare for",
      "plan for",
      "this weekend",
      "school trip",
      "appointment",
      "worried about school tomorrow",
      "getting ready",
      "sports day",
      "party this",
    ])
  ) {
    return "preparation";
  }

  if (
    contains(lower, [
      "what should i",
      "what do i do",
      "how do i handle",
      "how can i help",
      "don't know what to do",
      "need help with",
      "tell me what to do",
      "any ideas for",
      "how should i",
    ]) ||
    (lower.includes("?") &&
      contains(lower, ["how", "what should", "what can", "what do"]))
  ) {
    return "problem_solving";
  }

  const priorAdviceAttempt = history
    .filter((m) => m.role === "parent")
    .some((m) => contains(m.content.toLowerCase(), ["tried", "already", "didn't work", "doesn't work"]));
  if (priorAdviceAttempt && history.filter((m) => m.role === "parent").length >= 2) {
    return "new_ideas";
  }

  if (contains(lower, ["i feel", "i'm worried", "i am worried", "scared", "anxious", "sad"])) {
    return "emotional_support";
  }

  if (history.length >= 2 && lower.length < 50) {
    return "being_heard";
  }

  return "problem_solving";
}
