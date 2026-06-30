import type { FamilyContextIntent } from "@/lib/talk-v2/contracts";

type IntentRule = {
  intent: FamilyContextIntent;
  terms: string[];
};

const INTENT_RULES: IntentRule[] = [
  { intent: "sleep", terms: ["sleep", "bed", "bedtime", "night", "woke", "wake", "tired"] },
  { intent: "anxiety", terms: ["anxious", "anxiety", "worry", "worried", "panic", "afraid"] },
  { intent: "meltdown", terms: ["meltdown", "shutdown", "exploded", "screaming", "aggressive"] },
  { intent: "school", terms: ["school", "teacher", "class", "homework", "attendance", "lesson"] },
  { intent: "eating", terms: ["eat", "eating", "food", "meal", "hungry", "appetite"] },
  { intent: "communication", terms: ["talk", "communication", "words", "speech", "explain", "said"] },
  { intent: "sensory", terms: ["sensory", "noise", "loud", "bright", "texture", "overstimulated"] },
  { intent: "behaviour", terms: ["behaviour", "behavior", "defiant", "refusal", "hitting", "kicking"] },
  { intent: "social", terms: ["friend", "social", "playdate", "party", "peer", "classmate"] },
  { intent: "emotional_regulation", terms: ["regulate", "regulated", "dysregulated", "calm", "overwhelmed"] },
  { intent: "medication", terms: ["medication", "medicine", "dose", "tablet", "side effect", "prescription"] },
  { intent: "routine", terms: ["routine", "transition", "schedule", "predictable", "morning", "evening"] },
  { intent: "parent_wellbeing", terms: ["i am exhausted", "i'm exhausted", "i feel drained", "burnout", "i can't cope", "overwhelmed parent"] },
];

export function detectContextIntents(parentMessage: string): FamilyContextIntent[] {
  const text = parentMessage.toLowerCase();
  const intents: FamilyContextIntent[] = [];

  for (const rule of INTENT_RULES) {
    if (rule.terms.some((term) => text.includes(term))) {
      intents.push(rule.intent);
    }
  }

  if (!intents.length) {
    return ["general_support"];
  }

  // Deterministic order from rule definition, deduped.
  const seen = new Set<FamilyContextIntent>();
  const ordered: FamilyContextIntent[] = [];
  for (const intent of intents) {
    if (seen.has(intent)) continue;
    seen.add(intent);
    ordered.push(intent);
  }

  return ordered;
}
