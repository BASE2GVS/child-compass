import type { ParentNeed } from "@/lib/conversation/parent-need";

export type ConversationStyle = {
  need: ParentNeed;
  includeAdvice: boolean;
  includeAvoidPhrases: boolean;
  includeProfessionalHelp: boolean;
  includeFollowUp: boolean;
  includeNextStep: boolean;
  includeLongTerm: boolean;
  questionsFirst: boolean;
  maxParagraphs: number;
};

export function selectConversationStyle(
  need: ParentNeed,
  options?: { lowConfidence?: boolean; repeatAdvice?: boolean },
): ConversationStyle {
  const lowConfidence = options?.lowConfidence ?? false;
  const repeatAdvice = options?.repeatAdvice ?? false;

  switch (need) {
    case "presence_only":
      return {
        need,
        includeAdvice: false,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: false,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: false,
        maxParagraphs: 2,
      };
    case "being_heard":
      return {
        need,
        includeAdvice: false,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: true,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: false,
        maxParagraphs: 3,
      };
    case "emotional_support":
      return {
        need,
        includeAdvice: false,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: true,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: false,
        maxParagraphs: 3,
      };
    case "celebration":
      return {
        need,
        includeAdvice: false,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: false,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: false,
        maxParagraphs: 3,
      };
    case "preparation":
      return {
        need,
        includeAdvice: true,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: false,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: lowConfidence,
        maxParagraphs: 4,
      };
    case "new_ideas":
      return {
        need,
        includeAdvice: !repeatAdvice,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: true,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: lowConfidence,
        maxParagraphs: 4,
      };
    case "problem_solving":
    default:
      return {
        need,
        includeAdvice: !repeatAdvice,
        includeAvoidPhrases: false,
        includeProfessionalHelp: false,
        includeFollowUp: lowConfidence,
        includeNextStep: false,
        includeLongTerm: false,
        questionsFirst: lowConfidence,
        maxParagraphs: 5,
      };
  }
}
