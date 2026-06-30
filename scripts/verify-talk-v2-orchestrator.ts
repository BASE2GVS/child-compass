import assert from "node:assert/strict";
import {
  TALK_V2_CONTRACT_VERSION,
  type ConversationRepositoryRequest,
  type ConversationRepositoryResult,
  type FamilyContext,
  type LLMProviderResult,
  type LLMRequest,
  type PromptRequest,
  type TalkV2MessageRequest,
  type TalkV2SafetyResult,
  type ValidationResult,
} from "@/lib/talk-v2/contracts";
import { TALK_V2_PROMPT_VERSION } from "@/lib/talk-v2/prompt/constants";
import { TALK_V2_PIPELINE_VERSION } from "@/lib/talk-v2/repository/constants";
import {
  orchestrateTalkV2Message,
  type TalkV2OrchestratorDependencies,
} from "@/lib/talk-v2/api/orchestrate-talk-v2-message";

type SequenceStep =
  | "auth"
  | "entitlement"
  | "safety"
  | "context"
  | "prompt"
  | "provider"
  | "validation"
  | "persistence";

type Scenario = {
  safetyStatus?: TalkV2SafetyResult["status"];
  providerOk?: boolean;
  validationOk?: boolean;
  persistenceOk?: boolean;
  persistenceMode?: "normal" | "idempotent";
};

function sampleRequest(message = "How can I help my child settle tonight?"): TalkV2MessageRequest {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    message,
  };
}

function sampleFamilyContext(): FamilyContext {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    childProfile: {
      childId: "child-1",
      firstName: "Ari",
      nickname: null,
      diagnosis: ["ASD"],
      supportNeeds: ["sleep"],
      school: null,
      grade: null,
      strengths: ["curious"],
      knownTriggers: ["transitions"],
      calmingStrategies: ["story time"],
      successfulStrategies: ["predictable routine"],
      challenges: ["night waking"],
    },
    recentConversation: [
      {
        role: "parent",
        content: "Bedtime has been difficult this week.",
        createdAt: "2026-06-30T10:00:00.000Z",
      },
    ],
    dailyCheckins: [],
    timelineHighlights: [],
    behaviourPatterns: [],
    relevantMemories: [],
    familyStory: null,
    conversationState: {
      detectedState: "FOLLOW_UP",
      confidence: 0.8,
      reasoningCode: "STATE_FOLLOW_UP_REFERENCE",
      previousConversationReference: null,
    },
    safetyRules: [],
    completeness: {
      childProfile: "complete",
      recentConversation: "complete",
      dailyCheckins: "empty",
      timelineHighlights: "empty",
      behaviourPatterns: "empty",
      relevantMemories: "empty",
      familyStory: "empty",
      safetyRules: "empty",
      missingSections: [
        "dailyCheckins",
        "timelineHighlights",
        "behaviourPatterns",
        "relevantMemories",
        "familyStory",
        "safetyRules",
      ],
      coveragePercent: 25,
    },
    selectionMetadata: {
      detectedIntents: ["sleep"],
      conversationState: "FOLLOW_UP",
      retrievalRationale: ["intent: sleep"],
      selectedContextSources: ["recentConversation", "childProfile"],
      omittedContextSources: ["timelineHighlights"],
      retrievalLimitsApplied: {},
    },
  };
}

function samplePrompt(): PromptRequest {
  return {
    promptVersion: TALK_V2_PROMPT_VERSION,
    systemInstruction: "Be calm and practical.",
    familyContext: "Context",
    conversationHistory: [
      {
        role: "parent",
        content: "Bedtime has been difficult this week.",
        createdAt: "2026-06-30T10:00:00.000Z",
      },
    ],
    parentMessage: "How can I help my child settle tonight?",
    modelConfiguration: {
      model: "gpt-4o-mini",
      temperature: 0.4,
      maxTokens: 450,
    },
    metadata: {
      contractVersion: TALK_V2_CONTRACT_VERSION,
      contextVersion: TALK_V2_CONTRACT_VERSION,
      trace: {
        conversationTurns: 1,
        contextSourcesSelected: 2,
        memoryItems: 0,
        intents: 1,
        conversationState: "FOLLOW_UP",
      },
    },
  };
}

function makeDependencies(
  scenario: Scenario,
  sequence: SequenceStep[],
  persistenceWrites: { count: number },
): TalkV2OrchestratorDependencies {
  const seenRequestIds = new Set<string>();

  return {
    authenticate: async () => {
      sequence.push("auth");
      return {
        supabase: {} as never,
        user: { id: "user-1" },
      };
    },
    ensureEntitlement: async () => {
      sequence.push("entitlement");
      return {
        ok: true,
        child: { id: "child-1", family_id: "family-1" },
      };
    },
    evaluateSafety: () => {
      sequence.push("safety");
      const status = scenario.safetyStatus || "allow";
      return {
        version: TALK_V2_CONTRACT_VERSION,
        status,
        reasonCode: status === "allow" ? "pass" : "block_test",
        userMessage: status === "allow" ? undefined : "Blocked by test safety gate",
      };
    },
    buildContext: async () => {
      sequence.push("context");
      return sampleFamilyContext();
    },
    buildPrompt: () => {
      sequence.push("prompt");
      return samplePrompt();
    },
    executeProvider: async (_request: LLMRequest): Promise<LLMProviderResult> => {
      sequence.push("provider");
      if (scenario.providerOk === false) {
        return {
          ok: false,
          error: {
            code: "PROVIDER_UNAVAILABLE",
            message: "Provider unavailable",
            retryable: true,
          },
          metadata: {
            provider: "openai",
            model: "gpt-4o-mini",
            latencyMs: 15,
            attempts: 1,
            statusCode: 503,
          },
        };
      }

      return {
        ok: true,
        response: {
          version: TALK_V2_CONTRACT_VERSION,
          rawOutput: "Try a short visual bedtime routine tonight.",
          metadata: {
            provider: "openai",
            model: "gpt-4o-mini",
            latencyMs: 20,
            attempts: 1,
            requestId: "req-provider-1",
            statusCode: 200,
          },
        },
      };
    },
    validateResponse: (_payload: unknown): ValidationResult => {
      sequence.push("validation");
      if (scenario.validationOk === false) {
        return {
          ok: false,
          error: {
            code: "INVALID_SCHEMA",
            message: "Payload does not match LLMResponse schema",
          },
        };
      }

      return {
        ok: true,
        validated: {
          version: TALK_V2_CONTRACT_VERSION,
          text: "Try a short visual bedtime routine tonight.",
          metadata: {
            validatorVersion: "1.0.0",
            contractVersion: TALK_V2_CONTRACT_VERSION,
            originalLength: 42,
            validatedLength: 42,
            normalizationApplied: {
              newlineNormalized: false,
              invalidCharsRemoved: 0,
              bomRemoved: false,
              edgeWhitespaceTrimmed: false,
            },
            maxLength: 8000,
          },
          providerMetadata: {
            provider: "openai",
            model: "gpt-4o-mini",
            latencyMs: 20,
            attempts: 1,
          },
        },
      };
    },
    repository: {
      saveConversation: async (
        request: ConversationRepositoryRequest,
      ): Promise<ConversationRepositoryResult> => {
        sequence.push("persistence");

        if (scenario.persistenceOk === false) {
          return {
            ok: false,
            error: {
              code: "TRANSACTION_FAILED",
              message: "Transaction failed",
              retryable: true,
            },
          };
        }

        if (scenario.persistenceMode === "idempotent") {
          if (seenRequestIds.has(request.requestId)) {
            return {
              ok: true,
              record: {
                status: "duplicate",
                assistantMessageId: "assistant-1",
                createdAt: "2026-06-30T10:00:00.000Z",
              },
            };
          }
          seenRequestIds.add(request.requestId);
        }

        persistenceWrites.count += 1;
        return {
          ok: true,
          record: {
            status: "saved",
            parentMessageId: "parent-1",
            assistantMessageId: "assistant-1",
            createdAt: "2026-06-30T10:00:00.000Z",
          },
        };
      },
    },
  };
}

function assertRequiredTimings(output: Awaited<ReturnType<typeof orchestrateTalkV2Message>>) {
  const keys = Object.keys(output.internal.timingsMs).sort();
  assert.deepEqual(keys, [
    "authentication",
    "context",
    "persistence",
    "prompt",
    "provider",
    "safety",
    "validation",
  ]);
  for (const key of keys) {
    assert.equal(typeof output.internal.timingsMs[key as keyof typeof output.internal.timingsMs], "number");
  }
}

async function testSuccessfulConversation() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-success",
    dependencies: makeDependencies({}, sequence, writes),
  });

  assert.equal(output.result.status, "accepted");
  if (output.result.status !== "accepted") throw new Error("Expected accepted result");
  assert.equal(output.result.message, "Try a short visual bedtime routine tonight.");
  assert.equal(writes.count, 1);
  assert.deepEqual(sequence, [
    "auth",
    "entitlement",
    "safety",
    "context",
    "prompt",
    "provider",
    "validation",
    "persistence",
  ]);
  assertRequiredTimings(output);
}

async function testSafetyBlockStopsBeforeProvider() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-safety",
    dependencies: makeDependencies({ safetyStatus: "block" }, sequence, writes),
  });

  assert.equal(output.result.status, "blocked");
  assert.equal(writes.count, 0);
  assert.deepEqual(sequence, ["auth", "entitlement", "safety"]);
}

async function testProviderFailureStopsPersistence() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-provider-fail",
    dependencies: makeDependencies({ providerOk: false }, sequence, writes),
  });

  assert.equal(output.result.status, "error");
  if (output.result.status !== "error") throw new Error("Expected error status");
  assert.equal(output.result.error, "Provider unavailable");
  assert.equal(writes.count, 0);
  assert.deepEqual(sequence, ["auth", "entitlement", "safety", "context", "prompt", "provider"]);
}

async function testValidationFailureStopsPersistence() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-validation-fail",
    dependencies: makeDependencies({ validationOk: false }, sequence, writes),
  });

  assert.equal(output.result.status, "error");
  if (output.result.status !== "error") throw new Error("Expected error status");
  assert.equal(output.result.error, "Payload does not match LLMResponse schema");
  assert.equal(writes.count, 0);
  assert.deepEqual(sequence, [
    "auth",
    "entitlement",
    "safety",
    "context",
    "prompt",
    "provider",
    "validation",
  ]);
}

async function testPersistenceFailureIsReturned() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-persistence-fail",
    dependencies: makeDependencies({ persistenceOk: false }, sequence, writes),
  });

  assert.equal(output.result.status, "error");
  if (output.result.status !== "error") throw new Error("Expected error status");
  assert.equal(output.result.error, "Transaction failed");
  assert.equal(writes.count, 0);
  assert.deepEqual(sequence, [
    "auth",
    "entitlement",
    "safety",
    "context",
    "prompt",
    "provider",
    "validation",
    "persistence",
  ]);
}

async function testIdempotentRetrySinglePersistence() {
  const writes = { count: 0 };
  const firstSequence: SequenceStep[] = [];
  const secondSequence: SequenceStep[] = [];
  const dependencies = makeDependencies({ persistenceMode: "idempotent" }, firstSequence, writes);

  const first = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-idempotent",
    dependencies,
  });
  assert.equal(first.result.status, "accepted");

  const second = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-idempotent",
    dependencies: {
      ...dependencies,
      authenticate: async () => {
        secondSequence.push("auth");
        return { supabase: {} as never, user: { id: "user-1" } };
      },
      ensureEntitlement: async () => {
        secondSequence.push("entitlement");
        return { ok: true, child: { id: "child-1", family_id: "family-1" } };
      },
      evaluateSafety: (message) => {
        void message;
        secondSequence.push("safety");
        return {
          version: TALK_V2_CONTRACT_VERSION,
          status: "allow",
          reasonCode: "pass",
        };
      },
      buildContext: async () => {
        secondSequence.push("context");
        return sampleFamilyContext();
      },
      buildPrompt: () => {
        secondSequence.push("prompt");
        return samplePrompt();
      },
      executeProvider: async (request) => {
        void request;
        secondSequence.push("provider");
        return {
          ok: true,
          response: {
            version: TALK_V2_CONTRACT_VERSION,
            rawOutput: "Try a short visual bedtime routine tonight.",
            metadata: {
              provider: "openai",
              model: "gpt-4o-mini",
              latencyMs: 20,
              attempts: 1,
            },
          },
        };
      },
      validateResponse: () => {
        secondSequence.push("validation");
        return {
          ok: true,
          validated: {
            version: TALK_V2_CONTRACT_VERSION,
            text: "Try a short visual bedtime routine tonight.",
            metadata: {
              validatorVersion: "1.0.0",
              contractVersion: TALK_V2_CONTRACT_VERSION,
              originalLength: 42,
              validatedLength: 42,
              normalizationApplied: {
                newlineNormalized: false,
                invalidCharsRemoved: 0,
                bomRemoved: false,
                edgeWhitespaceTrimmed: false,
              },
              maxLength: 8000,
            },
            providerMetadata: {
              provider: "openai",
              model: "gpt-4o-mini",
              latencyMs: 20,
              attempts: 1,
            },
          },
        };
      },
      repository: dependencies.repository,
    },
  });

  assert.equal(second.result.status, "accepted");
  assert.equal(writes.count, 1);
  assert.deepEqual(firstSequence.slice(0, 8), [
    "auth",
    "entitlement",
    "safety",
    "context",
    "prompt",
    "provider",
    "validation",
    "persistence",
  ]);
  assert.equal(firstSequence.length, 9);
  assert.equal(firstSequence[8], "persistence");
  assert.deepEqual(secondSequence, [
    "auth",
    "entitlement",
    "safety",
    "context",
    "prompt",
    "provider",
    "validation",
  ]);
}

async function testPipelineVersionForwarded() {
  const sequence: SequenceStep[] = [];
  const writes = { count: 0 };
  let capturedPipelineVersion = "";

  const deps = makeDependencies({}, sequence, writes);
  const output = await orchestrateTalkV2Message(sampleRequest(), {
    requestId: "req-pipeline-version",
    dependencies: {
      ...deps,
      repository: {
        saveConversation: async (request) => {
          capturedPipelineVersion = request.pipelineVersion;
          return deps.repository.saveConversation(request);
        },
      },
    },
  });

  assert.equal(output.result.status, "accepted");
  assert.equal(capturedPipelineVersion, TALK_V2_PIPELINE_VERSION);
}

async function run() {
  await testSuccessfulConversation();
  await testSafetyBlockStopsBeforeProvider();
  await testProviderFailureStopsPersistence();
  await testValidationFailureStopsPersistence();
  await testPersistenceFailureIsReturned();
  await testIdempotentRetrySinglePersistence();
  await testPipelineVersionForwarded();
  console.log("Talk V2 orchestration checks passed.");
}

run();
