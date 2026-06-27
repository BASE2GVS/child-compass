import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { CoachMode } from "@/lib/ai/coach-mode";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import { weaveFamilyUnderstanding } from "@/lib/companion/family-understanding";
import { buildThinkingAloud } from "@/lib/companion/thinking-aloud";
import { noticePositiveChange } from "@/lib/companion/positive-change";
import { buildGentleChallenge } from "@/lib/companion/gentle-challenge";
import { isBriefMoment, buildBriefResponse } from "@/lib/companion/brief-moments";
import {
  inferConversationRhythm,
  type ConversationRhythm,
} from "@/lib/companion/conversation-rhythm";
import { buildConversationContinuity } from "@/lib/companion/conversation-memory";
import { inferParentUnderstanding } from "@/lib/companion/parent-understanding";
import { buildRelationshipDepth } from "@/lib/companion/growing-relationship";
import { buildFamilyStoryMoment } from "@/lib/companion/family-story";
import { needsPresenceFirst } from "@/lib/companion/emotional-presence";
import { shapeWithBeliefs } from "@/lib/companion/family-beliefs";
import {
  applyTrustLayer,
  buildTrustEnrichment,
  type TrustEnrichment,
} from "@/lib/companion/trust-layer";
import {
  buildCrossDayContinuity,
  type CoachMessageTurn,
} from "@/lib/companion/cross-day-continuity";
import {
  buildRhythmNote,
  detectFamilyRhythm,
  detectTherapyDayFromMessage,
} from "@/lib/companion/family-rhythms";
import { buildQuietAnticipation } from "@/lib/companion/quiet-anticipation";
import { buildMicroMoment } from "@/lib/companion/micro-moments";

const CLARIFY_OPENERS = [
  "I'd like to understand one thing first...",
  "Can I ask something?",
  "Just to help me understand...",
  "Before I suggest anything...",
];

function pickOpener(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return CLARIFY_OPENERS[h % CLARIFY_OPENERS.length];
}

const VAGUE_SIGNALS = [
  "help",
  "advice",
  "what should i",
  "struggling",
  "not sure",
  "don't know",
  "idk",
  "something happened",
  "bad day",
  "rough day",
  "???",
  "not going well",
  "having issues",
];

function isVague(message: string): boolean {
  const lower = message.toLowerCase().trim();
  if (lower.length >= 100) return false;
  if (lower.split(/\s+/).length <= 4) return true;
  return VAGUE_SIGNALS.some((s) => lower.includes(s));
}

function parentTurnCount(history: { role: string }[]): number {
  return history.filter((m) => m.role === "parent").length;
}

export function hasEnoughContext(
  message: string,
  conversationHistory: { role: string; content: string }[],
): boolean {
  const trimmed = message.trim();
  const parentTurns = parentTurnCount(conversationHistory);

  if (parentTurns === 0 && trimmed.length < 60 && isVague(trimmed)) return false;

  if (parentTurns >= 1 && parentTurns <= 2 && isVague(trimmed) && trimmed.length < 40) {
    return false;
  }

  if (parentTurns >= 1) {
    const priorParent = conversationHistory.filter((m) => m.role === "parent");
    const combined = priorParent.map((m) => m.content).join(" ") + " " + trimmed;
    if (combined.length >= 80 && !isVague(trimmed)) return true;
    if (priorParent.length >= 2 && trimmed.length >= 20) return true;
  }

  return trimmed.length >= 60 || (!isVague(trimmed) && trimmed.split(/\s+/).length >= 8);
}

export function shouldClarifyBeforeAdvice(
  message: string,
  conversationHistory: { role: string; content: string }[],
  mode: CoachMode,
): boolean {
  if (mode === "emergency" || mode === "product_help" || mode === "navigation") return false;
  if (isBriefMoment(message)) return false;
  return !hasEnoughContext(message, conversationHistory);
}

export function buildCuriousClarification(
  message: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[],
  parentMoodNote?: string | null,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const opener = pickOpener(message + String(conversationHistory.length));
  const parentTurns = parentTurnCount(conversationHistory);

  const questions: string[] = [];
  if (parentTurns === 0) {
    questions.push(`What was happening just before things felt difficult with ${name}?`);
    questions.push("What would feel most helpful — understanding, planning, or just being heard?");
  } else {
    questions.push(`Can you tell me a little more about what ${name} did or said?`);
    questions.push("Was there anything different about today compared to usual?");
  }

  const moodLine = parentMoodNote ? ` ${parentMoodNote}` : "";

  return {
    likely_trigger: "I'm gathering context before suggesting anything.",
    behaviour_explanation: `${opener}${moodLine} I don't want to guess about ${name} when a small detail could change everything.`,
    emotional_interpretation:
      parentTurns === 0
        ? "It's okay not to have it all sorted in your head yet. We can take this one piece at a time."
        : "Thank you for sharing what you have so far — a bit more will help me connect the dots.",
    suggested_response: questions[0],
    things_not_to_say: [],
    tomorrow_plan: "I'll have something more useful once I understand a little more.",
    long_term_recommendation: "There's no rush — tell me in your own words.",
    confidence_level: 0.42,
    follow_up_questions: questions.slice(0, 2),
  };
}

export type CuriousEnrichment = {
  thinkingAloud: string | null;
  familyUnderstanding: string | null;
  /** @deprecated use familyUnderstanding */
  naturalMemory: string | null;
  positiveChange: string | null;
  gentleChallenge: string | null;
  continuity: string | null;
  parentUnderstanding: string | null;
  relationshipDepth: string | null;
  familyStory: string | null;
  presenceOnly: boolean;
  trust: TrustEnrichment;
  boundaryNote: string | null;
  rhythm: ConversationRhythm;
  isBrief: boolean;
  crossDayContinuity: string | null;
  rhythmNote: string | null;
  quietAnticipation: string | null;
  microMoment: string | null;
};

export type { CoachMessageTurn };

export function buildCuriousEnrichment(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[],
  mode: CoachMode,
  options?: { parentMood?: ParentMood | null; coachMessages?: CoachMessageTurn[] },
): CuriousEnrichment {
  const rhythm = inferConversationRhythm(conversationHistory, parentMessage);
  const isBrief = isBriefMoment(parentMessage);
  const coachMessages = options?.coachMessages ?? [];
  const childName = context.child.nickname || context.child.first_name;
  const trust = buildTrustEnrichment(
    parentMessage,
    context,
    conversationHistory,
    options?.parentMood,
  );

  const presenceOnly = needsPresenceFirst(
    parentMessage,
    conversationHistory,
    options?.parentMood,
    mode,
  );

  const familyUnderstanding =
    isBrief || presenceOnly || trust.deferAdvice
      ? null
      : weaveFamilyUnderstanding(context, parentMessage);

  const parentUnderstanding =
    isBrief || presenceOnly
      ? null
      : inferParentUnderstanding(conversationHistory, options?.parentMood, rhythm);

  const relationshipDepth =
    isBrief || presenceOnly
      ? null
      : buildRelationshipDepth(context, conversationHistory);

  const storySeed = parentMessage.length + conversationHistory.length;
  const familyStory =
    isBrief || presenceOnly || storySeed % 5 !== 0
      ? null
      : buildFamilyStoryMoment(context);

  const crossDayContinuity =
    isBrief || presenceOnly
      ? null
      : buildCrossDayContinuity(coachMessages, parentMessage);

  let familyRhythm = detectFamilyRhythm();
  if (detectTherapyDayFromMessage(parentMessage)) {
    familyRhythm = { type: "therapy_day", label: "therapy day" };
  }
  const rhythmNote =
    isBrief || presenceOnly
      ? null
      : familyRhythm
        ? buildRhythmNote(familyRhythm, childName)
        : null;

  const quietAnticipation =
    isBrief || presenceOnly || trust.deferAdvice
      ? null
      : buildQuietAnticipation(context);

  const parentTurns = conversationHistory.filter((m) => m.role === "parent").length;
  const microMoment =
    isBrief || presenceOnly
      ? null
      : buildMicroMoment(parentMessage, context, parentTurns);

  return {
    thinkingAloud: isBrief || presenceOnly ? null : buildThinkingAloud(parentMessage, context, mode),
    familyUnderstanding,
    naturalMemory: familyUnderstanding,
    positiveChange: noticePositiveChange(context),
    gentleChallenge: buildGentleChallenge(parentMessage, context),
    continuity: buildConversationContinuity(conversationHistory, parentMessage),
    parentUnderstanding,
    relationshipDepth,
    familyStory,
    presenceOnly,
    trust,
    boundaryNote: trust.boundaryNote,
    rhythm,
    isBrief,
    crossDayContinuity,
    rhythmNote,
    quietAnticipation,
    microMoment,
  };
}

export function applyCuriousEnrichment(
  response: DebriefResponse,
  enrichment: CuriousEnrichment,
  context: ChildContext,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[] = [],
): DebriefResponse {
  if (enrichment.isBrief) {
    return applyTrustLayer(
      buildBriefResponse(parentMessage, context),
      context,
      parentMessage,
      conversationHistory,
      enrichment,
      enrichment.trust,
    );
  }

  let behaviour = shapeWithBeliefs(response.behaviour_explanation);
  let emotional = shapeWithBeliefs(response.emotional_interpretation);

  const stackLimit = enrichment.trust.deferAdvice ? 2 : 4;
  const emotionalParts: (string | null)[] = [];

  if (enrichment.familyStory) emotionalParts.push(enrichment.familyStory);
  if (enrichment.relationshipDepth && !enrichment.trust.deferAdvice) {
    emotionalParts.push(enrichment.relationshipDepth.replace(/— $/, ""));
  }
  if (enrichment.parentUnderstanding) emotionalParts.push(enrichment.parentUnderstanding);
  if (enrichment.familyUnderstanding) emotionalParts.push(enrichment.familyUnderstanding);
  if (enrichment.positiveChange && !enrichment.trust.deferAdvice) {
    emotionalParts.push(enrichment.positiveChange);
  }

  const stacked = emotionalParts.filter(Boolean).slice(0, stackLimit);
  if (stacked.length) {
    emotional = `${stacked.join(" ")} ${emotional}`;
  }

  if (enrichment.thinkingAloud && !enrichment.trust.deferAdvice) {
    behaviour = `${enrichment.thinkingAloud} ${behaviour}`;
  }

  if (enrichment.gentleChallenge) {
    behaviour = `${enrichment.gentleChallenge} ${behaviour}`;
  }

  if (enrichment.crossDayContinuity) {
    emotional = `${enrichment.crossDayContinuity}${emotional}`;
  }

  if (enrichment.continuity) {
    emotional = `${enrichment.continuity}${emotional}`;
  }

  if (enrichment.rhythmNote && !enrichment.trust.deferAdvice) {
    behaviour = `${enrichment.rhythmNote} ${behaviour}`;
  }

  if (enrichment.quietAnticipation && !enrichment.trust.deferAdvice) {
    behaviour = `${behaviour} ${enrichment.quietAnticipation}`;
  }

  const merged: DebriefResponse = {
    ...response,
    behaviour_explanation: behaviour,
    emotional_interpretation: emotional,
    suggested_response: shapeWithBeliefs(response.suggested_response),
    follow_up_questions:
      enrichment.rhythm === "brief" || enrichment.presenceOnly
        ? enrichment.trust.parentNeed === "understanding"
          ? response.follow_up_questions.slice(0, 1)
          : []
        : response.follow_up_questions.slice(0, 2),
  };

  return applyTrustLayer(
    merged,
    context,
    parentMessage,
    conversationHistory,
    enrichment,
    enrichment.trust,
  );
}

/** @deprecated use shouldClarifyBeforeAdvice */
export function needsClarification(
  message: string,
  conversationHistory: { role: string; content: string }[],
): boolean {
  return shouldClarifyBeforeAdvice(message, conversationHistory, "coaching");
}
