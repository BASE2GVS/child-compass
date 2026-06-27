import type { ChildContext, CoachMessage, DebriefResponse } from "@/lib/types/database";
import { detectCoachMode, type CoachMode } from "@/lib/ai/coach-mode";
import { generateDebriefResponse } from "@/lib/ai/debrief-engine";
import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import { buildCoachPrompt, COACH_SYSTEM } from "@/lib/ai/prompt-builder";
import { parseDebriefResponse } from "@/lib/ai/response-parser";
import { memoryForMessage } from "@/lib/ai/child-context";
import { capConfidenceForEvidence } from "@/lib/companion/intellectual-humility";
import { confidenceFromDataDepth } from "@/lib/intelligence/confidence";
import {
  blendKnowledgeWithFamily,
  retrieveKnowledgeForMessage,
} from "@/lib/knowledge/engine";
import { buildProductHelpResponse } from "@/lib/companion/app-guide";
import {
  applyCuriousEnrichment,
  buildCuriousClarification,
  buildCuriousEnrichment,
  shouldClarifyBeforeAdvice,
} from "@/lib/companion/curious-companion";
import { isBriefMoment } from "@/lib/companion/brief-moments";
import {
  buildEmotionalHoldingResponse,
  needsEmotionalHolding,
} from "@/lib/companion/respect-emotions";
import {
  buildPresenceResponse,
  needsPresenceFirst,
} from "@/lib/companion/emotional-presence";
import { parentMoodForPrompt, type ParentMood } from "@/lib/companion/parent-checkin";
import type {
  CoachMessageTurn,
  CuriousEnrichment,
} from "@/lib/companion/curious-companion";
import { isReflectionMode } from "@/lib/ai/coach-mode";

export type CoachPipelineTrace = {
  questionReceived: boolean;
  conversationHistoryFound: number;
  conversationHistoryInjected: boolean;
  childFound: boolean;
  profileFound: boolean;
  checkinsFound: number;
  checkinsInjected: boolean;
  patternsFound: number;
  patternsInjected: boolean;
  memoriesInjected: number;
  memoriesUsed: boolean;
  graphInsightsInjected: number;
  graphUsed: boolean;
  timelineEventsFound: number;
  timelineInjected: boolean;
  knowledgeArticles: number;
  knowledgeInjected: boolean;
  triggersInProfile: number;
  strategiesInProfile: number;
  coachMode: CoachMode;
  debriefEngineUsed: boolean;
  usedLlm: boolean;
  responseFormatted: boolean;
  persisted: boolean;
};

type ConversationTurn = Pick<CoachMessage, "role" | "content">;

const SCHOOL_KEYWORDS = ["school", "refused", "refusal", "morning", "homework", "teacher"];
const SENSORY_KEYWORDS = ["loud", "noise", "bright", "crowded", "overwhelmed", "sensory", "shopping"];
const TRANSITION_KEYWORDS = ["transition", "change", "leave", "stop", "finished"];
const ANXIETY_KEYWORDS = ["anxious", "worried", "scared", "panic", "anxiety"];
const HOMEWORK_KEYWORDS = ["homework", "worksheet", "assignment", "study"];
const PARTY_KEYWORDS = ["birthday", "party", "celebration", "event"];
const CLOTHING_KEYWORDS = ["shoes", "clothes", "dress", "uniform", "wear"];
const VISIT_KEYWORDS = ["grandparent", "visitor", "guest", "visit", "relative"];
const SLEEP_KEYWORDS = ["sleep", "bedtime", "tired", "night", "wake"];

function containsAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function pickVariant<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

function formatCheckinLine(c: ChildContext["recentCheckins"][0]): string {
  return `${c.checkin_date}: sleep ${c.sleep_quality ?? "?"}/5, mood ${c.mood ?? "?"}/5, anxiety ${c.anxiety ?? "?"}/5, school ${c.school_rating ?? "?"}/5`;
}

function summarizeConversation(history: ConversationTurn[]): string | null {
  if (history.length < 2) return null;
  const recent = history.slice(-4);
  const topics = recent
    .filter((m) => m.role === "parent")
    .map((m) => m.content.slice(0, 80))
    .join("; ");
  return topics ? `Earlier in this conversation you asked about: ${topics}` : null;
}

function followUpFromHistory(
  history: ConversationTurn[],
  name: string,
): string[] {
  const asked = history.map((m) => m.content.toLowerCase()).join(" ");
  const questions: string[] = [];

  if (!asked.includes("sleep")) {
    questions.push(`How did ${name} sleep last night?`);
  }
  if (!asked.includes("help") && !asked.includes("worked")) {
    questions.push("What helped even a little today — even briefly?");
  }
  if (!asked.includes("change") && !asked.includes("unexpected")) {
    questions.push("Were there any unexpected changes to the routine?");
  }
  if (questions.length < 2) {
    questions.push(`What feels most urgent about ${name}'s situation right now?`);
  }
  return questions.slice(0, 3);
}

function buildLocalCoachResponse(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: ConversationTurn[],
  mode: CoachMode = "coaching",
  parentMoodNote: string | null = null,
): DebriefResponse {
  const name = context.child.nickname || context.child.first_name;
  const msg = parentMessage.toLowerCase();
  const latestCheckin = context.recentCheckins[0];
  const convoSummary = summarizeConversation(conversationHistory);

  if (mode === "parent_support") {
    const parentOpening = parentMoodNote || "You matter in this story too.";
    return {
      likely_trigger: "Parent capacity is low — that's information, not failure.",
      behaviour_explanation: `${parentOpening} When you're depleted, everything feels harder — including supporting ${name}.`,
      emotional_interpretation:
        convoSummary ||
        "Parenting a neurodivergent child asks a lot of you. Feeling stretched doesn't mean you're doing it wrong.",
      suggested_response:
        "Be as gentle with yourself as you would with a friend. Lower today's bar. One small thing is enough.",
      things_not_to_say: ["You should be stronger.", "Other parents manage."],
      tomorrow_plan: "Rest if you can tonight. Tomorrow can be simpler.",
      long_term_recommendation: `When you're ready, we can think about ${name} together — no rush.`,
      confidence_level: 0.78,
      follow_up_questions: [
        "What felt heaviest today — for you, or with your child?",
        "Is there one thing I could help lighten right now?",
      ],
    };
  }

  const historyOpenerParts: string[] = [];

  if (context.memoryReferences.length) {
    historyOpenerParts.push(...context.memoryReferences.slice(0, 3));
  }

  if (latestCheckin) {
    historyOpenerParts.push(
      `On ${latestCheckin.checkin_date}, ${name}'s check-in showed mood ${latestCheckin.mood ?? "?"}/5, anxiety ${latestCheckin.anxiety ?? "?"}/5, and sleep ${latestCheckin.sleep_quality ?? "?"}/5.`,
    );
    if (latestCheckin.wins?.length) {
      historyOpenerParts.push(`Recent win: "${latestCheckin.wins[0]}".`);
    }
    if (latestCheckin.challenges?.length) {
      historyOpenerParts.push(`Recent challenge: "${latestCheckin.challenges[0]}".`);
    }
  }

  for (const p of context.patterns.slice(0, 2)) {
    historyOpenerParts.push(`Pattern we've noticed for ${name}: ${p.description}`);
  }

  for (const insight of (context.graphInsights || []).slice(0, 2)) {
    historyOpenerParts.push(`From ${name}'s data: ${insight}`);
  }

  for (const event of context.recentTimeline.slice(0, 2)) {
    historyOpenerParts.push(`Timeline (${event.date.split("T")[0]}): ${event.title}${event.description ? ` — ${event.description}` : ""}.`);
  }

  if (context.profile?.known_triggers?.length) {
    historyOpenerParts.push(`Known triggers for ${name}: ${context.profile.known_triggers.join(", ")}.`);
  }

  if (context.profile?.calming_strategies?.length) {
    historyOpenerParts.push(`Strategies that have helped ${name}: ${context.profile.calming_strategies.slice(0, 3).join(", ")}.`);
  }

  const historyOpener =
    historyOpenerParts.length > 0
      ? historyOpenerParts.join(" ")
      : `We're still building ${name}'s story — daily check-ins will help Child Compass personalise guidance.`;

  let likelyTrigger = "An accumulation of demands or sensory input that exceeded their current capacity.";
  let behaviourExplanation = `${name}'s behaviour could be a protective response — not necessarily defiance. ${historyOpener}`;
  let emotionalInterpretation = convoSummary
    ? `${convoSummary} Right now, beneath today's situation, ${name} may be communicating an unmet need.`
    : `Beneath today's situation, ${name} may be feeling overwhelmed or unable to communicate their needs.`;
  let suggestedResponse = context.profile?.calming_strategies?.[0]
    ? `Try what has helped before: ${context.profile.calming_strategies[0]}. Also offer two choices ${name} controls.`
    : `Lower demands immediately. Offer two choices ${name} controls. Validate: "This feels really hard right now."`;
  let adviceTailored = false;
  const thingsNotToSay = ["Stop being difficult.", "Everyone else manages fine.", "If you don't go, then…"];
  let tomorrowPlan = "Prepare the environment calmly tonight. Review a visual schedule if that helps your family.";
  let longTermRecommendation = `Continue daily check-ins for ${name} to strengthen pattern recognition.`;
  let confidence = 0.65;

  if (latestCheckin) {
    if ((latestCheckin.sleep_quality ?? 3) <= 2) {
      likelyTrigger = `Poor sleep on ${latestCheckin.checkin_date} may have reduced ${name}'s capacity today.`;
      tomorrowPlan = "Prioritise an earlier, calm bedtime tonight. Keep tomorrow's morning unhurried.";
      confidence = 0.82;
    }
    if ((latestCheckin.anxiety ?? 3) >= 4) {
      emotionalInterpretation = `${name}'s anxiety was already elevated (${latestCheckin.anxiety}/5 on ${latestCheckin.checkin_date}) — today's events landed on an already heightened nervous system.`;
      confidence = Math.max(confidence, 0.78);
    }
    if ((latestCheckin.sensory_overload ?? 3) >= 4) {
      likelyTrigger = `Sensory overload was high (${latestCheckin.sensory_overload}/5) on ${latestCheckin.checkin_date} — today's environment may have been too much.`;
      confidence = Math.max(confidence, 0.8);
    }
  }

  for (const pattern of context.patterns) {
    if (pattern.category === "school" && containsAny(msg, SCHOOL_KEYWORDS)) {
      likelyTrigger = `${name}: ${pattern.description}`;
      confidence = Math.max(confidence, pattern.confidence ?? 0.75);
    }
    if (pattern.category === "sensory" && containsAny(msg, SENSORY_KEYWORDS)) {
      likelyTrigger = `${name}: ${pattern.description}`;
      confidence = Math.max(confidence, pattern.confidence ?? 0.75);
    }
  }

  if (containsAny(msg, SCHOOL_KEYWORDS)) {
    behaviourExplanation = `School demands can feel threatening when ${name}'s nervous system is elevated. ${historyOpener}`;
    suggestedResponse = pickVariant(
      [
        "Remove pressure to explain. Sit nearby without demanding eye contact. Offer a regulated activity before revisiting school talk.",
        `Keep school talk indirect for now — "I wonder what felt hardest about school today" often lands better than questions for ${name}.`,
        `Match ${name}'s pace. A quiet shared activity first can make school feel less like a demand.`,
      ],
      parentMessage + "school",
    );
    adviceTailored = true;
    thingsNotToSay.push("You have to go to school like everyone else.");
  }

  if (containsAny(msg, SENSORY_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Sensory overload — the environment exceeded ${name}'s comfortable processing capacity.`;
    behaviourExplanation = `${name}'s brain was filtering more input than it could handle. ${historyOpener}`;
    suggestedResponse = context.profile?.calming_strategies?.[0]
      ? pickVariant(
          [
            `Move to a quieter space. ${context.profile.calming_strategies[0]} has helped before.`,
            `Reduce input first — dim lights, lower voices. Then ${context.profile.calming_strategies[0]}.`,
          ],
          parentMessage + "sensory",
        )
      : pickVariant(
          [
            "Move to a quieter space. Reduce sensory input. Offer deep pressure if that helps them.",
            "Step outside or to a familiar corner. Let their body settle before any talking.",
          ],
          parentMessage + "sensory",
        );
    adviceTailored = true;
  }

  if (containsAny(msg, TRANSITION_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Transition demand — ${name} needed more preparation time between activities.`;
    suggestedResponse = pickVariant(
      [
        "Use visual timers. Give advance notice. Frame the next step as a choice between two acceptable options.",
        `Name what's ending before what's starting — a two-minute warning often helps ${name} more than a sudden stop.`,
        context.profile?.successful_strategies?.[0]
          ? `Lean on what works: ${context.profile.successful_strategies[0]}. Pair it with a choice about what comes next.`
          : `Offer a bridge activity between steps so ${name} isn't jumping straight from one demand to another.`,
      ],
      parentMessage + "transition",
    );
    adviceTailored = true;
  }

  if (containsAny(msg, ANXIETY_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Elevated anxiety — ${name}'s worry system was activated, reducing capacity for demands.`;
    suggestedResponse = pickVariant(
      [
        "Name the feeling without fixing it immediately. Reduce all non-essential demands for the next hour.",
        `Stay close without pressing for detail. Let ${name} know worry makes sense — you can problem-solve later.`,
        "Shrink the world for a while: one room, low light, predictable sounds.",
      ],
      parentMessage + "anxiety",
    );
    adviceTailored = true;
  }

  if (containsAny(msg, HOMEWORK_KEYWORDS)) {
    behaviourExplanation = `Homework can feel like an unexpected demand after a long school day for ${name}. ${historyOpener}`;
    suggestedResponse = context.profile?.calming_strategies?.[0]
      ? pickVariant(
          [
            `Offer a regulated break first. When ${name} is ready, sit nearby without hovering. ${context.profile.calming_strategies[0]} has helped before.`,
            `Start with one tiny task — not the whole sheet. ${context.profile.calming_strategies[0]} before homework has worked for ${name}.`,
          ],
          parentMessage + "homework",
        )
      : pickVariant(
          [
            `Offer a regulated break first. When ${name} is ready, sit nearby without hovering. Break tasks into one small step.`,
            "Homework can wait until regulation returns — one line or one problem is enough for today.",
          ],
          parentMessage + "homework",
        );
    adviceTailored = true;
    tomorrowPlan = "Prep homework materials tonight so tomorrow's start is predictable — no surprises.";
  }

  if (containsAny(msg, PARTY_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Social event — parties combine sensory input, unpredictability, and social demands for ${name}.`;
    behaviourExplanation = `Birthdays and parties can overwhelm ${name}'s nervous system even when they want to go. ${historyOpener}`;
    suggestedResponse = pickVariant(
      [
        "Share a visual plan of the event. Agree on a quiet exit signal. Pack familiar comfort items.",
        `Preview who will be there and for how long. Let ${name} know leaving early is always an option.`,
        "Practice a code word for 'I need out' before you go — it saves negotiation in the moment.",
      ],
      parentMessage + "party",
    );
    adviceTailored = true;
    tomorrowPlan = "Debrief gently after the event — what felt okay, what was too much.";
  }

  if (containsAny(msg, CLOTHING_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Sensory or demand barrier — clothing/shoes may feel physically uncomfortable or like a non-negotiable demand for ${name}.`;
    behaviourExplanation = `Getting dressed can trigger sensory distress or demand avoidance for ${name}. ${historyOpener}`;
    suggestedResponse = context.profile?.calming_strategies?.[0]
      ? pickVariant(
          [
            `Offer two acceptable clothing options ${name} chooses between. ${context.profile.calming_strategies[0]} may help before trying again.`,
            `Warm the shoes and check seams/tags. ${context.profile.calming_strategies[0]} first, then dress without time pressure.`,
          ],
          parentMessage + "clothing",
        )
      : pickVariant(
          [
            `Offer two acceptable clothing options ${name} chooses between. Warm the shoes, check seams/tags, and avoid time pressure.`,
            "Let dress happen in stages — socks first, pause, then shoes when their body is calmer.",
          ],
          parentMessage + "clothing",
        );
    adviceTailored = true;
  }

  if (containsAny(msg, VISIT_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Change to routine — visitors or trips disrupt ${name}'s predictable environment.`;
    behaviourExplanation = `Visits change the home environment and social expectations for ${name}. ${historyOpener}`;
    suggestedResponse = pickVariant(
      [
        "Prepare a visual schedule for the visit. Designate a quiet retreat space. Brief visitors on what helps.",
        `Let ${name} know the visit plan in advance — who, when, and where they can escape to if needed.`,
      ],
      parentMessage + "visit",
    );
    adviceTailored = true;
    tomorrowPlan = "Keep tomorrow low-demand to allow recovery from the social energy spent today.";
  }

  if (containsAny(msg, SLEEP_KEYWORDS)) {
    likelyTrigger = likelyTrigger || `Sleep disruption — ${name}'s regulation capacity is closely tied to rest.`;
    behaviourExplanation = `Sleep affects everything for ${name}. ${historyOpener}`;
    suggestedResponse = pickVariant(
      [
        "Reduce evening demands. Dim lights an hour before bed. Keep the bedtime routine identical each night.",
        `Tonight, protect wind-down time for ${name} — same order, same cues, fewer surprises.`,
        "If sleep was broken, plan a gentler morning — regulation first, demands later.",
      ],
      parentMessage + "sleep",
    );
    adviceTailored = true;
    tomorrowPlan = "If sleep was poor, reduce tomorrow's demands proactively — don't wait for a meltdown.";
  }

  if (
    context.child.diagnosis?.some((d) => d.toLowerCase().includes("pda")) ||
    context.child.support_needs?.some((n) => n.toLowerCase().includes("pda"))
  ) {
    behaviourExplanation += ` With ${name}'s PDA profile, perceived demands can trigger an automatic threat response.`;
    thingsNotToSay.push("Just try your best.");
    if (!adviceTailored) {
      suggestedResponse =
        "Use declarative language instead of direct requests. Offer indirect choices. Allow recovery time without discussion.";
    } else {
      suggestedResponse += ` With PDA, phrase the next step indirectly — curiosity often works better than instruction for ${name}.`;
    }
  }

  const knownTrigger = context.profile?.known_triggers?.find((t) => msg.includes(t.toLowerCase()));
  if (knownTrigger) {
    likelyTrigger = `${name}'s known trigger "${knownTrigger}" aligns with what you're describing today.`;
    confidence = 0.88;
  }

  const memoryRef = memoryForMessage(context, parentMessage);
  if (memoryRef) {
    longTermRecommendation = `${memoryRef} ${longTermRecommendation}`;
    confidence = Math.max(confidence, 0.8);
  }

  const knowledgeArticles = retrieveKnowledgeForMessage(parentMessage, context.child.diagnosis || []);
  if (knowledgeArticles.length) {
    const top = knowledgeArticles[0];
    const blended = blendKnowledgeWithFamily({
      familyObservation: memoryRef,
      articles: knowledgeArticles,
      childName: name,
    });
    suggestedResponse = `${top.guidance[0]} For ${name} specifically: ${suggestedResponse}`;
    longTermRecommendation = `${blended.combinedRecommendation} ${longTermRecommendation}`;
    confidence = Math.max(confidence, 0.75);
  }

  const depth = confidenceFromDataDepth({
    checkinCount: context.recentCheckins.length,
    patternCount: context.patterns.length,
    hasTodayCheckin: Boolean(
      context.recentCheckins[0]?.checkin_date === new Date().toISOString().split("T")[0],
    ),
    memoryCount: context.memoryReferences.length,
  });
  confidence = Math.max(confidence, depth.score * 0.95);

  if (conversationHistory.length >= 2) {
    emotionalInterpretation = `${convoSummary || "Building on our earlier messages,"} ${emotionalInterpretation}`;
    confidence = Math.min(0.92, confidence + 0.05);
  }

  return {
    likely_trigger: likelyTrigger,
    behaviour_explanation: behaviourExplanation,
    emotional_interpretation: emotionalInterpretation,
    suggested_response: suggestedResponse,
    things_not_to_say: thingsNotToSay,
    tomorrow_plan: tomorrowPlan,
    long_term_recommendation: longTermRecommendation,
    confidence_level: capConfidenceForEvidence(confidence, context),
    follow_up_questions: followUpFromHistory(conversationHistory, name),
  };
}

export function buildPipelineTrace(
  context: ChildContext,
  conversationHistory: ConversationTurn[],
  knowledgeCount: number,
  usedLlm: boolean,
  options?: { formatted?: boolean; persisted?: boolean; coachMode?: CoachMode; debriefEngineUsed?: boolean },
): CoachPipelineTrace {
  return {
    questionReceived: true,
    conversationHistoryFound: conversationHistory.length,
    conversationHistoryInjected: conversationHistory.length > 0,
    childFound: Boolean(context.child?.id),
    profileFound: Boolean(context.profile),
    checkinsFound: context.recentCheckins.length,
    checkinsInjected: context.recentCheckins.length > 0,
    patternsFound: context.patterns.length,
    patternsInjected: context.patterns.length > 0,
    memoriesInjected: context.memoryReferences.length,
    memoriesUsed: context.memoryReferences.length > 0,
    graphInsightsInjected: context.graphInsights?.length ?? 0,
    graphUsed: (context.graphInsights?.length ?? 0) > 0,
    timelineEventsFound: context.recentTimeline.length,
    timelineInjected: context.recentTimeline.length > 0,
    knowledgeArticles: knowledgeCount,
    knowledgeInjected: knowledgeCount > 0 || (context.knowledgeGuidance?.length ?? 0) > 0,
    triggersInProfile: context.profile?.known_triggers?.length ?? 0,
    strategiesInProfile: context.profile?.calming_strategies?.length ?? 0,
    coachMode: options?.coachMode ?? "coaching",
    debriefEngineUsed: options?.debriefEngineUsed ?? false,
    usedLlm,
    responseFormatted: options?.formatted ?? false,
    persisted: options?.persisted ?? false,
  };
}

export async function generateCoachResponse(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: ConversationTurn[] = [],
  options?: {
    preferReflection?: boolean;
    parentMood?: ParentMood | null;
    coachMessages?: CoachMessageTurn[];
  },
): Promise<{
  response: DebriefResponse;
  trace: CoachPipelineTrace;
  mode: CoachMode;
  enrichment: CuriousEnrichment;
}> {
  const knowledgeArticles = retrieveKnowledgeForMessage(parentMessage, context.child.diagnosis || []);
  const moodPrompt = parentMoodForPrompt(options?.parentMood ?? null);
  const mode = detectCoachMode(parentMessage, {
    preferReflection: options?.preferReflection,
    parentMood: options?.parentMood ?? null,
  });
  const traceOpts = { coachMode: mode, debriefEngineUsed: isReflectionMode(mode) };

  function finish(
    response: DebriefResponse,
    usedLlm: boolean,
    overrides?: { debriefEngineUsed?: boolean; skipEnrich?: boolean },
  ) {
    const enrichment = buildCuriousEnrichment(parentMessage, context, conversationHistory, mode, {
      parentMood: options?.parentMood ?? null,
      coachMessages: options?.coachMessages ?? [],
    });
    const enriched = overrides?.skipEnrich
      ? response
      : applyCuriousEnrichment(response, enrichment, context, parentMessage, conversationHistory);
    return {
      response: enriched,
      mode,
      enrichment,
      trace: buildPipelineTrace(context, conversationHistory, knowledgeArticles.length, usedLlm, {
        ...traceOpts,
        debriefEngineUsed: overrides?.debriefEngineUsed ?? traceOpts.debriefEngineUsed,
      }),
    };
  }

  const productHelp = buildProductHelpResponse(parentMessage, context.child.first_name);
  if ((mode === "product_help" || mode === "navigation") && productHelp) {
    return finish(productHelp, false, { skipEnrich: true });
  }

  if (isBriefMoment(parentMessage) && mode !== "emergency" && mode !== "product_help") {
    const enrichment = buildCuriousEnrichment(parentMessage, context, conversationHistory, mode, {
      parentMood: options?.parentMood ?? null,
      coachMessages: options?.coachMessages ?? [],
    });
    const brief = applyCuriousEnrichment(
      {
        likely_trigger: "",
        behaviour_explanation: "",
        emotional_interpretation: "",
        suggested_response: "",
        things_not_to_say: [],
        tomorrow_plan: "",
        long_term_recommendation: "",
        confidence_level: 0.9,
        follow_up_questions: [],
      },
      enrichment,
      context,
      parentMessage,
      conversationHistory,
    );
    return {
      response: brief,
      mode,
      enrichment,
      trace: buildPipelineTrace(context, conversationHistory, knowledgeArticles.length, false, traceOpts),
    };
  }

  if (
    needsEmotionalHolding(parentMessage) &&
    mode !== "emergency" &&
    mode !== "product_help" &&
    mode !== "navigation" &&
    !/\bwhat should\b|\bhow do i\b|\bhow can i\b/i.test(parentMessage)
  ) {
    const enrichment = buildCuriousEnrichment(parentMessage, context, conversationHistory, mode, {
      parentMood: options?.parentMood ?? null,
      coachMessages: options?.coachMessages ?? [],
    });
    enrichment.trust.emotionalHolding = true;
    const holding = buildEmotionalHoldingResponse(parentMessage, context);
    const enriched = applyCuriousEnrichment(
      holding,
      enrichment,
      context,
      parentMessage,
      conversationHistory,
    );
    return {
      response: enriched,
      mode,
      enrichment,
      trace: buildPipelineTrace(context, conversationHistory, knowledgeArticles.length, false, traceOpts),
    };
  }

  if (
    needsPresenceFirst(
      parentMessage,
      conversationHistory,
      options?.parentMood ?? null,
      mode,
    ) &&
    mode !== "emergency" &&
    mode !== "product_help" &&
    mode !== "navigation"
  ) {
    const enrichment = buildCuriousEnrichment(parentMessage, context, conversationHistory, mode, {
      parentMood: options?.parentMood ?? null,
      coachMessages: options?.coachMessages ?? [],
    });
    const presence = buildPresenceResponse(
      parentMessage,
      context,
      options?.parentMood ?? null,
    );
    const enriched = applyCuriousEnrichment(
      presence,
      enrichment,
      context,
      parentMessage,
      conversationHistory,
    );
    return {
      response: enriched,
      mode,
      enrichment,
      trace: buildPipelineTrace(context, conversationHistory, knowledgeArticles.length, false, traceOpts),
    };
  }

  if (shouldClarifyBeforeAdvice(parentMessage, conversationHistory, mode)) {
    const enrichment = buildCuriousEnrichment(parentMessage, context, conversationHistory, mode, {
      parentMood: options?.parentMood ?? null,
      coachMessages: options?.coachMessages ?? [],
    });
    return {
      response: buildCuriousClarification(parentMessage, context, conversationHistory, moodPrompt),
      mode,
      enrichment,
      trace: buildPipelineTrace(context, conversationHistory, knowledgeArticles.length, false, traceOpts),
    };
  }

  if (isReflectionMode(mode)) {
    const response = await generateDebriefResponse(parentMessage, context);
    return finish(response, false, { debriefEngineUsed: true });
  }

  if (mode === "parent_support") {
    return finish(
      buildLocalCoachResponse(parentMessage, context, conversationHistory, mode, moodPrompt),
      false,
    );
  }

  if (isExternalLLMConfigured()) {
    try {
      const provider = getLLMProvider();
      const prompt = buildCoachPrompt(parentMessage, context, conversationHistory, moodPrompt);
      const raw = await provider.complete(prompt, { system: COACH_SYSTEM, temperature: 0.55 });
      const parsed = parseDebriefResponse(raw);
      if (parsed) {
        return finish(parsed, true);
      }
    } catch {
      // Fall through to local intelligence
    }
  }

  return finish(
    buildLocalCoachResponse(parentMessage, context, conversationHistory, mode, moodPrompt),
    false,
  );
}

export { formatCheckinLine };
