import type {
  ConversationState,
  ConversationStateInfo,
  FamilyContextConversationTurn,
  FamilyContextIntent,
  FamilyContextTimelineHighlight,
} from "@/lib/talk-v2/contracts";
import { detectContextIntents } from "@/lib/talk-v2/context/intent-detection";

type DetectConversationStateInput = {
  parentMessage: string;
  intents: FamilyContextIntent[];
  recentConversation: FamilyContextConversationTurn[];
  timelineHighlights: FamilyContextTimelineHighlight[];
};

const CLARIFICATION_RE = /\b(what do you mean|can you clarify|clarify|which one|do you mean|what exactly|not sure what you mean)\b/i;
const FOLLOW_UP_RE = /\b(already|still|that|this|we tried|tried that|as you said|like before|again)\b/i;
const PROGRESS_RE = /\b(finally|better|improved|slept through|went well|progress|calmer|worked)\b/i;
const SETBACK_RE = /\b(worse|again|struggling again|regressed|fell apart|back to|not working|setback)\b/i;
const DECISION_RE = /\b(should we|should i|we decided|i decided|we will|i will|we chose|let's)\b/i;
const REFLECTION_RE = /\b(looking back|over the past|reflect|reflection|pattern over time|what are we missing|long term)\b/i;

function excerpt(text: string, max = 140): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}

function overlap(a: FamilyContextIntent[], b: FamilyContextIntent[]): number {
  const bSet = new Set(b);
  let count = 0;
  for (const item of a) {
    if (bSet.has(item)) count += 1;
  }
  return count;
}

function previousReference(
  conversation: FamilyContextConversationTurn[],
): ConversationStateInfo["previousConversationReference"] {
  if (!conversation.length) return null;
  const last = conversation[conversation.length - 1];
  return {
    role: last.role,
    createdAt: last.createdAt,
    excerpt: excerpt(last.content),
  };
}

function lastParentMessage(conversation: FamilyContextConversationTurn[]): string | null {
  for (let i = conversation.length - 1; i >= 0; i -= 1) {
    if (conversation[i].role === "parent") return conversation[i].content;
  }
  return null;
}

export function detectConversationState(input: DetectConversationStateInput): ConversationStateInfo {
  const text = input.parentMessage.trim();
  const lower = text.toLowerCase();
  const prevRef = previousReference(input.recentConversation);

  if (!input.recentConversation.length) {
    return {
      detectedState: "NEW_TOPIC",
      confidence: 0.95,
      reasoningCode: "STATE_NEW_TOPIC_EMPTY_HISTORY",
      previousConversationReference: null,
    };
  }

  if (CLARIFICATION_RE.test(lower)) {
    return {
      detectedState: "CLARIFICATION",
      confidence: 0.9,
      reasoningCode: "STATE_CLARIFICATION_DIRECT",
      previousConversationReference: prevRef,
    };
  }

  if (PROGRESS_RE.test(lower)) {
    return {
      detectedState: "PROGRESS",
      confidence: 0.88,
      reasoningCode: "STATE_PROGRESS_SIGNAL",
      previousConversationReference: prevRef,
    };
  }

  if (SETBACK_RE.test(lower)) {
    return {
      detectedState: "SETBACK",
      confidence: 0.88,
      reasoningCode: "STATE_SETBACK_SIGNAL",
      previousConversationReference: prevRef,
    };
  }

  if (DECISION_RE.test(lower)) {
    return {
      detectedState: "DECISION",
      confidence: 0.86,
      reasoningCode: "STATE_DECISION_SIGNAL",
      previousConversationReference: prevRef,
    };
  }

  if (REFLECTION_RE.test(lower)) {
    return {
      detectedState: "REFLECTION",
      confidence: 0.86,
      reasoningCode: "STATE_REFLECTION_SIGNAL",
      previousConversationReference: prevRef,
    };
  }

  const previousParent = lastParentMessage(input.recentConversation);
  if (previousParent) {
    const previousIntents = detectContextIntents(previousParent);
    const shared = overlap(input.intents, previousIntents);
    if (shared === 0 && !(input.intents.length === 1 && input.intents[0] === "general_support")) {
      return {
        detectedState: "NEW_TOPIC",
        confidence: 0.82,
        reasoningCode: "STATE_NEW_TOPIC_INTENT_SHIFT",
        previousConversationReference: prevRef,
      };
    }
  }

  if (FOLLOW_UP_RE.test(lower) || text.length <= 42) {
    return {
      detectedState: "FOLLOW_UP",
      confidence: 0.78,
      reasoningCode: "STATE_FOLLOW_UP_REFERENCE",
      previousConversationReference: prevRef,
    };
  }

  return {
    detectedState: "GENERAL",
    confidence: 0.7,
    reasoningCode: "STATE_GENERAL_DEFAULT",
    previousConversationReference: prevRef,
  };
}
