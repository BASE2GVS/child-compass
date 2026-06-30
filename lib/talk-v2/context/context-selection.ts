import { CONTEXT_LIMITS } from "@/lib/talk-v2/context/constants";
import type {
  ConversationState,
  FamilyContextConversationTurn,
  FamilyContextIntent,
  FamilyContextSelectionMetadata,
  FamilyContextTimelineHighlight,
  FamilyContextPattern,
  FamilyContextCheckin,
} from "@/lib/talk-v2/contracts";
import type { ParentDebrief } from "@/lib/types/database";

const INTENT_TERMS: Record<FamilyContextIntent, string[]> = {
  sleep: ["sleep", "bed", "bedtime", "night", "wake", "tired"],
  anxiety: ["anxious", "anxiety", "worry", "panic", "afraid"],
  meltdown: ["meltdown", "shutdown", "scream", "aggressive", "explode"],
  school: ["school", "teacher", "class", "homework", "attendance"],
  eating: ["eat", "eating", "food", "meal", "appetite"],
  communication: ["talk", "communication", "speech", "explain", "said"],
  sensory: ["sensory", "noise", "loud", "bright", "texture"],
  behaviour: ["behaviour", "behavior", "defiant", "refusal", "hitting"],
  social: ["friend", "social", "playdate", "party", "peer"],
  emotional_regulation: ["regulate", "regulated", "calm", "overwhelmed", "dysregulated"],
  medication: ["medication", "medicine", "dose", "tablet", "prescription"],
  routine: ["routine", "transition", "schedule", "morning", "evening"],
  parent_wellbeing: ["exhausted", "drained", "burnout", "can't cope", "overwhelmed parent"],
  general_support: [],
};

function corpusHasIntent(corpus: string, intents: FamilyContextIntent[]): boolean {
  const text = corpus.toLowerCase();
  for (const intent of intents) {
    const terms = INTENT_TERMS[intent];
    if (!terms.length) continue;
    if (terms.some((term) => text.includes(term))) return true;
  }
  return false;
}

function stateBoost(state: ConversationState, corpus: string, source: string): number {
  const lower = corpus.toLowerCase();

  if (state === "FOLLOW_UP") {
    if (source === "recentConversation") return 5;
    if (/\b(we tried|already|still|that|this|as you said)\b/i.test(lower)) return 3;
  }

  if (state === "PROGRESS") {
    if (/\b(win|worked|better|improved|calmer|success|finally)\b/i.test(lower)) return 4;
    if (source === "dailyCheckins" || source === "timelineHighlights") return 2;
  }

  if (state === "SETBACK") {
    if (/\b(worse|again|struggling|setback|regressed|fell apart|not working)\b/i.test(lower)) return 4;
    if (source === "timelineHighlights" || source === "dailyCheckins") return 2;
  }

  if (state === "CLARIFICATION") {
    if (source === "recentConversation") return 5;
  }

  if (state === "DECISION") {
    if (/\b(should|option|recommend|plan|next step|decide)\b/i.test(lower)) return 4;
    if (source === "behaviourPatterns" || source === "recentDebriefs") return 2;
  }

  if (state === "REFLECTION") {
    if (/\b(pattern|over time|history|long term|week|month)\b/i.test(lower)) return 3;
    if (source === "timelineHighlights" || source === "behaviourPatterns") return 2;
  }

  if (state === "NEW_TOPIC") {
    if (source === "behaviourPatterns" || source === "dailyCheckins") return 1;
  }

  return 0;
}

function recencyBoost(dateIso?: string): number {
  if (!dateIso) return 0;
  const ms = new Date(dateIso).getTime();
  if (!Number.isFinite(ms)) return 0;
  const days = Math.max(0, Math.floor((Date.now() - ms) / 86400000));
  return Math.max(0, 1 - days / 30);
}

function selectByIntent<T>(
  items: T[],
  toCorpus: (item: T) => string,
  toDate: (item: T) => string | undefined,
  intents: FamilyContextIntent[],
  state: ConversationState,
  source: string,
  limit: number,
): T[] {
  if (!items.length) return [];

  const scored = items
    .map((item, index) => {
      const corpus = toCorpus(item);
      const intentMatch = corpusHasIntent(corpus, intents) ? 1 : 0;
      const stateScore = stateBoost(state, corpus, source);
      const recency = recencyBoost(toDate(item));
      const score = intentMatch * 5 + stateScore + recency;
      return { item, score, index };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    });

  if (intents.length === 1 && intents[0] === "general_support" && state === "GENERAL") {
    return scored.slice(0, limit).map((entry) => entry.item);
  }

  // For CLARIFICATION and FOLLOW_UP, stay tightly close to previous exchange.
  if (state === "CLARIFICATION" || state === "FOLLOW_UP") {
    return scored.slice(0, Math.min(limit, 6)).map((entry) => entry.item);
  }

  if (state === "NEW_TOPIC") {
    // Keep broader context for new topics while still preferring intent matches.
    const primary = scored.filter((entry) => entry.score >= 5).slice(0, Math.ceil(limit / 2));
    const secondary = scored.filter((entry) => entry.score < 5).slice(0, limit - primary.length);
    return [...primary, ...secondary].map((entry) => entry.item).slice(0, limit);
  }

  return scored.slice(0, limit).map((entry) => entry.item);
}

export type SelectContextInput = {
  intents: FamilyContextIntent[];
  conversationState: ConversationState;
  recentConversation: FamilyContextConversationTurn[];
  dailyCheckins: FamilyContextCheckin[];
  timelineHighlights: FamilyContextTimelineHighlight[];
  behaviourPatterns: FamilyContextPattern[];
  recentDebriefs: ParentDebrief[];
};

export type SelectContextOutput = {
  recentConversation: FamilyContextConversationTurn[];
  dailyCheckins: FamilyContextCheckin[];
  timelineHighlights: FamilyContextTimelineHighlight[];
  behaviourPatterns: FamilyContextPattern[];
  recentDebriefs: ParentDebrief[];
  metadata: FamilyContextSelectionMetadata;
};

export function selectContextByIntent(input: SelectContextInput): SelectContextOutput {
  const selectedConversation = selectByIntent(
    input.recentConversation,
    (item) => item.content,
    (item) => item.createdAt,
    input.intents,
    input.conversationState,
    "recentConversation",
    CONTEXT_LIMITS.recentConversation,
  );

  const selectedCheckins = selectByIntent(
    input.dailyCheckins,
    (item) => `${item.wins.join(" ")} ${item.challenges.join(" ")} ${item.notes || ""}`,
    (item) => item.date,
    input.intents,
    input.conversationState,
    "dailyCheckins",
    CONTEXT_LIMITS.dailyCheckins,
  );

  const selectedTimeline = selectByIntent(
    input.timelineHighlights,
    (item) => `${item.type} ${item.title} ${item.description || ""}`,
    (item) => item.date,
    input.intents,
    input.conversationState,
    "timelineHighlights",
    CONTEXT_LIMITS.timelineHighlights,
  );

  const selectedPatterns = selectByIntent(
    input.behaviourPatterns,
    (item) => `${item.category} ${item.title} ${item.description}`,
    () => undefined,
    input.intents,
    input.conversationState,
    "behaviourPatterns",
    CONTEXT_LIMITS.behaviourPatterns,
  );

  const selectedDebriefs = selectByIntent(
    input.recentDebriefs,
    (item) => `${item.parent_message} ${item.likely_trigger || ""}`,
    (item) => item.created_at,
    input.intents,
    input.conversationState,
    "recentDebriefs",
    CONTEXT_LIMITS.recentDebriefs,
  );

  const selectedContextSources: string[] = [];
  const omittedContextSources: string[] = [];

  const sourceStatus: Array<{ source: string; hasItems: boolean }> = [
    { source: "recentConversation", hasItems: selectedConversation.length > 0 },
    { source: "dailyCheckins", hasItems: selectedCheckins.length > 0 },
    { source: "timelineHighlights", hasItems: selectedTimeline.length > 0 },
    { source: "behaviourPatterns", hasItems: selectedPatterns.length > 0 },
    { source: "recentDebriefs", hasItems: selectedDebriefs.length > 0 },
  ];

  for (const entry of sourceStatus) {
    if (entry.hasItems) selectedContextSources.push(entry.source);
    else omittedContextSources.push(entry.source);
  }

  const retrievalRationale = input.intents.map((intent) => {
    if (intent === "general_support") {
      return "No specific intent keywords found; selected balanced bounded context across sources.";
    }
    return `Prioritized context containing ${intent.replace(/_/g, " ")} signals.`;
  });
  retrievalRationale.push(`Conversation state ${input.conversationState} influenced source prioritization.`);

  return {
    recentConversation: selectedConversation,
    dailyCheckins: selectedCheckins,
    timelineHighlights: selectedTimeline,
    behaviourPatterns: selectedPatterns,
    recentDebriefs: selectedDebriefs,
    metadata: {
      detectedIntents: input.intents,
      conversationState: input.conversationState,
      retrievalRationale,
      selectedContextSources,
      omittedContextSources,
      retrievalLimitsApplied: {
        recentConversation: CONTEXT_LIMITS.recentConversation,
        dailyCheckins: CONTEXT_LIMITS.dailyCheckins,
        timelineHighlights: CONTEXT_LIMITS.timelineHighlights,
        behaviourPatterns: CONTEXT_LIMITS.behaviourPatterns,
        recentDebriefs: CONTEXT_LIMITS.recentDebriefs,
        relevantMemories: CONTEXT_LIMITS.relevantMemories,
        familyStorySignals: CONTEXT_LIMITS.familyStorySignals,
      },
    },
  };
}
