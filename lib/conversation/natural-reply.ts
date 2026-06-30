import type { ChildContext, DebriefResponse } from "@/lib/types/database";

import type { CuriousEnrichment } from "@/lib/companion/curious-companion";

import { warmTone } from "@/lib/companion/conversation-intelligence";

import { humanizeParentText } from "@/lib/companion/human-language";

import {

  adviceAlreadyGiven,

  extractPriorAdviceTopics,

} from "@/lib/companion/conversation-memory";

import type { ConversationStyle } from "@/lib/conversation/conversation-style";

import {

  acknowledgmentAlreadyPresent,

  stripChildFirstAnalysis,

} from "@/lib/conversation/parent-emotion";

import { sanitizeForNaturalConversation } from "@/lib/conversation/sanitize-reply";

import { needsProfessionalHelp } from "@/lib/conversation/safety";
import { isExternalLLMConfigured } from "@/lib/ai/future-provider";



function pickQuestion(questions: string[]): string | null {

  const q = questions.find((x) => x.trim().endsWith("?"));

  return q ? warmTone(q) : null;

}



function weaveAdviceNaturally(advice: string): string {

  const trimmed = advice.trim();

  if (!trimmed) return "";

  if (trimmed.endsWith("?")) return trimmed;

  if (/^(you might|it may|perhaps|one thought|what if|one small thing)/i.test(trimmed)) {

    return trimmed;

  }

  return trimmed;

}

function toOneGentleStep(text: string): string | null {

  const trimmed = text.trim();

  if (!trimmed) return null;

  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0]?.trim() || trimmed;

  const softened = firstSentence.trim();

  if (!softened) return null;

  return weaveAdviceNaturally(softened);

}



function repeatPivot(): string {

  return "Thank you for telling me that — it helps me understand we may need to think about this differently.";

}



function parentAckParts(enrichment?: CuriousEnrichment): string[] {

  const ack = enrichment?.parentStory?.acknowledgment;

  if (!ack?.trim()) return [];

  return ack.split("\n\n").map((p) => sanitizeForNaturalConversation(warmTone(p))).filter(Boolean);

}



function prependParentAcknowledgment(

  paragraphs: string[],

  enrichment?: CuriousEnrichment,

): string[] {

  const ackParts = parentAckParts(enrichment);

  if (!ackParts.length) return paragraphs;



  const existing = paragraphs.join(" ");

  if (acknowledgmentAlreadyPresent(existing, enrichment!.parentStory.acknowledgment)) {

    return paragraphs;

  }



  return [...ackParts, ...paragraphs];

}



export function formatNaturalReply(

  response: DebriefResponse,

  context: ChildContext,

  parentMessage: string,

  conversationHistory: { role: string; content: string }[] = [],

  style: ConversationStyle,

  enrichment?: CuriousEnrichment,

): string {

  const childName = context.child.nickname || context.child.first_name;

  const llmComposed = [
    response.emotional_interpretation,
    response.behaviour_explanation,
    response.suggested_response,
    response.tomorrow_plan,
  ]
    .map((t) => sanitizeForNaturalConversation(warmTone(t || "")))
    .filter(Boolean)
    .slice(0, 4)
    .join("\n\n");

  if (isExternalLLMConfigured() && llmComposed.trim()) {
    return humanizeParentText(llmComposed);
  }



  if (enrichment?.isCuriosityMode) {

    const parts: string[] = parentAckParts(enrichment);

    if (!parts.length) {

      parts.push(

        sanitizeForNaturalConversation(

          warmTone(response.behaviour_explanation || response.emotional_interpretation),

        ),

      );

      const extra = sanitizeForNaturalConversation(warmTone(response.emotional_interpretation));

      if (extra && extra !== parts[0]) parts.push(extra);

    }

    const transition = enrichment.parentStory?.curiosityTransition;

    if (transition) parts.push(transition);

    const q = pickQuestion(response.follow_up_questions);

    if (q) parts.push(q);

    return humanizeParentText(parts.filter(Boolean).join("\n\n"));

  }



  const forcePresenceOnly =
    (enrichment?.presenceOnly || enrichment?.trust.emotionalHolding) &&
    !["problem_solving", "new_ideas", "preparation"].includes(style.need);

  if (forcePresenceOnly) {

    const parts = prependParentAcknowledgment(

      [

        sanitizeForNaturalConversation(warmTone(response.emotional_interpretation)),

        sanitizeForNaturalConversation(warmTone(response.behaviour_explanation)),

      ].filter(Boolean),

      enrichment,

    );

    return humanizeParentText(parts.slice(0, 2).join("\n\n"));

  }



  if (enrichment?.isBrief) {

    const brief = prependParentAcknowledgment(

      [

        sanitizeForNaturalConversation(warmTone(response.emotional_interpretation)),

        sanitizeForNaturalConversation(warmTone(response.behaviour_explanation)),

      ].filter(Boolean),

      enrichment,

    );

    return humanizeParentText(brief.join("\n\n"));

  }



  const priorAdvice = extractPriorAdviceTopics(conversationHistory);

  const priorAssistant = conversationHistory

    .filter((m) => m.role === "assistant")

    .map((m) => m.content)

    .join(" ");

  const repeatAdvice =

    priorAdvice.some((a) =>

      response.suggested_response.toLowerCase().includes(a.toLowerCase().slice(0, 30)),

    ) ||

    adviceAlreadyGiven(priorAssistant, response.suggested_response);



  let emotional = sanitizeForNaturalConversation(warmTone(response.emotional_interpretation));

  let behaviour = sanitizeForNaturalConversation(warmTone(response.behaviour_explanation));

  const question = pickQuestion(response.follow_up_questions);



  if (enrichment?.parentStory?.parentIsFocus) {

    behaviour = stripChildFirstAnalysis(behaviour, childName);

    emotional = stripChildFirstAnalysis(emotional, childName);

  }



  const paragraphs: string[] = [];

  const need = style.need;



  if (need === "presence_only" || enrichment?.parentStory?.parentIsFocus) {

    if (emotional) paragraphs.push(emotional);

    else if (behaviour) paragraphs.push(behaviour);

    return humanizeParentText(

      prependParentAcknowledgment(paragraphs, enrichment).slice(0, 2).join("\n\n"),

    );

  }



  if (style.questionsFirst || (response.confidence_level < 0.5 && question)) {

    if (emotional) paragraphs.push(emotional);

    if (behaviour && behaviour !== emotional) paragraphs.push(behaviour);

    if (question) paragraphs.push(question);

    return humanizeParentText(

      prependParentAcknowledgment(paragraphs, enrichment).slice(0, style.maxParagraphs).join("\n\n"),

    );

  }



  if (need === "emotional_support" || need === "being_heard") {

    if (emotional) paragraphs.push(emotional);

    if (behaviour && behaviour !== emotional) paragraphs.push(behaviour);

    if (
      need === "emotional_support" &&
      !enrichment?.trust.deferAdvice &&
      response.suggested_response?.trim()
    ) {

      const oneStep = toOneGentleStep(response.suggested_response);

      if (oneStep) paragraphs.push(sanitizeForNaturalConversation(oneStep));

      if (response.tomorrow_plan?.trim()) {

        const groundedClose = sanitizeForNaturalConversation(
          warmTone(`Perhaps tomorrow, if it feels manageable, ${response.tomorrow_plan.replace(/^A gentle next step\s*/i, "").replace(/^to\s+/i, "")}`),
        );

        if (groundedClose && paragraphs.length < style.maxParagraphs) paragraphs.push(groundedClose);

      }

    }

    if (style.includeFollowUp && question) paragraphs.push(question);

    return humanizeParentText(

      prependParentAcknowledgment(paragraphs, enrichment).slice(0, style.maxParagraphs).join("\n\n"),

    );

  }



  if (need === "celebration") {

    paragraphs.push("That sounds like a real win for both of you.");

    const ackParts = parentAckParts(enrichment);

    if (ackParts.length) {

      const out = [...paragraphs, ...ackParts.slice(0, 1)];

      if (response.tomorrow_plan?.trim()) {

        out.push(
          sanitizeForNaturalConversation(
            warmTone(`Perhaps tomorrow, if it feels manageable, ${response.tomorrow_plan.replace(/^A gentle next step\s*/i, "").replace(/^to\s+/i, "")}`),
          ),
        );

      }

      return humanizeParentText(out.slice(0, 3).join("\n\n"));

    }

    if (emotional) paragraphs.push(emotional);

    if (behaviour && behaviour !== emotional && !/overwhelm|pattern|may be feeling/i.test(behaviour)) {

      paragraphs.push(behaviour);

    }

    if (response.tomorrow_plan?.trim()) {

      paragraphs.push(
        sanitizeForNaturalConversation(
          warmTone(`Perhaps tomorrow, if it feels manageable, ${response.tomorrow_plan.replace(/^A gentle next step\s*/i, "").replace(/^to\s+/i, "")}`),
        ),
      );

    }

    return humanizeParentText(paragraphs.slice(0, 3).join("\n\n"));

  }



  if (emotional) paragraphs.push(emotional);

  if (behaviour && behaviour !== emotional) paragraphs.push(behaviour);



  if (repeatAdvice && style.includeAdvice) {

    paragraphs.push(repeatPivot());

  } else if (style.includeAdvice && response.suggested_response?.trim() && !enrichment?.trust.deferAdvice) {

    const advice = weaveAdviceNaturally(response.suggested_response);

    if (advice) paragraphs.push(sanitizeForNaturalConversation(advice));

  }



  if (need === "preparation" && response.tomorrow_plan?.trim() && !enrichment?.trust.deferAdvice) {

    paragraphs.push(

      sanitizeForNaturalConversation(warmTone(response.tomorrow_plan.replace(/^A gentle next step\s*/i, ""))),

    );

  }



  if (need === "new_ideas" && style.includeFollowUp && question) {

    paragraphs.push(question);

  } else if (style.includeFollowUp && question && paragraphs.length < style.maxParagraphs) {

    paragraphs.push(question);

  }



  if (needsProfessionalHelp(parentMessage) && style.includeProfessionalHelp) {

    paragraphs.push(

      "If safety feels at risk, please reach your GP, paediatrician, or local crisis support. You do not have to carry this alone.",

    );

  }



  if (enrichment?.boundaryNote && !enrichment.trust.deferAdvice) {

    paragraphs.push(sanitizeForNaturalConversation(warmTone(enrichment.boundaryNote)));

  }



  if (enrichment?.microMoment && paragraphs.length < style.maxParagraphs) {

    paragraphs.push(enrichment.microMoment);

  }



  return humanizeParentText(

    prependParentAcknowledgment(paragraphs, enrichment)

      .filter(Boolean)

      .slice(0, style.maxParagraphs)

      .join("\n\n"),

  );

}


