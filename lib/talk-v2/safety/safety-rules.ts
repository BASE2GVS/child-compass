import type { FamilyContextSafetyRule } from "@/lib/talk-v2/contracts";

export const TALK_V2_SAFETY_RULES: FamilyContextSafetyRule[] = [
  {
    id: "urgent-self-harm",
    description: "Escalate when a message indicates self-harm or suicidality.",
    triggerExamples: ["self-harm", "suicidal", "wants to die"],
  },
  {
    id: "urgent-violence",
    description: "Escalate when there is immediate violence risk for child or family.",
    triggerExamples: ["violent", "hurt sibling", "unsafe at home"],
  },
  {
    id: "urgent-medical",
    description: "Escalate when urgent medical concerns are described.",
    triggerExamples: ["not eating", "not drinking", "medical emergency"],
  },
];
