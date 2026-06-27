import type { ChildContext, DebriefResponse } from "@/lib/types/database";

import type { CoachMode } from "@/lib/ai/coach-mode";

import type { CuriousEnrichment } from "@/lib/companion/curious-companion";

import { buildNextStepOffer, warmTone } from "@/lib/companion/conversation-intelligence";

import { rhythmMaxSections } from "@/lib/companion/conversation-rhythm";

import { extractPriorAdviceTopics } from "@/lib/companion/conversation-memory";

import { humanizeParentText } from "@/lib/companion/human-language";

const PROFESSIONAL_HELP_KEYWORDS = [

  "hurt themselves",

  "self-harm",

  "suicidal",

  "violent",

  "abuse",

  "unsafe",

  "emergency",

];



export function needsProfessionalHelp(message: string): boolean {

  const lower = message.toLowerCase();

  return PROFESSIONAL_HELP_KEYWORDS.some((k) => lower.includes(k));

}



export function formatCoachResponse(

  response: DebriefResponse,

  context: ChildContext,

  _memoryReference: string | null,

  parentMessage: string,

  conversationHistory: { role: string; content: string }[] = [],

  mode: CoachMode = "coaching",

  enrichment?: CuriousEnrichment,

): string {

  const rhythm = enrichment?.rhythm ?? "balanced";

  const deferAdvice = enrichment?.trust.deferAdvice || enrichment?.presenceOnly;

  const emotionalHolding = enrichment?.trust.emotionalHolding;



  if (enrichment?.presenceOnly || emotionalHolding) {

    return humanizeParentText(

      [

        warmTone(response.behaviour_explanation),

        warmTone(response.emotional_interpretation),

      ]

        .filter(Boolean)

        .join("\n\n"),

    );

  }



  if (enrichment?.isBrief) {

    return humanizeParentText(

      [

        warmTone(response.behaviour_explanation),

        warmTone(response.emotional_interpretation),

      ]

        .filter(Boolean)

        .join("\n\n"),

    );

  }



  const isClarifying = response.confidence_level < 0.5 && response.follow_up_questions.length > 0;

  const priorAdvice = extractPriorAdviceTopics(conversationHistory);

  const repeatAdvice = priorAdvice.some((a) =>

    response.suggested_response.toLowerCase().includes(a.toLowerCase().slice(0, 30)),

  );



  const sections: (string | null)[] = [];



  if (isClarifying) {

    sections.push(warmTone(response.behaviour_explanation));

    sections.push(warmTone(response.emotional_interpretation));

    if (response.follow_up_questions.length) {

      sections.push(

        `When you're ready\n${response.follow_up_questions.map((q) => `• ${q}`).join("\n")}`,

      );

    }

    return humanizeParentText(sections.filter(Boolean).join("\n\n"));

  }



  sections.push(

    warmTone(response.emotional_interpretation),

    warmTone(response.behaviour_explanation),

  );



  if (!deferAdvice && !repeatAdvice && response.suggested_response?.trim()) {

    sections.push(`Something you could try\n"${warmTone(response.suggested_response)}"`);

  } else if (repeatAdvice && !deferAdvice) {

    sections.push(

      `Building on what we discussed\nWhat part still feels stuck — I'd like to understand more before suggesting again.`,

    );

  }



  if (response.things_not_to_say.length && rhythm !== "brief" && !deferAdvice) {

    sections.push(`Phrases to avoid\n${response.things_not_to_say.map((t) => `• ${t}`).join("\n")}`);

  }



  if (rhythm !== "brief" && !deferAdvice && response.tomorrow_plan) {

    sections.push(warmTone(`A gentle next step\n${response.tomorrow_plan}`));

  }



  if (rhythm === "detailed" && !deferAdvice && response.long_term_recommendation) {

    sections.push(warmTone(`Looking ahead\n${response.long_term_recommendation}`));

  }



  if (enrichment?.boundaryNote) {

    sections.push(warmTone(enrichment.boundaryNote));

  }



  if (needsProfessionalHelp(parentMessage)) {

    sections.push(

      `If safety feels at risk\nPlease contact your GP, paediatrician, or local crisis support. You do not have to carry this alone.`,

    );

  }



  const nextStep = buildNextStepOffer(mode, context, parentMessage);

  if (nextStep && rhythm !== "brief" && !deferAdvice) {

    sections.push(`One thought for you\n${nextStep}`);

  }



  const max = deferAdvice ? 3 : rhythmMaxSections(rhythm);

  let result = sections.filter(Boolean).slice(0, max).join("\n\n");

  if (enrichment?.microMoment) {
    result = `${result}\n\n${enrichment.microMoment}`;
  }

  return humanizeParentText(result);

}

