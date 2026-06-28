import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { ConversationEngineResult } from "@/lib/conversation-engine";

export function buildUrgentSafetyResponse(
  context: ChildContext,
  engine: ConversationEngineResult,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;

  return {
    likely_trigger: "Safety concern requiring prompt attention.",
    behaviour_explanation:
      engine.priority === "urgent"
        ? "When something affects eating, drinking, or safety, it's important to take it seriously and get medical guidance."
        : "When behaviour puts anyone at risk, calm and safety come first.",
    emotional_interpretation:
      "That sounds worrying — you're right to reach out about this.",
    suggested_response:
      "Please contact your GP, NHS 111, or your usual medical team today for guidance. You do not have to wait this out alone.",
    things_not_to_say: ["Just wait and see.", "You're overreacting."],
    tomorrow_plan: "Focus on safety and hydration/nutrition with professional guidance.",
    long_term_recommendation: `Once immediate concerns are addressed, we can think together about what helps ${name} day to day.`,
    confidence_level: 0.9,
    follow_up_questions: [],
  };
}
