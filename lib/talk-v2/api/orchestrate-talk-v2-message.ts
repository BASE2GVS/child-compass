import { randomUUID } from "node:crypto";
import {
  TALK_V2_CONTRACT_VERSION,
  type ConversationRepositoryRequest,
  type ConversationRepositoryResult,
  type FamilyContext,
  type LLMProviderResult,
  type LLMRequest,
  type PromptRequest,
  type TalkV2MessageRequest,
  type TalkV2MessageResult,
  type TalkV2SafetyResult,
  type ValidatedResponse,
  type ValidationResult,
} from "@/lib/talk-v2/contracts";
import { buildFamilyContext } from "@/lib/talk-v2/context/family-context-engine";
import { defaultProviderConfig } from "@/lib/talk-v2/llm/provider-config";
import { executeLLMRequest } from "@/lib/talk-v2/llm/provider-adapter";
import { OpenAIProvider } from "@/lib/talk-v2/llm/openai-provider";
import { buildPromptRequest } from "@/lib/talk-v2/prompt/prompt-builder";
import { TALK_V2_PIPELINE_VERSION } from "@/lib/talk-v2/repository/constants";
import { DbConversationRepository } from "@/lib/talk-v2/repository/db-conversation-repository";
import { createPgDbConnection } from "@/lib/talk-v2/repository/pg-db-connection";
import type { TalkV2ConversationRepository } from "@/lib/talk-v2/repository/repository-interface";
import { evaluateTalkV2Safety } from "@/lib/talk-v2/safety/safety-gate";
import { validateLLMResponse } from "@/lib/talk-v2/validation/response-validator";
import { requireTalkV2Auth, type TalkV2AuthContext } from "@/lib/talk-v2/guards/auth-guard";
import {
  ensureTalkV2Entitlement,
  type TalkV2EntitlementResult,
} from "@/lib/talk-v2/guards/entitlement-guard";

type StageName =
  | "authentication"
  | "safety"
  | "context"
  | "prompt"
  | "provider"
  | "validation"
  | "persistence";

export type TalkV2StageTimings = Record<StageName, number>;

export type TalkV2TelemetryEvent = {
  stage: StageName | "entitlement";
  status: "ok" | "failed" | "stopped";
  error?: string;
};

export type TalkV2OrchestratorInternal = {
  requestId: string;
  timingsMs: TalkV2StageTimings;
  events: TalkV2TelemetryEvent[];
};

export type TalkV2OrchestratorResult = {
  result: TalkV2MessageResult;
  internal: TalkV2OrchestratorInternal;
};

export type TalkV2OrchestratorDependencies = {
  authenticate: () => Promise<TalkV2AuthContext>;
  ensureEntitlement: (input: {
    supabase: TalkV2AuthContext["supabase"];
    userId: string;
    childId: string;
  }) => Promise<TalkV2EntitlementResult>;
  evaluateSafety: (message: string) => TalkV2SafetyResult;
  buildContext: (input: {
    supabase: TalkV2AuthContext["supabase"];
    childId: string;
    sessionId: string;
    parentMessage: string;
  }) => Promise<FamilyContext>;
  buildPrompt: (input: {
    parentMessage: string;
    conversationHistory: FamilyContext["recentConversation"];
    familyContext: FamilyContext;
  }) => PromptRequest;
  executeProvider: (request: LLMRequest) => Promise<LLMProviderResult>;
  validateResponse: (payload: unknown) => ValidationResult;
  repository: TalkV2ConversationRepository;
};

export type TalkV2OrchestratorOptions = {
  requestId?: string;
  timestampIso?: string;
  dependencies?: Partial<TalkV2OrchestratorDependencies>;
  nowMs?: () => number;
};

function createBaseTimings(): TalkV2StageTimings {
  return {
    authentication: 0,
    safety: 0,
    context: 0,
    prompt: 0,
    provider: 0,
    validation: 0,
    persistence: 0,
  };
}

function toErrorResult(error: string): TalkV2MessageResult {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    status: "error",
    error,
  };
}

function defaultModelConfiguration() {
  return {
    model: process.env.TALK_V2_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    maxTokens: 450,
  };
}

function createDefaultDependencies(): TalkV2OrchestratorDependencies {
  const providerConfig = defaultProviderConfig("openai");
  const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY || "" });
  const repository: TalkV2ConversationRepository = process.env.DATABASE_URL
    ? new DbConversationRepository(createPgDbConnection())
    : {
        async saveConversation(
          _request: ConversationRepositoryRequest,
        ): Promise<ConversationRepositoryResult> {
          return {
            ok: false,
            error: {
              code: "PERSISTENCE_FAILURE",
              message: "Talk V2 repository is not configured",
              retryable: false,
            },
          };
        },
      };

  return {
    authenticate: () => requireTalkV2Auth(),
    ensureEntitlement: (input) =>
      ensureTalkV2Entitlement({
        supabase: input.supabase,
        userId: input.userId,
        childId: input.childId,
      }),
    evaluateSafety: (message) => evaluateTalkV2Safety(message),
    buildContext: (input) =>
      buildFamilyContext({
        version: TALK_V2_CONTRACT_VERSION,
        childId: input.childId,
        sessionId: input.sessionId,
        parentMessage: input.parentMessage,
        supabase: input.supabase,
      }),
    buildPrompt: (input) =>
      buildPromptRequest({
        parentMessage: input.parentMessage,
        conversationHistory: input.conversationHistory,
        familyContext: input.familyContext,
        modelConfiguration: defaultModelConfiguration(),
      }),
    executeProvider: (request) =>
      executeLLMRequest(request, {
        provider,
        retryDelayMs: providerConfig.retryPolicy.retryDelayMs,
      }),
    validateResponse: (payload) => validateLLMResponse(payload),
    repository,
  };
}

async function measureAsync<T>(
  stage: StageName,
  timingsMs: TalkV2StageTimings,
  nowMs: () => number,
  execute: () => Promise<T>,
): Promise<T> {
  const start = nowMs();
  const value = await execute();
  timingsMs[stage] = nowMs() - start;
  return value;
}

function measureSync<T>(
  stage: StageName,
  timingsMs: TalkV2StageTimings,
  nowMs: () => number,
  execute: () => T,
): T {
  const start = nowMs();
  const value = execute();
  timingsMs[stage] = nowMs() - start;
  return value;
}

function withDefaults(
  overrides?: Partial<TalkV2OrchestratorDependencies>,
): TalkV2OrchestratorDependencies {
  return {
    ...createDefaultDependencies(),
    ...overrides,
  };
}

export async function orchestrateTalkV2Message(
  payload: TalkV2MessageRequest,
  options?: TalkV2OrchestratorOptions,
): Promise<TalkV2OrchestratorResult> {
  const requestId = options?.requestId || randomUUID();
  const nowMs = options?.nowMs || Date.now;
  const dependencies = withDefaults(options?.dependencies);

  const telemetry: TalkV2OrchestratorInternal = {
    requestId,
    timingsMs: createBaseTimings(),
    events: [],
  };

  const parentMessage = payload.message.trim();
  if (!parentMessage) {
    telemetry.events.push({ stage: "authentication", status: "stopped", error: "Message is required" });
    return {
      result: toErrorResult("Message is required"),
      internal: telemetry,
    };
  }

  try {
    const auth = await measureAsync("authentication", telemetry.timingsMs, nowMs, () =>
      dependencies.authenticate(),
    );
    telemetry.events.push({ stage: "authentication", status: "ok" });

    const entitlement = await dependencies.ensureEntitlement({
      supabase: auth.supabase,
      userId: auth.user.id,
      childId: payload.childId,
    });

    if (!entitlement.ok) {
      telemetry.events.push({ stage: "entitlement", status: "failed", error: entitlement.error });
      return {
        result: toErrorResult(entitlement.error),
        internal: telemetry,
      };
    }
    telemetry.events.push({ stage: "entitlement", status: "ok" });

    const safety = measureSync("safety", telemetry.timingsMs, nowMs, () =>
      dependencies.evaluateSafety(parentMessage),
    );
    telemetry.events.push({ stage: "safety", status: "ok" });

    if (safety.status !== "allow") {
      telemetry.events.push({ stage: "context", status: "stopped", error: "Blocked by safety" });
      return {
        result: {
          version: TALK_V2_CONTRACT_VERSION,
          status: "blocked",
          error: safety.userMessage || "Message blocked by safety policy.",
          safety,
        },
        internal: telemetry,
      };
    }

    const familyContext = await measureAsync("context", telemetry.timingsMs, nowMs, () =>
      dependencies.buildContext({
        supabase: auth.supabase,
        childId: payload.childId,
        sessionId: payload.sessionId,
        parentMessage,
      }),
    );
    telemetry.events.push({ stage: "context", status: "ok" });

    const prompt = measureSync("prompt", telemetry.timingsMs, nowMs, () =>
      dependencies.buildPrompt({
        parentMessage,
        conversationHistory: familyContext.recentConversation,
        familyContext,
      }),
    );
    telemetry.events.push({ stage: "prompt", status: "ok" });

    const providerConfig = defaultProviderConfig("openai");
    const llmRequest: LLMRequest = {
      version: TALK_V2_CONTRACT_VERSION,
      requestId,
      provider: providerConfig.provider,
      prompt,
      timeoutMs: providerConfig.timeoutMs,
      maxRetries: providerConfig.retryPolicy.maxRetries,
    };

    const providerResult = await measureAsync("provider", telemetry.timingsMs, nowMs, () =>
      dependencies.executeProvider(llmRequest),
    );

    if (!providerResult.ok) {
      telemetry.events.push({ stage: "provider", status: "failed", error: providerResult.error.code });
      return {
        result: toErrorResult(providerResult.error.message),
        internal: telemetry,
      };
    }
    telemetry.events.push({ stage: "provider", status: "ok" });

    const validationResult = measureSync("validation", telemetry.timingsMs, nowMs, () =>
      dependencies.validateResponse(providerResult.response),
    );

    if (!validationResult.ok) {
      telemetry.events.push({ stage: "validation", status: "failed", error: validationResult.error.code });
      return {
        result: toErrorResult(validationResult.error.message),
        internal: telemetry,
      };
    }
    telemetry.events.push({ stage: "validation", status: "ok" });

    const repositoryRequest: ConversationRepositoryRequest = {
      version: TALK_V2_CONTRACT_VERSION,
      requestId,
      sessionId: payload.sessionId,
      parentMessage,
      validatedAssistantResponse: validationResult.validated,
      pipelineVersion: TALK_V2_PIPELINE_VERSION,
      timestampIso: options?.timestampIso,
    };

    const persistenceResult = await measureAsync("persistence", telemetry.timingsMs, nowMs, () =>
      dependencies.repository.saveConversation(repositoryRequest),
    );

    if (!persistenceResult.ok) {
      telemetry.events.push({
        stage: "persistence",
        status: "failed",
        error: persistenceResult.error.code,
      });
      return {
        result: toErrorResult(persistenceResult.error.message),
        internal: telemetry,
      };
    }
    telemetry.events.push({ stage: "persistence", status: "ok" });

    return {
      result: {
        version: TALK_V2_CONTRACT_VERSION,
        status: "accepted",
        message: validationResult.validated.text,
        safety,
      },
      internal: telemetry,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Talk V2 orchestration failed";
    return {
      result: toErrorResult(message),
      internal: telemetry,
    };
  }
}
