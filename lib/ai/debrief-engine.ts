import type { ChildContext, DailyCheckin, DebriefResponse } from "@/lib/types/database";
import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import { buildDebriefPrompt, DEBRIEF_SYSTEM } from "@/lib/ai/prompt-builder";
import { parseDebriefResponse } from "@/lib/ai/response-parser";
import { memoryForMessage } from "@/lib/ai/child-context";
import { confidenceFromDataDepth } from "@/lib/intelligence/confidence";
import {
  blendKnowledgeWithFamily,
  retrieveKnowledgeForMessage,
} from "@/lib/knowledge/engine";

const SCHOOL_KEYWORDS = ["school", "refused", "refusal", "morning", "homework", "teacher"];
const SENSORY_KEYWORDS = ["loud", "noise", "bright", "crowded", "overwhelmed", "sensory", "shopping"];
const TRANSITION_KEYWORDS = ["transition", "change", "leave", "stop", "finished"];
const ANXIETY_KEYWORDS = ["anxious", "worried", "scared", "panic", "anxiety"];

function containsAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function buildLocalDebrief(parentMessage: string, context: ChildContext): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const msg = parentMessage.toLowerCase();
  const latestCheckin = context.recentCheckins[0];

  let likelyTrigger =
    "An accumulation of demands or sensory input that exceeded their current capacity.";
  let behaviourExplanation =
    `${name}'s behaviour was likely a protective response from an overwhelmed nervous system — not defiance or choice.`;
  let emotionalInterpretation =
    `Beneath the behaviour, ${name} may have been feeling unsafe, overwhelmed, or unable to communicate their needs in that moment.`;
  let suggestedResponse =
    `Lower demands immediately. Offer two choices ${name} controls. Validate feelings: "This feels really hard right now."`;
  const thingsNotToSay = [
    "Stop being difficult.",
    "Everyone else manages fine.",
    "If you don't go, then…",
  ];
  let tomorrowPlan =
    "Prepare the environment calmly tonight. Review a visual schedule. Reduce morning demands where possible.";
  let longTermRecommendation =
    "Continue daily check-ins to spot patterns between sleep, sensory load, and challenging days.";
  let confidence = 0.72;

  if (latestCheckin) {
    if ((latestCheckin.sleep_quality ?? 3) <= 2) {
      likelyTrigger = "Poor sleep last night may have reduced capacity for demands today.";
      confidence = 0.82;
      tomorrowPlan =
        "Prioritise earlier bedtime tonight. Keep morning routine unhurried and sensory-friendly.";
      longTermRecommendation =
        "Track sleep quality alongside challenging days — poor sleep often predicts school refusal and meltdowns.";
    }
    if ((latestCheckin.anxiety ?? 3) >= 4) {
      emotionalInterpretation = `With anxiety already elevated (${latestCheckin.anxiety}/5), ${name}'s nervous system was likely in a heightened state before today's events.`;
      confidence = Math.max(confidence, 0.78);
    }
  }

  for (const pattern of context.patterns) {
    if (pattern.category === "school" && containsAny(msg, SCHOOL_KEYWORDS)) {
      likelyTrigger = pattern.description;
      confidence = Math.max(confidence, pattern.confidence ?? 0.7);
    }
    if (pattern.category === "sensory" && containsAny(msg, SENSORY_KEYWORDS)) {
      likelyTrigger = pattern.description;
      confidence = Math.max(confidence, pattern.confidence ?? 0.7);
    }
  }

  if (containsAny(msg, SCHOOL_KEYWORDS)) {
    likelyTrigger =
      likelyTrigger ||
      "School-related demand — possibly transition, separation, or accumulated anxiety from the school environment.";
    behaviourExplanation = `School demands can feel threatening when ${name}'s nervous system is already elevated. Refusal is often the only way they can communicate overwhelm.`;
    suggestedResponse =
      "Remove pressure to explain. Sit nearby without demanding eye contact. Offer a regulated activity before revisiting school talk.";
    thingsNotToSay.push("You have to go to school like everyone else.");
    tomorrowPlan =
      "Earlier, calmer wake-up. Sensory breakfast. Visual schedule. Brief teacher heads-up if appropriate.";
  }

  if (containsAny(msg, SENSORY_KEYWORDS)) {
    likelyTrigger = likelyTrigger || "Sensory overload — environment exceeded comfortable processing capacity.";
    behaviourExplanation = `${name}'s brain was receiving more input than it could filter. Meltdown or shutdown is a neurological response, not misbehaviour.`;
    suggestedResponse =
      "Move to a quieter space. Reduce sensory input. Offer deep pressure or a familiar calming object if that helps them.";
    emotionalInterpretation = `${name} was likely in sensory distress — their body was signalling that the environment was too much.`;
  }

  if (containsAny(msg, TRANSITION_KEYWORDS)) {
    likelyTrigger = likelyTrigger || "Transition demand — moving from one state or activity to another without enough preparation.";
    behaviourExplanation = `Transitions require extra executive function. For ${name}, an unexpected or rushed transition can feel like a threat.`;
    suggestedResponse =
      "Use visual timers. Give advance notice. Frame the next step as a choice between two acceptable options.";
  }

  if (containsAny(msg, ANXIETY_KEYWORDS)) {
    likelyTrigger = likelyTrigger || "Elevated anxiety — worry system activated, reducing capacity for demands.";
    behaviourExplanation = `When anxiety is high, ${name}'s body prioritises safety over cooperation. What looks like resistance is often fear.`;
    suggestedResponse =
      "Name the feeling without fixing it immediately. Reduce all non-essential demands for the next hour.";
    emotionalInterpretation = `Fear and worry were likely driving the behaviour — ${name} needed safety, not correction.`;
  }

  if (
    context.child.diagnosis?.includes("PDA") ||
    context.child.support_needs?.some((n) => n.toLowerCase().includes("pda"))
  ) {
    behaviourExplanation += ` With a PDA profile, perceived demands — even gentle ones — can trigger an automatic threat response.`;
    thingsNotToSay.push("Just try your best.");
    suggestedResponse =
      "Use declarative language instead of direct requests. Offer indirect choices. Allow recovery time without discussion.";
    longTermRecommendation =
      "Share the PDA Passport with school and carers. Reduce demand language across all environments consistently.";
  }

  const knownTrigger = context.profile?.known_triggers?.find((t) =>
    msg.includes(t.toLowerCase()),
  );
  if (knownTrigger) {
    likelyTrigger = `Known trigger identified: ${knownTrigger}. This aligns with your child's recorded profile.`;
    confidence = 0.88;
  }

  const followUpQuestions = [
    `How did ${name} sleep last night?`,
    "Were there any unexpected changes today?",
    "What helped even a little, even briefly?",
  ];

  const memoryRef = memoryForMessage(context, parentMessage);
  if (memoryRef) {
    longTermRecommendation = `${memoryRef} ${longTermRecommendation}`;
    confidence = Math.max(confidence, 0.8);
  }

  const knowledgeArticles = retrieveKnowledgeForMessage(parentMessage, context.child.diagnosis || []);
  const blended = blendKnowledgeWithFamily({
    familyObservation: memoryRef,
    articles: knowledgeArticles,
    childName: name,
  });
  if (knowledgeArticles.length) {
    const top = knowledgeArticles[0];
    suggestedResponse = `${top.guidance[0]} ${suggestedResponse}`;
    longTermRecommendation = `${blended.combinedRecommendation} ${longTermRecommendation}`;
    confidence = Math.max(confidence, 0.75);
  }

  const depth = confidenceFromDataDepth({
    checkinCount: context.recentCheckins.length,
    patternCount: context.patterns.length,
    hasTodayCheckin: Boolean(context.recentCheckins[0]),
    memoryCount: context.memoryReferences.length,
  });
  confidence = Math.max(confidence, depth.score * 0.95);

  return {
    likely_trigger: likelyTrigger,
    behaviour_explanation: behaviourExplanation,
    emotional_interpretation: emotionalInterpretation,
    suggested_response: suggestedResponse,
    things_not_to_say: thingsNotToSay,
    tomorrow_plan: tomorrowPlan,
    long_term_recommendation: longTermRecommendation,
    confidence_level: confidence,
    follow_up_questions: followUpQuestions,
  };
}

export async function generateDebriefResponse(
  parentMessage: string,
  context: ChildContext,
): Promise<DebriefResponse> {
  if (isExternalLLMConfigured()) {
    try {
      const provider = getLLMProvider();
      const prompt = buildDebriefPrompt(parentMessage, context);
      const raw = await provider.complete(prompt, { system: DEBRIEF_SYSTEM, temperature: 0.6 });
      const parsed = parseDebriefResponse(raw);
      if (parsed) return parsed;
    } catch {
      // Fall through to local intelligence
    }
  }

  return buildLocalDebrief(parentMessage, context);
}

export function computeRegulationLevel(checkin: {
  mood?: number | null;
  anxiety?: number | null;
  sensory_overload?: number | null;
  demand_tolerance?: number | null;
  energy?: number | null;
}): { level: string; score: number; colour: string } {
  const mood = checkin.mood ?? 3;
  const anxiety = checkin.anxiety ?? 3;
  const sensory = checkin.sensory_overload ?? 3;
  const demand = checkin.demand_tolerance ?? 3;
  const energy = checkin.energy ?? 3;

  const score = Math.round(((mood + (6 - anxiety) + (6 - sensory) + demand + energy) / 25) * 100);

  if (score >= 70) return { level: "Regulated", score, colour: "#14B8A6" };
  if (score >= 45) return { level: "Managing", score, colour: "#F59E0B" };
  return { level: "Elevated", score, colour: "#EF4444" };
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function compareWeeklyRegulation(checkins: DailyCheckin[]): {
  trend: "improving" | "stable" | "declining";
  message: string;
} {
  if (checkins.length < 3) {
    return { trend: "stable", message: "Keep checking in to reveal weekly patterns." };
  }

  const scores = checkins.map((c) => computeRegulationLevel(c).score);
  const firstHalf = scores.slice(Math.floor(scores.length / 2));
  const secondHalf = scores.slice(0, Math.floor(scores.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;

  if (diff >= 8) {
    return { trend: "improving", message: "Regulation has been trending upward this week." };
  }
  if (diff <= -8) {
    return { trend: "declining", message: "Regulation has been lower this week — extra gentleness may help." };
  }
  return { trend: "stable", message: "Regulation has been fairly steady this week." };
}
