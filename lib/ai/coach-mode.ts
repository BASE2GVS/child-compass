/**
 * Conversation classification — parents never select these modes.
 * Each mode selects a reasoning path automatically.
 */

export type CoachMode =
  | "behaviour_reflection"
  | "planning"
  | "school"
  | "health"
  | "daily_emotions"
  | "report_generation"
  | "product_help"
  | "general_knowledge"
  | "navigation"
  | "emergency"
  | "parent_support"
  | "coaching";

const EMERGENCY_SIGNALS = [
  "help me now",
  "right now",
  "emergency",
  "unsafe",
  "self-harm",
  "hurt themselves",
  "violent",
  "crisis",
];

const REFLECTION_SIGNALS = [
  "happened",
  "meltdown",
  "explain what",
  "what went wrong",
  "refused",
  "wouldn't",
  "would not",
  "had a",
  "just had",
  "today was",
  "this morning",
  "this afternoon",
  "after school",
  "make sense of",
  "understand why",
  "why did",
  "help me understand",
];

const PLANNING_SIGNALS = [
  "prepare for",
  "plan for",
  "tomorrow",
  "this weekend",
  "birthday party",
  "school trip",
  "appointment",
  "what should i do",
];

const SCHOOL_SIGNALS = ["school", "teacher", "homework", "classroom", "refusal", "refused school"];
const HEALTH_SIGNALS = ["doctor", "medication", "therapy", "appointment", "sick", "health", "paediatrician"];
const EMOTION_SIGNALS = ["feeling", "mood", "anxious", "worried", "sad", "overwhelmed", "exhausted"];
const REPORT_SIGNALS = ["report", "summary", "export", "share with", "professional"];
const PRODUCT_TRIGGER_PHRASES = [
  "what is",
  "what's",
  "where is",
  "where do i",
  "what does",
  "how do i",
  "why should i",
];
const PRODUCT_ONLY_PHRASES = [
  "this button",
  "this page",
  "this icon",
  "child compass",
];
const PRODUCT_HELP_SUBJECTS = [
  "check-in",
  "check in",
  "checkin",
  "timeline",
  "document",
  "documents",
  "passport",
  "pda passport",
  "settings",
  "report",
  "teacher guide",
  "compass",
  "dashboard",
  "login",
  "sign in",
  "sign out",
  "subscription",
  "payment",
  "export",
  "share",
  "invite",
  "feature",
  "button",
  "page",
  "icon",
  "navigate",
  "open",
  "app",
  "child compass",
  "documents hub",
  "family settings",
  "today",
];

/** Parenting topics — "how do I handle X" is coaching, not app help */
const PARENTING_CONTEXT_SIGNALS = [
  "morning",
  "transition",
  "meltdown",
  "homework",
  "school",
  "bedtime",
  "anxious",
  "refused",
  "behaviour",
  "behavior",
  "tantrum",
  "sensory",
  "overwhelmed",
  "sleep",
  "party",
  "shoes",
  "diagnosis",
  "defiant",
  "naughty",
  "my child",
  "my son",
  "my daughter",
  "he won't",
  "she won't",
  "they won't",
];
const APP_NAVIGATION_TERMS = [
  "settings",
  "timeline",
  "passport",
  "documents",
  "document",
  "check-in",
  "check-ins",
  "checkin",
  "checkins",
  "health",
  "tracker",
  "therapy",
  "school",
  "dashboard",
  "profile",
  "today",
  "reports",
  "report",
  "teacher guide",
  "teacher-guide",
  "documents hub",
  "documents-hub",
  "my child",
  "compass",
  "school hub",
  "school-hub",
  "home",
];
const NAVIGATION_SIGNALS = ["take me to", "go to", "show me", "open", "navigate to"];
const PARENT_SIGNALS = [
  "i feel",
  "i'm exhausted",
  "i am exhausted",
  "i'm worried",
  "i am worried",
  "just need to talk",
  "about me",
  "as a parent",
  "i can't cope",
  "i'm struggling",
  "burned out",
  "burnt out",
];

function containsAny(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function extractAppNavigationTarget(message: string): string | null {
  const lower = message.toLowerCase().trim();
  const match = lower.match(/\b(?:take me to|go to|show me|open|navigate to)\s+(?:the\s+)?([a-z0-9-]+(?:\s+[a-z0-9-]+)*)/i);
  if (!match) return null;

  const target = match[1].trim().replace(/[.?!,;:]+$/g, "").replace(/^the\s+/i, "");
  if (!target) return null;

  const remainder = lower.slice(match.index! + match[0].length).trim();
  if (remainder && !/^[.?!,;:]+$/.test(remainder)) {
    return null;
  }

  return target;
}

function hasExactAppNavigationTarget(message: string): boolean {
  const target = extractAppNavigationTarget(message);
  if (!target) return false;

  return APP_NAVIGATION_TERMS.includes(target);
}

import type { ParentMood } from "@/lib/companion/parent-checkin";

export function detectCoachMode(
  message: string,
  options?: { preferReflection?: boolean; parentMood?: ParentMood | null },
): CoachMode {
  const lower = message.toLowerCase().trim();

  if (containsAny(lower, EMERGENCY_SIGNALS)) return "emergency";
  if (options?.preferReflection) return "behaviour_reflection";

  const hasNavigationSignal = containsAny(lower, NAVIGATION_SIGNALS);
  const hasAppNavigationTarget = hasExactAppNavigationTarget(message);
  if (hasNavigationSignal && hasAppNavigationTarget) {
    return "navigation";
  }

  const isProductHelpRequest =
    containsAny(lower, PRODUCT_ONLY_PHRASES) ||
    (containsAny(lower, PRODUCT_TRIGGER_PHRASES) && containsAny(lower, PRODUCT_HELP_SUBJECTS));

  if (isProductHelpRequest && !containsAny(lower, PARENTING_CONTEXT_SIGNALS)) {
    return "product_help";
  }

  if (containsAny(lower, REPORT_SIGNALS)) return "report_generation";
  if (
    containsAny(lower, PARENT_SIGNALS) ||
    options?.parentMood === "exhausted" ||
    options?.parentMood === "worried" ||
    options?.parentMood === "need_to_talk" ||
    options?.parentMood === "difficult"
  ) {
    return "parent_support";
  }
  if (containsAny(lower, PLANNING_SIGNALS)) return "planning";
  if (containsAny(lower, SCHOOL_SIGNALS)) return "school";
  if (containsAny(lower, HEALTH_SIGNALS)) return "health";
  if (containsAny(lower, EMOTION_SIGNALS) && !containsAny(lower, SCHOOL_SIGNALS)) return "daily_emotions";

  const reflectionHits = REFLECTION_SIGNALS.filter((s) => lower.includes(s)).length;
  if (reflectionHits >= 2 || (reflectionHits >= 1 && lower.length > 80)) {
    return "behaviour_reflection";
  }

  if (lower.includes("?") && (lower.includes("pda") || lower.includes("autism") || lower.includes("adhd"))) {
    return "general_knowledge";
  }

  return "coaching";
}

export function modeLabel(mode: CoachMode): string {
  const labels: Record<CoachMode, string> = {
    behaviour_reflection: "Reflection",
    planning: "Planning",
    school: "School",
    health: "Health",
    daily_emotions: "Emotions",
    report_generation: "Reports",
    product_help: "Help",
    general_knowledge: "Knowledge",
    navigation: "Navigation",
    emergency: "Support",
    parent_support: "Parent care",
    coaching: "Coaching",
  };
  return labels[mode];
}

/** @deprecated use behaviour_reflection */
export function isReflectionMode(mode: CoachMode): boolean {
  return mode === "behaviour_reflection";
}
