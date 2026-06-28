import type { MessageIntent } from "@/lib/conversation-engine/understand-message";

export type RetrievalCategory =
  | "profile_triggers"
  | "profile_strategies"
  | "successful_strategies"
  | "sensory"
  | "routine_bath"
  | "routine_sleep"
  | "routine_school"
  | "routine_transition"
  | "recent_checkin"
  | "pattern"
  | "knowledge"
  | "communication_style"
  | "sibling"
  | "recent_win"
  | "insight";

function contains(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

export function determineInformationNeeds(
  message: string,
  intent: MessageIntent,
): RetrievalCategory[] {
  const lower = message.toLowerCase();
  const needs = new Set<RetrievalCategory>();

  if (intent === "urgent_safety" || intent === "presence" || intent === "emotional_support") {
    if (intent === "emotional_support" && contains(lower, ["tired", "exhausted", "sleep"])) {
      needs.add("recent_checkin");
    }
    return [...needs];
  }

  if (intent === "celebration") {
    needs.add("recent_win");
    return [...needs];
  }

  if (intent === "information") {
    return [];
  }

  if (contains(lower, ["bath", "shower", "wash", "water"])) {
    needs.add("sensory");
    needs.add("routine_bath");
    needs.add("profile_strategies");
    needs.add("recent_checkin");
    needs.add("communication_style");
  }

  if (contains(lower, ["sleep", "bedtime", "night", "wake", "tired"])) {
    needs.add("routine_sleep");
    needs.add("recent_checkin");
    needs.add("pattern");
  }

  if (contains(lower, ["school", "teacher", "homework", "classroom", "refus"])) {
    needs.add("routine_school");
    needs.add("profile_triggers");
    needs.add("pattern");
    needs.add("recent_checkin");
  }

  if (contains(lower, ["transition", "leave", "stop", "change", "party", "trip"])) {
    needs.add("routine_transition");
    needs.add("profile_strategies");
    needs.add("successful_strategies");
  }

  if (contains(lower, ["sister", "brother", "sibling", "stole", "hit"])) {
    needs.add("sibling");
    needs.add("profile_triggers");
  }

  if (contains(lower, ["loud", "noise", "sensory", "overwhelmed", "bright", "crowded"])) {
    needs.add("sensory");
    needs.add("profile_triggers");
  }

  if (contains(lower, ["pda", "demand", "control", "defiant", "refuse"])) {
    needs.add("communication_style");
    needs.add("profile_strategies");
  }

  if (intent === "planning") {
    needs.add("profile_strategies");
    needs.add("successful_strategies");
    needs.add("pattern");
  }

  if (intent === "problem_solving" || intent === "reflection") {
    needs.add("profile_triggers");
    needs.add("profile_strategies");
    needs.add("recent_checkin");
    needs.add("pattern");
    needs.add("knowledge");
  }

  if (needs.size === 0) {
    needs.add("profile_strategies");
    needs.add("recent_checkin");
  }

  return [...needs];
}
