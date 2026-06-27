import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { CuriousEnrichment } from "@/lib/companion/curious-companion";
import {
  detectParentNeed,
  shouldDeferAdvice,
  type ParentNeed,
} from "@/lib/companion/emotional-safety";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import { buildHumilityNote, capConfidenceForEvidence } from "@/lib/companion/intellectual-humility";
import {
  buildPossibilitiesFraming,
  softenDefinitiveLanguage,
} from "@/lib/companion/multiple-possibilities";
import {
  buildBoundaryNote,
  stripOverreachLanguage,
  soundsAnalytical,
} from "@/lib/companion/trust-boundaries";
import { diversifyPhrases } from "@/lib/companion/phrase-diversity";

export type TrustEnrichment = {
  parentNeed: ParentNeed;
  deferAdvice: boolean;
  humilityNote: string | null;
  boundaryNote: string | null;
  emotionalHolding: boolean;
};

export function buildTrustEnrichment(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[],
  parentMood?: ParentMood | null,
): TrustEnrichment {
  const parentNeed = detectParentNeed(parentMessage, conversationHistory, parentMood);
  const deferAdvice = shouldDeferAdvice(parentNeed);

  return {
    parentNeed,
    deferAdvice,
    humilityNote: deferAdvice ? null : buildHumilityNote(context),
    boundaryNote: buildBoundaryNote(parentMessage),
    emotionalHolding: false,
  };
}

export function applyTrustLayer(
  response: DebriefResponse,
  context: ChildContext,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[],
  enrichment: CuriousEnrichment,
  trust: TrustEnrichment,
): DebriefResponse {
  const hasMultipleFactors =
    context.patterns.length > 0 &&
    (context.recentCheckins[0]?.anxiety ?? 3) >= 3;

  let behaviour = softenDefinitiveLanguage(response.behaviour_explanation);
  let emotional = softenDefinitiveLanguage(response.emotional_interpretation);
  let suggested = response.suggested_response;
  let tomorrow = response.tomorrow_plan;
  let longTerm = response.long_term_recommendation;

  const possibilities = buildPossibilitiesFraming(parentMessage, hasMultipleFactors);
  if (possibilities && !trust.deferAdvice && !enrichment.presenceOnly) {
    behaviour = `${possibilities}${behaviour}`;
  }

  if (trust.humilityNote && !enrichment.presenceOnly && !enrichment.isBrief) {
    emotional = `${trust.humilityNote} ${emotional}`;
  }

  if (trust.deferAdvice || enrichment.presenceOnly) {
    suggested = "";
    tomorrow = "When you're ready, we can talk — or we can simply leave it here for tonight.";
    longTerm = "There's no pressure to act on anything right now.";
  }

  behaviour = stripOverreachLanguage(behaviour);
  emotional = stripOverreachLanguage(emotional);
  suggested = stripOverreachLanguage(suggested);

  behaviour = diversifyPhrases(behaviour, conversationHistory);
  emotional = diversifyPhrases(emotional, conversationHistory);

  if (soundsAnalytical(behaviour)) {
    behaviour = behaviour.replace(/\bpattern\b/gi, "thread");
  }
  if (soundsAnalytical(emotional)) {
    emotional = emotional.replace(/\bdata\b/gi, "what you've shared");
  }

  const confidence = capConfidenceForEvidence(response.confidence_level, context);

  const followUps =
    trust.deferAdvice || enrichment.presenceOnly
      ? trust.parentNeed === "understanding"
        ? response.follow_up_questions.slice(0, 1)
        : []
      : response.follow_up_questions;

  return {
    ...response,
    behaviour_explanation: behaviour,
    emotional_interpretation: emotional,
    suggested_response: suggested,
    tomorrow_plan: tomorrow,
    long_term_recommendation: longTerm,
    confidence_level: confidence,
    follow_up_questions: followUps,
    things_not_to_say: trust.deferAdvice ? [] : response.things_not_to_say,
  };
}
