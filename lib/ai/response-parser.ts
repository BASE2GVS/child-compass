import type { DebriefResponse } from "@/lib/types/database";

export function parseDebriefResponse(raw: string): DebriefResponse | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<DebriefResponse>;
    if (!parsed.likely_trigger || !parsed.behaviour_explanation) return null;

    return {
      likely_trigger: String(parsed.likely_trigger),
      behaviour_explanation: String(parsed.behaviour_explanation),
      emotional_interpretation: String(
        parsed.emotional_interpretation || "Your child was likely communicating an unmet need through their behaviour.",
      ),
      suggested_response: String(parsed.suggested_response || "Lower demands and offer calm co-regulation."),
      things_not_to_say: Array.isArray(parsed.things_not_to_say)
        ? parsed.things_not_to_say.map(String)
        : ["Stop being difficult.", "Everyone else manages fine."],
      tomorrow_plan: String(parsed.tomorrow_plan || "Prepare the environment calmly and reduce morning demands."),
      long_term_recommendation: String(
        parsed.long_term_recommendation ||
          "Track patterns over time with daily check-ins to identify triggers and what helps.",
      ),
      confidence_level:
        typeof parsed.confidence_level === "number"
          ? Math.min(1, Math.max(0, parsed.confidence_level))
          : 0.75,
      follow_up_questions: Array.isArray(parsed.follow_up_questions)
        ? parsed.follow_up_questions.map(String)
        : ["How did they sleep last night?", "What helped even a little today?"],
    };
  } catch {
    return null;
  }
}

export function parseInsightResponse(raw: string): {
  title: string;
  content: string;
  confidence: number;
  insight_type: string;
} | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    if (!parsed.title || !parsed.content) return null;
    return {
      title: String(parsed.title),
      content: String(parsed.content),
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0.7,
      insight_type: String(parsed.insight_type || "daily"),
    };
  } catch {
    return null;
  }
}

export function parseWeeklySummary(raw: string): Record<string, unknown> | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}
