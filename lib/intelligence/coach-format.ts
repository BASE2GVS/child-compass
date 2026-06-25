import type { DebriefResponse } from "@/lib/types/database";
import { confidenceBand, confidenceLabel, explainConfidence } from "@/lib/intelligence/confidence";

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
  memoryReference: string | null,
  parentMessage: string,
): string {
  const band = confidenceBand(response.confidence_level);
  const confidenceExplanation = explainConfidence(response.confidence_level, [
    memoryReference ? "your family's previous experiences inform this guidance" : "based on today's context and profile",
    `${confidenceLabel(band).toLowerCase()} from available check-ins and patterns`,
  ]);

  const sections = [
    `Understanding\n${response.emotional_interpretation}`,
    `Why this may be happening\n${response.behaviour_explanation}`,
    memoryReference ? `From your family's history\n${memoryReference}` : null,
    `Suggested wording\n"${response.suggested_response}"`,
    `What to avoid saying\n${response.things_not_to_say.map((t) => `• ${t}`).join("\n")}`,
    `Practical next step\n${response.tomorrow_plan}`,
    `Looking ahead\n${response.long_term_recommendation}`,
    `Confidence\n${confidenceExplanation}`,
  ];

  if (needsProfessionalHelp(parentMessage)) {
    sections.push(
      `When to seek professional help\nIf anyone's safety feels at risk, or behaviours are escalating beyond what feels manageable at home, please contact your GP, paediatrician, or local crisis support. You do not have to carry this alone.`,
    );
  } else {
    sections.push(
      `When to seek professional help\nIf patterns feel persistent, significantly affecting daily life, or you are worried about safety, a trusted professional can help you interpret what you are seeing. Reaching out is a sign of care, not failure.`,
    );
  }

  if (response.follow_up_questions.length) {
    sections.push(`Gentle follow-up questions\n${response.follow_up_questions.map((q) => `• ${q}`).join("\n")}`);
  }

  return sections.filter(Boolean).join("\n\n");
}
