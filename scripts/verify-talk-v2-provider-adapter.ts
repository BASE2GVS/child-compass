import assert from "node:assert/strict";
import {
  TALK_V2_CONTRACT_VERSION,
  type LLMRequest,
  type PromptRequest,
} from "@/lib/talk-v2/contracts";
import { executeLLMRequest } from "@/lib/talk-v2/llm/provider-adapter";
import { OpenAIProvider } from "@/lib/talk-v2/llm/openai-provider";
import { ProviderExecutionError } from "@/lib/talk-v2/llm/provider-errors";
import type { TalkV2Provider } from "@/lib/talk-v2/llm/provider-interface";

function makePromptRequest(): PromptRequest {
  return {
    promptVersion: "1.0.0",
    systemInstruction: "System instruction",
    familyContext: "{\"childId\":\"child-1\"}",
    conversationHistory: [
      {
        role: "parent",
        content: "School was hard.",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ],
    parentMessage: "What should we do tomorrow?",
    modelConfiguration: {
      model: "gpt-4o-mini",
      temperature: 0.4,
      maxTokens: 800,
    },
    metadata: {
      contractVersion: TALK_V2_CONTRACT_VERSION,
      contextVersion: TALK_V2_CONTRACT_VERSION,
      trace: {
        conversationTurns: 1,
        contextSourcesSelected: 2,
        memoryItems: 1,
        intents: 1,
        conversationState: "FOLLOW_UP",
      },
    },
  };
}

function makeLLMRequest(overrides?: Partial<LLMRequest>): LLMRequest {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    requestId: "req-1",
    provider: "openai",
    prompt: makePromptRequest(),
    timeoutMs: 100,
    maxRetries: 1,
    ...overrides,
  };
}

class MockProvider implements TalkV2Provider {
  readonly name = "openai" as const;
  private calls = 0;
  constructor(
    private steps: Array<
      | { type: "success"; output: string; statusCode?: number; requestId?: string }
      | { type: "error"; error: Error }
      | { type: "hang" }
    >,
  ) {}

  get callCount(): number {
    return this.calls;
  }

  async execute(_request: LLMRequest) {
    this.calls += 1;
    const step = this.steps[Math.min(this.calls - 1, this.steps.length - 1)];
    if (!step) {
      throw new Error("No step configured");
    }

    if (step.type === "hang") {
      return new Promise<never>(() => {
        // Intentionally never resolves to trigger timeout.
      });
    }

    if (step.type === "error") {
      throw step.error;
    }

    return {
      rawOutput: step.output,
      model: "gpt-4o-mini",
      requestId: step.requestId,
      statusCode: step.statusCode,
    };
  }
}

async function testSuccessfulRequest() {
  const provider = new MockProvider([
    { type: "success", output: "RAW_RESPONSE", statusCode: 200, requestId: "openai-1" },
  ]);
  const result = await executeLLMRequest(makeLLMRequest(), { provider, retryDelayMs: 0 });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected success result");

  assert.equal(result.response.rawOutput, "RAW_RESPONSE");
  assert.equal(result.response.metadata.provider, "openai");
  assert.equal(result.response.metadata.statusCode, 200);
  assert.equal(result.response.metadata.requestId, "openai-1");
  assert.equal(result.response.metadata.attempts, 1);
}

async function testTimeout() {
  const provider = new MockProvider([{ type: "hang" }, { type: "hang" }]);
  const result = await executeLLMRequest(makeLLMRequest({ timeoutMs: 10, maxRetries: 0 }), {
    provider,
    retryDelayMs: 0,
  });

  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected timeout failure");
  assert.equal(result.error.code, "TIMEOUT");
}

async function testProviderUnavailable() {
  const provider = new MockProvider([
    {
      type: "error",
      error: new ProviderExecutionError({
        code: "PROVIDER_UNAVAILABLE",
        message: "Service unavailable",
        retryable: true,
        statusCode: 503,
      }),
    },
  ]);

  const result = await executeLLMRequest(makeLLMRequest({ maxRetries: 0 }), { provider, retryDelayMs: 0 });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected provider unavailable failure");
  assert.equal(result.error.code, "PROVIDER_UNAVAILABLE");
  assert.equal(result.error.statusCode, 503);
}

async function testInvalidApiKey() {
  const provider = new OpenAIProvider({
    apiKey: "bad-key",
    transport: async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
      headers: { get: () => null },
    }),
  });

  const result = await executeLLMRequest(makeLLMRequest({ maxRetries: 0 }), { provider, retryDelayMs: 0 });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected auth failure");
  assert.equal(result.error.code, "AUTH_FAILED");
}

async function testRetryBehavior() {
  const provider = new MockProvider([
    {
      type: "error",
      error: new ProviderExecutionError({
        code: "PROVIDER_UNAVAILABLE",
        message: "Temporary outage",
        retryable: true,
        statusCode: 503,
      }),
    },
    { type: "success", output: "RAW_AFTER_RETRY", statusCode: 200 },
  ]);

  const result = await executeLLMRequest(makeLLMRequest({ maxRetries: 1 }), { provider, retryDelayMs: 0 });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected retry success");
  assert.equal(result.response.rawOutput, "RAW_AFTER_RETRY");
  assert.equal(result.response.metadata.attempts, 2);
  assert.equal(provider.callCount, 2);
}

async function testInvalidResponse() {
  const provider = new OpenAIProvider({
    apiKey: "test-key",
    transport: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: {} }] }),
      headers: { get: () => "req-invalid" },
    }),
  });

  const result = await executeLLMRequest(makeLLMRequest({ maxRetries: 0 }), { provider, retryDelayMs: 0 });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected invalid response failure");
  assert.equal(result.error.code, "INVALID_RESPONSE");
}

async function testMetadataCapture() {
  const provider = new OpenAIProvider({
    apiKey: "test-key",
    transport: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "RAW_OPENAI_OUTPUT",
            },
          },
        ],
      }),
      headers: { get: (name: string) => (name === "x-request-id" ? "req-meta" : null) },
    }),
  });

  const result = await executeLLMRequest(makeLLMRequest({ maxRetries: 0 }), { provider, retryDelayMs: 0 });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected metadata success");

  assert.equal(result.response.rawOutput, "RAW_OPENAI_OUTPUT");
  assert.equal(result.response.metadata.provider, "openai");
  assert.equal(result.response.metadata.model, "gpt-4o-mini");
  assert.equal(result.response.metadata.requestId, "req-meta");
  assert.equal(result.response.metadata.statusCode, 200);
  assert.ok(result.response.metadata.latencyMs >= 0);
}

async function run() {
  await testSuccessfulRequest();
  await testTimeout();
  await testProviderUnavailable();
  await testInvalidApiKey();
  await testRetryBehavior();
  await testInvalidResponse();
  await testMetadataCapture();
  console.log("Talk V2 provider adapter checks passed.");
}

run();
