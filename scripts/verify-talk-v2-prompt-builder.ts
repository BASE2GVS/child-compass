import assert from "node:assert/strict";
import {
  TALK_V2_CONTRACT_VERSION,
  type FamilyContext,
} from "@/lib/talk-v2/contracts";
import {
  TALK_V2_DEFAULT_SYSTEM_INSTRUCTION,
  TALK_V2_PROMPT_VERSION,
} from "@/lib/talk-v2/prompt/constants";
import { buildPromptRequest } from "@/lib/talk-v2/prompt/prompt-builder";
import { serializeFamilyContext } from "@/lib/talk-v2/prompt/serialize-family-context";

function baseFamilyContext(): FamilyContext {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    childProfile: {
      childId: "child-1",
      firstName: "Lienke",
      nickname: null,
      diagnosis: ["Autism"],
      supportNeeds: ["predictability"],
      school: "Primary",
      grade: "3",
      strengths: ["curiosity"],
      knownTriggers: ["rushed mornings"],
      calmingStrategies: ["quiet corner"],
      successfulStrategies: ["visual timer"],
      challenges: ["school refusal"],
    },
    recentConversation: [
      {
        role: "parent",
        content: "School mornings are hard.",
        createdAt: "2026-06-29T08:00:00.000Z",
      },
    ],
    dailyCheckins: [
      {
        date: "2026-06-29",
        sleepQuality: 2,
        mood: 2,
        anxiety: 4,
        schoolRating: 1,
        wins: ["Used visual timer"],
        challenges: ["Drop-off refusal"],
        notes: "Transition strain",
      },
    ],
    timelineHighlights: [
      {
        date: "2026-06-29",
        type: "school",
        title: "Late school arrival",
        description: "Needed additional transition support",
      },
    ],
    behaviourPatterns: [
      {
        category: "school",
        title: "School transition",
        description: "Rushed mornings increase refusal",
        confidence: 0.82,
      },
    ],
    relevantMemories: [
      {
        source: "pattern",
        text: "Rushed mornings increase refusal",
        score: 6.5,
      },
    ],
    familyStory: {
      stage: "stabilizing",
      signals: [
        {
          kind: "challenge",
          text: "Drop-off remains difficult",
          source: "checkin",
        },
      ],
    },
    conversationState: {
      detectedState: "FOLLOW_UP",
      confidence: 0.78,
      reasoningCode: "STATE_FOLLOW_UP_REFERENCE",
      previousConversationReference: {
        role: "assistant",
        createdAt: "2026-06-29T08:01:00.000Z",
        excerpt: "Try a visual timer before leaving.",
      },
    },
    safetyRules: [
      {
        id: "urgent-self-harm",
        description: "Escalate self-harm risk.",
        triggerExamples: ["self-harm"],
      },
    ],
    completeness: {
      childProfile: "complete",
      recentConversation: "complete",
      dailyCheckins: "complete",
      timelineHighlights: "complete",
      behaviourPatterns: "complete",
      relevantMemories: "complete",
      familyStory: "complete",
      safetyRules: "complete",
      missingSections: [],
      coveragePercent: 100,
    },
    selectionMetadata: {
      detectedIntents: ["school", "behaviour"],
      conversationState: "FOLLOW_UP",
      retrievalRationale: ["Prioritized school context."],
      selectedContextSources: ["recentConversation", "behaviourPatterns"],
      omittedContextSources: [],
      retrievalLimitsApplied: {
        recentConversation: 12,
        dailyCheckins: 14,
        timelineHighlights: 20,
        behaviourPatterns: 10,
        recentDebriefs: 10,
        relevantMemories: 8,
        familyStorySignals: 6,
      },
    },
  };
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) {
        deepFreeze(child);
      }
    }
  }
  return value;
}

function run() {
  const contextA = baseFamilyContext();
  const historyA = deepClone(contextA.recentConversation);
  const input = {
    parentMessage: "What should we do for tomorrow morning?",
    conversationHistory: historyA,
    familyContext: contextA,
    modelConfiguration: {
      model: "gpt-4o-mini",
      temperature: 0.4,
      maxTokens: 900,
    },
  };

  const frozenInput = deepFreeze(deepClone(input));
  const prompt1 = buildPromptRequest(frozenInput);
  const prompt2 = buildPromptRequest(deepClone(frozenInput));
  assert.deepEqual(prompt1, prompt2);

  assert.equal(prompt1.promptVersion, TALK_V2_PROMPT_VERSION);
  assert.equal(prompt1.metadata.contractVersion, TALK_V2_CONTRACT_VERSION);
  assert.equal(prompt1.metadata.contextVersion, TALK_V2_CONTRACT_VERSION);
  assert.equal(prompt1.systemInstruction, TALK_V2_DEFAULT_SYSTEM_INSTRUCTION);

  const contextB = deepClone(contextA);
  contextB.selectionMetadata.detectedIntents = ["sleep"];
  contextB.behaviourPatterns[0].title = "Sleep disruption";
  const promptDifferentContext = buildPromptRequest({
    ...input,
    familyContext: contextB,
  });
  assert.notEqual(prompt1.familyContext, promptDifferentContext.familyContext);

  const promptDifferentHistory = buildPromptRequest({
    ...input,
    conversationHistory: [
      ...historyA,
      {
        role: "assistant",
        content: "Keep tomorrow low-demand.",
        createdAt: "2026-06-29T08:05:00.000Z",
      },
    ],
  });
  assert.notDeepEqual(prompt1.conversationHistory, promptDifferentHistory.conversationHistory);

  const promptDifferentMessage = buildPromptRequest({
    ...input,
    parentMessage: "She slept better tonight.",
  });
  assert.notEqual(prompt1.parentMessage, promptDifferentMessage.parentMessage);

  const serializedA = serializeFamilyContext(contextA);
  const serializedA2 = serializeFamilyContext(deepClone(contextA));
  assert.equal(serializedA, serializedA2);

  console.log("Prompt determinism check: pass");
  console.log("Context delta check: pass");
  console.log("History delta check: pass");
  console.log("Parent message delta check: pass");
  console.log("Talk V2 prompt builder checks passed.");
}

run();
