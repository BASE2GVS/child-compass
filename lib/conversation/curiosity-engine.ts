import type { CoachMode } from "@/lib/ai/coach-mode";
import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import { isBriefMoment } from "@/lib/companion/brief-moments";
import { hasEnoughContext } from "@/lib/companion/curious-companion";
import type { ParentNeed } from "@/lib/conversation/parent-need";
import type { ParentStory } from "@/lib/conversation/parent-emotion";
import { analyzeParentStory, isParentEmotionalFocus } from "@/lib/conversation/parent-emotion";

const CONTEXT_CLUES = [
  "when ",
  "before ",
  "after ",
  "because ",
  "usually ",
  "always ",
  "different",
  "first ",
  "then ",
  "during ",
  "while ",
  "started ",
  "this time ",
  "today she",
  "today he",
  "this morning",
  "last night",
  "typical",
  "normally",
  "often ",
  "every time",
  "came closest",
  "we tried",
  "i tried",
  "already tried",
  "what happens is",
  "what usually",
];

const EMOTIONAL_NO_CURIOSITY = [
  "just need to vent",
  "just vent",
  "i'm crying",
  "i am crying",
  "can't stop crying",
  "don't want advice",
  "no advice",
  "just listen",
  "i'm exhausted",
  "i am exhausted",
  "falling apart",
  "overwhelmed",
];

const SKIP_CURIOSITY_NEEDS: ParentNeed[] = [
  "presence_only",
  "being_heard",
  "emotional_support",
  "celebration",
];

const ACKNOWLEDGMENTS = [
  "That helps me understand it much better.",
  "Thank you — that fills in an important piece.",
  "That's really helpful context.",
  "I can see the picture more clearly now.",
];

export type CuriosityInput = {
  message: string;
  conversationHistory: { role: string; content: string }[];
  parentNeed: ParentNeed;
  parentMood?: ParentMood | null;
  mode: CoachMode;
};

function countContextClues(text: string): number {
  const lower = text.toLowerCase();
  return CONTEXT_CLUES.filter((c) => lower.includes(c)).length;
}

function containsAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

function parentTurnCount(history: { role: string }[]): number {
  return history.filter((m) => m.role === "parent").length;
}

function pickFrom<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

export function shouldSkipCuriosity(input: CuriosityInput): boolean {
  const { message, parentNeed, parentMood, mode } = input;
  const lower = message.toLowerCase();

  if (mode === "emergency" || mode === "product_help" || mode === "navigation") return true;
  if (isBriefMoment(message)) return true;
  if (SKIP_CURIOSITY_NEEDS.includes(parentNeed)) return true;
  if (parentMood === "exhausted" || parentMood === "need_to_talk") return true;
  if (containsAny(lower, EMOTIONAL_NO_CURIOSITY)) return true;
  if (isParentEmotionalFocus(message, "")) return true;
  if (parentNeed === "emotional_support" && /^i'?m /i.test(message.trim())) return true;
  if (
    containsAny(lower, [
      "won't eat",
      "wont eat",
      "not eating",
      "not drinking",
      "won't drink",
      "self-harm",
      "self harm",
    ])
  ) {
    return true;
  }

  return false;
}

export function lastAssistantWasCuriosity(
  history: { role: string; content: string }[],
): boolean {
  const assistants = history.filter((m) => m.role === "assistant");
  const last = assistants[assistants.length - 1];
  if (!last) return false;

  const text = last.content;
  const questionCount = (text.match(/\?/g) ?? []).length;
  const hasAdvice = /One thought —|Something you could try|Phrases to avoid/i.test(text);

  return questionCount >= 1 && questionCount <= 2 && !hasAdvice;
}

export function isAnsweringCuriosity(
  history: { role: string; content: string }[],
  message: string,
): boolean {
  if (history.length < 2 || !message.trim()) return false;
  if (!lastAssistantWasCuriosity(history)) return false;

  const lastParentBefore = [...history].reverse().find((m) => m.role === "parent");
  if (!lastParentBefore) return false;

  return message.trim().length >= 8 && message !== lastParentBefore.content;
}

export function needsSituationalExploration(message: string, parentNeed: ParentNeed): boolean {
  const lower = message.toLowerCase();

  if (parentNeed === "new_ideas") {
    const mentionsAttempt =
      countContextClues(lower) >= 1 ||
      /tried|attempted|used|visual|timer|corner|schedule|strategy/i.test(lower);
    if (!mentionsAttempt) return true;
  }

  if (containsAny(lower, ["something happened", "bad day", "rough day", "not going well"])) {
    if (countContextClues(lower) < 1) return true;
  }

  const behaviorSignals = [
    "stole",
    "stealing",
    "took from",
    "refuse",
    "refuses",
    "won't",
    "wont",
    "scream",
    "meltdown",
    "tantrum",
    "hit",
    "hitting",
    "bit ",
    "hurt ",
    "ran away",
    "hid ",
  ];

  if (behaviorSignals.some((b) => lower.includes(b)) && countContextClues(lower) < 1) {
    return true;
  }

  if (
    /how (do|can|should) i (handle|help|deal|respond)/.test(lower) &&
    countContextClues(lower) < 1 &&
    lower.length < 90
  ) {
    return true;
  }

  return false;
}

export function understandsEnough(input: CuriosityInput): boolean {
  if (shouldSkipCuriosity(input)) return true;

  const { message, conversationHistory, parentNeed } = input;
  const trimmed = message.trim();
  const parentTurns = parentTurnCount(conversationHistory);

  if (isAnsweringCuriosity(conversationHistory, message)) return true;

  const priorParent = conversationHistory
    .filter((m) => m.role === "parent")
    .map((m) => m.content)
    .join(" ");
  const combined = `${priorParent} ${trimmed}`.trim();
  const clueCount = countContextClues(combined);

  if (clueCount >= 2) return true;
  if (combined.length >= 160 && clueCount >= 1) return true;
  if (parentTurns >= 2 && trimmed.length >= 25) return true;

  if (needsSituationalExploration(trimmed, parentNeed)) return false;

  return hasEnoughContext(trimmed, conversationHistory);
}

export function shouldBeCurious(input: CuriosityInput): boolean {
  return !understandsEnough(input);
}

function siblingPhrase(lower: string): string {
  if (lower.includes("sister")) return "their sister's room";
  if (lower.includes("brother")) return "their brother's room";
  return "their sibling's room";
}

export function pickCuriosityQuestion(
  message: string,
  childName: string,
  parentNeed: ParentNeed,
  conversationHistory: { role: string; content: string }[],
): string {
  const lower = message.toLowerCase();

  if (
    parentNeed === "new_ideas" ||
    containsAny(lower, ["tried everything", "nothing works", "out of ideas"])
  ) {
    return "Can you tell me one thing you've already tried that came closest to helping?";
  }

  if (/stole|stealing|took from|taken from/.test(lower) && /sister|brother|sibling/.test(lower)) {
    return `When ${childName} goes into ${siblingPhrase(lower)}, what usually happens next?`;
  }

  if (/refus|won't|wont/.test(lower) && /bath|shower|wash/.test(lower)) {
    return `What seems hardest for ${childName} about bath time?`;
  }

  if (/how (do|can|should) i (handle|help|deal|respond)/.test(lower)) {
    return `What does a typical hard moment look like for you and ${childName}?`;
  }

  if (/scream|meltdown|tantrum|shout/.test(lower) && /morning|mornings/.test(lower)) {
    return "Was today different from most mornings?";
  }

  if (/scream|meltdown|tantrum|shout/.test(lower)) {
    return "What was happening just before things escalated?";
  }

  if (/hit|hitting|hurt|bit /.test(lower)) {
    return "What was going on right before that happened?";
  }

  if (/refus|won't|wont/.test(lower)) {
    return `What seems hardest for ${childName} about that?`;
  }

  if (/homework|worksheet|assignment/.test(lower)) {
    return `What part of homework tends to trip ${childName} up?`;
  }

  if (/sleep|bedtime|night|wake/.test(lower) && countContextClues(lower) < 1) {
    return "What does bedtime look like when it's hardest?";
  }

  if (/school/.test(lower) && countContextClues(lower) < 1) {
    return "What part of school felt hardest today?";
  }

  if (containsAny(lower, ["something happened", "not going well"])) {
    return `What was happening just before things felt difficult with ${childName}?`;
  }

  const parentTurns = parentTurnCount(conversationHistory);
  if (parentTurns === 0) {
    return `What was happening just before things felt difficult with ${childName}?`;
  }

  return `Can you tell me a little more about what ${childName} did or said?`;
}

export function buildCuriosityAcknowledgment(message: string): string {
  return pickFrom(ACKNOWLEDGMENTS, message);
}

export function buildCuriosityResponse(
  message: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[],
  parentNeed: ParentNeed,
  parentStory?: ParentStory,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const question = pickCuriosityQuestion(message, name, parentNeed, conversationHistory);
  const story =
    parentStory ??
    analyzeParentStory(message, {
      parentNeed,
      childName: name,
      willBeCurious: true,
    });
  const ackLines = story.acknowledgment.split("\n\n").filter(Boolean);

  return {
    likely_trigger: "",
    behaviour_explanation: ackLines[0] ?? "",
    emotional_interpretation: ackLines.slice(1).join("\n\n"),
    suggested_response: "",
    things_not_to_say: [],
    tomorrow_plan: "",
    long_term_recommendation: "",
    confidence_level: 0.35,
    follow_up_questions: [question],
  };
}
