import type { ParentMood } from "@/lib/companion/parent-checkin";
import { detectEmotionalTone } from "@/lib/companion/respect-emotions";
import type { ParentNeed } from "@/lib/conversation/parent-need";

export type ParentFeeling =
  | "worried"
  | "guilty"
  | "exhausted"
  | "confused"
  | "proud"
  | "hopeful"
  | "frustrated"
  | "heartbroken"
  | "overwhelmed"
  | "lonely"
  | "upset";

export type ParentFirstNeed =
  | "comfort"
  | "encouragement"
  | "perspective"
  | "curiosity"
  | "planning"
  | "celebration"
  | "presence";

export type ParentStory = {
  whatHappened: string | null;
  parentFeeling: ParentFeeling;
  firstNeed: ParentFirstNeed;
  parentIsFocus: boolean;
  acknowledgment: string;
  curiosityTransition: string | null;
};

const BANNED_ACK_PHRASES = [
  "i know exactly how you feel",
  "i totally understand",
  "that must be devastating",
  "you're amazing",
  "superhero",
];

const CURIOSITY_TRANSITIONS = [
  "Before we think about what might help, can I ask something.",
  "I'd like to understand one piece first.",
  "Let me ask one thing so I don't guess wrong.",
];

function contains(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

function pickFrom<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

function childMentioned(message: string, childName: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes(childName.toLowerCase()) || /\b(she|he|they)\b/.test(lower);
}

export function inferWhatHappened(message: string, childName: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  const parentOnly =
    /^(i'?m|i am|i feel|i'm so|i just|i can't|i need)/i.test(trimmed) &&
    !childMentioned(trimmed, childName);

  if (parentOnly) return "Parent sharing their own emotional experience";

  if (trimmed.length <= 120) return trimmed;

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim();
  return firstSentence || trimmed.slice(0, 100);
}

export function inferParentFeeling(
  message: string,
  parentNeed: ParentNeed,
  parentMood?: ParentMood | null,
): ParentFeeling {
  const lower = message.toLowerCase();
  const tone = detectEmotionalTone(message);

  if (parentMood === "exhausted" || contains(lower, ["exhausted", "so tired", "burnt out", "burned out"])) {
    return "exhausted";
  }
  if (tone === "guilt" || contains(lower, ["guilty", "my fault", "failing", "bad parent"])) return "guilty";
  if (tone === "grief" || contains(lower, ["heartbroken", "grief", "loss"])) return "heartbroken";
  if (tone === "fear" || contains(lower, ["worried", "anxious", "scared", "what if"])) return "worried";
  if (tone === "anger" || contains(lower, ["frustrated", "so angry", "furious"])) return "frustrated";
  if (tone === "overwhelm" || contains(lower, ["overwhelmed", "can't cope", "falling apart"])) {
    return "overwhelmed";
  }
  if (contains(lower, ["nobody understands", "alone", "lonely", "no one"])) return "lonely";
  if (contains(lower, ["confused", "don't understand", "don't know why", "lost"])) return "confused";
  if (parentNeed === "celebration" || contains(lower, ["proud", "amazing day", "fantastic", "great day"])) {
    return "proud";
  }
  if (contains(lower, ["hopeful", "better today", "recovered", "calmer"])) return "hopeful";
  if (contains(lower, ["upset", "so upset", "crying", "hurt"])) return "upset";
  if (parentNeed === "new_ideas" || contains(lower, ["tried everything", "nothing works"])) {
    return "frustrated";
  }
  if (/scream|meltdown|hour|refus|stole|hit|disaster/.test(lower)) return "exhausted";

  if (parentNeed === "emotional_support" || parentNeed === "being_heard") return "overwhelmed";
  if (parentNeed === "preparation") return "worried";

  return "worried";
}

export function inferParentFirstNeed(
  feeling: ParentFeeling,
  parentNeed: ParentNeed,
  willBeCurious: boolean,
): ParentFirstNeed {
  if (parentNeed === "presence_only" || parentNeed === "being_heard") return "presence";
  if (parentNeed === "celebration") return "celebration";
  if (parentNeed === "emotional_support") return "comfort";
  if (parentNeed === "preparation") return "planning";
  if (willBeCurious || parentNeed === "problem_solving") return "curiosity";
  if (parentNeed === "new_ideas") return "encouragement";
  if (feeling === "confused") return "perspective";
  if (feeling === "guilty" || feeling === "heartbroken") return "comfort";
  return "perspective";
}

export function isParentEmotionalFocus(message: string, childName: string): boolean {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  if (contains(lower, ["i'm so upset", "i am so upset", "i feel so", "i'm crying", "i am crying"])) {
    return true;
  }
  if (/^i'?m /i.test(trimmed) && contains(lower, ["upset", "sad", "broken", "done", "lost"])) {
    return !childMentioned(trimmed, childName) || lower.indexOf("i") < lower.indexOf(childName.toLowerCase());
  }
  if (contains(lower, ["just need to vent", "just vent", "need to be heard", "nobody understands"])) {
    return true;
  }

  return false;
}

function buildAcknowledgmentLines(
  message: string,
  childName: string,
  feeling: ParentFeeling,
  parentNeed: ParentNeed,
): string[] {
  const lower = message.toLowerCase();

  if (contains(lower, ["just need to vent", "just vent", "just listen", "need to be heard"])) {
    return [
      "I'm listening.",
      "You don't have to sort anything out right now.",
    ];
  }

  if (parentNeed === "celebration" || feeling === "proud" || feeling === "hopeful") {
    if (contains(lower, ["amazing", "fantastic", "great day", "best day"])) {
      return [
        "I smiled reading that.",
        "Days like this matter, especially after the harder ones.",
      ];
    }
    return [
      "That's wonderful to hear.",
      "These moments are worth noticing.",
    ];
  }

  if (contains(lower, ["tried everything", "nothing works", "out of ideas"])) {
    return ["I can hear how much effort you've already put into this."];
  }

  if (/stole|stealing|took from/.test(lower) && /sister|brother|sibling/.test(lower)) {
    return [
      "That sounds really hard, especially when you're trying to look after both children at the same time.",
    ];
  }

  if (/scream|meltdown|shout/.test(lower) && /hour|hours|all morning|all day|all evening/.test(lower)) {
    return [
      "That sounds exhausting.",
      "An hour can feel incredibly long when you're trying to help your child.",
    ];
  }

  if (/scream|meltdown|tantrum/.test(lower)) {
    return [
      "That sounds exhausting.",
      "Those moments can leave you completely drained.",
    ];
  }

  if (feeling === "guilty") {
    return [
      "The guilt you're carrying sounds heavy — and it tells me how much you care.",
    ];
  }

  if (feeling === "lonely") {
    return [
      "That sounds lonely.",
      "You shouldn't have to carry this feeling on your own.",
    ];
  }

  if (feeling === "heartbroken") {
    return [
      "That sounds heartbreaking.",
      "There's no rush to make sense of it here.",
    ];
  }

  if (feeling === "exhausted" || feeling === "overwhelmed") {
    return [
      "That sounds exhausting.",
      "You're carrying a lot right now.",
    ];
  }

  if (feeling === "frustrated") {
    return [
      "That sounds incredibly frustrating.",
      "Especially when you've been trying so hard.",
    ];
  }

  if (feeling === "confused") {
    return [
      "That sounds confusing.",
      "It's okay not to have it sorted in your head yet.",
    ];
  }

  if (feeling === "worried" || feeling === "upset") {
    if (isParentEmotionalFocus(message, childName)) {
      return [
        "I hear how upset you are.",
        "Let's stay with you for a moment.",
      ];
    }
    return [
      "That sounds worrying.",
      "It makes sense that this is weighing on you.",
    ];
  }

  if (parentNeed === "emotional_support" || parentNeed === "being_heard") {
    return [
      "That sounds really hard.",
      "I'm listening.",
    ];
  }

  return [
    "That sounds really difficult.",
    "You're dealing with a lot.",
  ];
}

export function buildEmotionalAcknowledgment(
  message: string,
  childName: string,
  feeling: ParentFeeling,
  parentNeed: ParentNeed,
): string {
  const lines = buildAcknowledgmentLines(message, childName, feeling, parentNeed);
  const ack = lines.join("\n\n");

  for (const banned of BANNED_ACK_PHRASES) {
    if (ack.toLowerCase().includes(banned)) {
      return "That sounds really difficult.";
    }
  }

  return ack;
}

export function analyzeParentStory(
  message: string,
  options: {
    parentNeed: ParentNeed;
    parentMood?: ParentMood | null;
    childName: string;
    willBeCurious?: boolean;
  },
): ParentStory {
  const { parentNeed, parentMood, childName, willBeCurious = false } = options;
  const parentFeeling = inferParentFeeling(message, parentNeed, parentMood);
  const firstNeed = inferParentFirstNeed(parentFeeling, parentNeed, willBeCurious);
  const parentIsFocus = isParentEmotionalFocus(message, childName);
  const acknowledgment = buildEmotionalAcknowledgment(message, childName, parentFeeling, parentNeed);
  const curiosityTransition =
    willBeCurious && firstNeed === "curiosity"
      ? pickFrom(CURIOSITY_TRANSITIONS, message + childName)
      : null;

  return {
    whatHappened: inferWhatHappened(message, childName),
    parentFeeling,
    firstNeed,
    parentIsFocus,
    acknowledgment,
    curiosityTransition,
  };
}

export function acknowledgmentAlreadyPresent(text: string, acknowledgment: string): boolean {
  if (!acknowledgment || !text) return false;
  const firstLine = acknowledgment.split("\n\n")[0]?.trim().slice(0, 40);
  return firstLine.length > 10 && text.includes(firstLine.slice(0, 20));
}

export function stripChildFirstAnalysis(text: string, childName: string): string {
  if (!text?.trim()) return "";
  const lower = text.toLowerCase();
  const nameLower = childName.toLowerCase();

  if (lower.startsWith(nameLower) || lower.startsWith("for " + nameLower)) {
    return "";
  }
  if (/^(this might|children with|autism|pda|sensory|demand avoid)/i.test(text.trim())) {
    return "";
  }

  return text;
}
