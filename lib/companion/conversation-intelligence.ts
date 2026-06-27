import type { ChildContext } from "@/lib/types/database";
import type { CoachMode } from "@/lib/ai/coach-mode";
import { buildCuriousClarification } from "@/lib/companion/curious-companion";
import { shapeWithBeliefs } from "@/lib/companion/family-beliefs";
import {
  invitationForCheckin,
  invitationToShareLearnings,
} from "@/lib/companion/human-language";

export function warmTone(text: string): string {
  return shapeWithBeliefs(
    text
      .replace(/\bYou should\b/g, "You might")
      .replace(/\bYou must\b/g, "It may help to")
      .replace(/\bAlways\b/g, "Often")
      .replace(/\bNever\b/g, "Try not to"),
  );
}

export function buildClarifyingResponse(
  message: string,
  context: ChildContext,
  parentMood?: string | null,
) {
  return buildCuriousClarification(message, context, [], parentMood);
}

/** @deprecated use shouldClarifyBeforeAdvice from curious-companion */
export { needsClarification } from "@/lib/companion/curious-companion";

export function buildNextStepOffer(
  mode: CoachMode,
  context: ChildContext,
  parentMessage: string,
): string | null {
  const name = context.child.nickname || context.child.first_name;
  const lower = parentMessage.toLowerCase();

  if (mode === "behaviour_reflection") {
    return `Would you like me to add today's event to ${name}'s timeline? You can say "yes" in your next message, or visit Track → Timeline.`;
  }

  if (mode === "planning" || lower.includes("tomorrow") || lower.includes("prepare")) {
    return `Would you like to prepare for tomorrow together? Tell me what's coming up and we'll plan gently.`;
  }

  if (mode === "school") {
    return `Would a Teacher Guide help share ${name}'s strategies with school? You'll find it under Documents.`;
  }

  if (mode === "report_generation") {
    return invitationToShareLearnings();
  }

  if (mode === "navigation" || mode === "product_help") {
    return "If you'd like, I can walk you to the right place — just ask about any page or feature.";
  }

  if (!context.recentCheckins[0]?.checkin_date?.startsWith(new Date().toISOString().split("T")[0])) {
    const name = context.child.nickname || context.child.first_name;
    return invitationForCheckin(name);
  }

  if (context.patterns.length >= 2) {
    return `I've noticed a pattern forming for ${name}. Would you like me to explain what I'm seeing?`;
  }

  return `When you're ready, I'm here for the next question — about ${name}, about you, or about tomorrow.`;
}
