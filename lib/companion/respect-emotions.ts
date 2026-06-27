import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import { beliefGuidedPresence } from "@/lib/companion/family-beliefs";

const GUILT_SIGNALS = [
  "my fault",
  "blame myself",
  "bad parent",
  "terrible parent",
  "failed",
  "i'm failing",
  "should have",
  "shouldn't have",
  "ashamed",
  "shame",
  "guilt",
  "guilty",
];

const FEAR_SIGNALS = [
  "afraid",
  "scared",
  "terrified",
  "worried sick",
  "what if",
  "panic",
  "anxiety about",
];

const GRIEF_SIGNALS = ["grief", "grieving", "loss", "mourning", "miss who", "used to be"];

const ANGER_SIGNALS = [
  "so angry",
  "furious",
  "rage",
  "hate this",
  "unfair",
  "i'm mad",
  "makes me so angry",
];

export type EmotionalTone = "guilt" | "fear" | "shame" | "grief" | "anger" | "overwhelm" | null;

export function detectEmotionalTone(message: string): EmotionalTone {
  const lower = message.toLowerCase();
  if (GUILT_SIGNALS.some((s) => lower.includes(s)) || lower.includes("shame")) return "guilt";
  if (GRIEF_SIGNALS.some((s) => lower.includes(s))) return "grief";
  if (ANGER_SIGNALS.some((s) => lower.includes(s))) return "anger";
  if (FEAR_SIGNALS.some((s) => lower.includes(s))) return "fear";
  if (/overwhelm|can't cope|too much|drowning/i.test(lower)) return "overwhelm";
  return null;
}

export function needsEmotionalHolding(message: string): boolean {
  return detectEmotionalTone(message) !== null;
}

export function buildEmotionalHoldingResponse(
  message: string,
  context: ChildContext,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const tone = detectEmotionalTone(message);

  let opening = beliefGuidedPresence("Thank you for trusting me with this.");
  let holding = beliefGuidedPresence(
    "You don't need to have it figured out right now. I'm here with you first.",
  );

  switch (tone) {
    case "guilt":
      opening = beliefGuidedPresence(
        "The guilt you're carrying sounds so heavy — and it tells me how much you care.",
      );
      holding = beliefGuidedPresence(
        "Hard moments don't make you a bad parent. We can explore what happened when you're ready — no rush.",
      );
      break;
    case "fear":
      opening = beliefGuidedPresence("Fear makes sense when someone you love is struggling.");
      holding = beliefGuidedPresence(
        "We don't need to solve everything tonight. Let's stay with what you're feeling for a moment.",
      );
      break;
    case "grief":
      opening = beliefGuidedPresence("Grief and loss land differently for every family — I'm listening.");
      holding = beliefGuidedPresence(
        "There's no timeline for this. I'm here, without trying to fix or explain it away.",
      );
      break;
    case "anger":
      opening = beliefGuidedPresence("Anger often sits on top of exhaustion and worry — it makes sense.");
      holding = beliefGuidedPresence(
        "You don't need to soften what you feel here. We can make sense of it together, slowly.",
      );
      break;
    case "overwhelm":
      opening = beliefGuidedPresence("That sounds completely overwhelming.");
      holding = beliefGuidedPresence(
        "One breath at a time. I'm not going to pile on advice while you're still carrying this.",
      );
      break;
    default:
      break;
  }

  return {
    likely_trigger: "Emotional safety comes before coaching.",
    behaviour_explanation: opening,
    emotional_interpretation: holding,
    suggested_response: beliefGuidedPresence("I'm here."),
    things_not_to_say: [],
    tomorrow_plan: beliefGuidedPresence(
      `When it feels right — about you, about ${name}, or about tomorrow — we can take a gentle next step.`,
    ),
    long_term_recommendation: beliefGuidedPresence(
      "You deserve compassion too, especially on the hardest days.",
    ),
    confidence_level: 0.88,
    follow_up_questions: [],
  };
}
