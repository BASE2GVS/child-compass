import { randomUUID } from "node:crypto";
import {
  TALK_V2_CONTRACT_VERSION,
  type FamilyContext,
  type FamilyContextConversationTurn,
  type LLMRequest,
} from "@/lib/talk-v2/contracts";
import { buildPromptRequest } from "@/lib/talk-v2/prompt/prompt-builder";
import { defaultProviderConfig } from "@/lib/talk-v2/llm/provider-config";
import { executeLLMRequest } from "@/lib/talk-v2/llm/provider-adapter";
import { OpenAIProvider } from "@/lib/talk-v2/llm/openai-provider";
import { validateLLMResponse } from "@/lib/talk-v2/validation/response-validator";

function buildAmyContext(history: FamilyContextConversationTurn[]): FamilyContext {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    childId: "amy-child-id",
    sessionId: "founder-fixpack-1a",
    childProfile: {
      childId: "amy-child-id",
      firstName: "Amy",
      nickname: null,
      diagnosis: ["Autism"],
      supportNeeds: ["predictability", "low-demand transitions"],
      school: "Primary",
      grade: "4",
      strengths: ["visual thinking", "nature interest"],
      knownTriggers: ["unexpected transitions", "crowded noisy settings"],
      calmingStrategies: ["quiet tent corner", "visual schedule", "short reset walks"],
      successfulStrategies: ["preview plans", "choice-based language"],
      challenges: ["holiday routine changes"],
    },
    recentConversation: history,
    dailyCheckins: [],
    timelineHighlights: [
      {
        date: "2026-06-20",
        type: "routine",
        title: "Holiday transitions are harder",
        description: "Needs extra preview and slower transitions",
      },
    ],
    behaviourPatterns: [
      {
        category: "routine",
        title: "Transition sensitivity",
        description: "Abrupt plan changes increase anxiety and resistance",
        confidence: 0.86,
      },
    ],
    relevantMemories: [
      {
        source: "pattern",
        text: "Previewing plans with choices lowers resistance",
        score: 7.4,
      },
    ],
    familyStory: {
      stage: "stabilizing",
      signals: [
        {
          kind: "support",
          text: "Parent is actively planning ahead for holidays",
          source: "profile",
        },
      ],
    },
    conversationState: {
      detectedState: "FOLLOW_UP",
      confidence: 0.74,
      reasoningCode: "STATE_FOLLOW_UP_REFERENCE",
      previousConversationReference: null,
    },
    safetyRules: [],
    completeness: {
      childProfile: "complete",
      recentConversation: history.length ? "complete" : "empty",
      dailyCheckins: "empty",
      timelineHighlights: "complete",
      behaviourPatterns: "complete",
      relevantMemories: "complete",
      familyStory: "complete",
      safetyRules: "empty",
      missingSections: history.length ? ["dailyCheckins", "safetyRules"] : ["recentConversation", "dailyCheckins", "safetyRules"],
      coveragePercent: history.length ? 75 : 63,
    },
    selectionMetadata: {
      detectedIntents: ["general_support"],
      conversationState: "FOLLOW_UP",
      retrievalRationale: ["Founder replay"],
      selectedContextSources: ["recentConversation", "behaviourPatterns", "timelineHighlights"],
      omittedContextSources: ["dailyCheckins"],
      retrievalLimitsApplied: {
        recentConversation: 12,
      },
    },
  };
}

async function run() {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set. Cannot replay founder conversation.");
    process.exit(1);
  }

  const providerConfig = defaultProviderConfig("openai");
  const provider = new OpenAIProvider({ apiKey });

  const parentTurns = [
    "Hi. Can you help me with Amy today?",
    "Any other help?",
    "Amy does not like ice cream.",
    "I want to take her camping for the December holiday, but I'm afraid she will not behave.",
    "Any other recommendations?",
  ];

  const history: FamilyContextConversationTurn[] = [];

  for (const parentMessage of parentTurns) {
    const familyContext = buildAmyContext(history);
    const prompt = buildPromptRequest({
      parentMessage,
      conversationHistory: familyContext.recentConversation,
      familyContext,
      modelConfiguration: {
        model: process.env.TALK_V2_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        maxTokens: 450,
      },
    });

    const request: LLMRequest = {
      version: TALK_V2_CONTRACT_VERSION,
      requestId: randomUUID(),
      provider: "openai",
      prompt,
      timeoutMs: providerConfig.timeoutMs,
      maxRetries: providerConfig.retryPolicy.maxRetries,
    };

    const result = await executeLLMRequest(request, {
      provider,
      retryDelayMs: providerConfig.retryPolicy.retryDelayMs,
    });

    if (!result.ok) {
      console.log("Parent:", parentMessage);
      console.log("Assistant error:", result.error.message);
      console.log("---");
      continue;
    }

    const validated = validateLLMResponse(result.response);
    const assistantText = validated.ok ? validated.validated.text : `[validation error] ${validated.error.message}`;

    console.log("Parent:", parentMessage);
    console.log("Assistant:", assistantText);
    console.log("---");

    history.push({ role: "parent", content: parentMessage, createdAt: new Date().toISOString() });
    history.push({ role: "assistant", content: assistantText, createdAt: new Date().toISOString() });
  }
}

run();
