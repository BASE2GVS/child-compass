import type { ChildContext, DebriefResponse } from "@/lib/types/database";



const BRIEF_SIGNALS = [

  "i can't cope",

  "i can't do this",

  "so hard",

  "incredibly hard",

  "exhausted",

  "broken",

  "falling apart",

  "just need",

  "nobody understands",

  "i'm done",

  "i give up",

  "crying",

  "cried all day",

  "so angry",

  "furious",

];



export function isBriefMoment(message: string): boolean {

  const lower = message.toLowerCase().trim();

  if (BRIEF_SIGNALS.some((s) => lower.includes(s))) return true;

  if (lower.length < 25 && (lower.includes("hard") || lower.includes("tired"))) return true;

  return false;

}



export function buildBriefResponse(parentMessage: string, context: ChildContext): DebriefResponse {

  const name = context.child.nickname || context.child.first_name;

  const lower = parentMessage.toLowerCase();



  let emotional = "That's a lot to carry.";

  if (lower.includes("glad") || lower.includes("thank") || lower.includes("hope")) {

    emotional = "I'm glad you told me.";

  } else if (lower.includes("exhausted") || lower.includes("tired") || lower.includes("overwhelm")) {

    emotional = "You're carrying a lot. That exhaustion is real.";

  } else if (lower.includes("angry") || lower.includes("furious")) {

    emotional = "Anger makes sense when you're stretched this thin.";

  } else if (lower.includes("cry") || lower.includes("cried")) {

    emotional = "Thank you for letting this out here.";

  } else if (lower.includes("fault") || lower.includes("guilt") || lower.includes("shame")) {

    emotional = "The guilt sounds so heavy — and it shows how much you care.";

  }



  return {

    likely_trigger: "You needed to be heard before anything else.",

    behaviour_explanation: emotional,

    emotional_interpretation: "I'm here. There's no pressure to fix anything right now.",

    suggested_response: "",

    things_not_to_say: [],

    tomorrow_plan: "When you're ready, we can talk — or we can leave it here. Your pace.",

    long_term_recommendation: `Whenever you want to think about ${name} together, I'll be here.`,

    confidence_level: 0.88,

    follow_up_questions: [],

  };

}

