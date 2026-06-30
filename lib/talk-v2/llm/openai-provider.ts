import type { LLMRequest } from "@/lib/talk-v2/contracts";
import type { ProviderExecutionResult, TalkV2Provider } from "@/lib/talk-v2/llm/provider-interface";
import { ProviderExecutionError } from "@/lib/talk-v2/llm/provider-errors";

export type OpenAITransportResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  headers?: {
    get: (name: string) => string | null;
  };
};

export type OpenAITransport = (url: string, init: RequestInit) => Promise<OpenAITransportResponse>;

export type OpenAIProviderConfig = {
  apiKey: string;
  endpoint?: string;
  transport?: OpenAITransport;
};

function defaultTransport(url: string, init: RequestInit): Promise<OpenAITransportResponse> {
  return fetch(url, init) as Promise<OpenAITransportResponse>;
}

function toUserContent(request: LLMRequest): string {
  const history = request.prompt.conversationHistory
    .map((turn) => `${turn.role === "parent" ? "Parent" : "Child Compass"}: ${turn.content}`)
    .join("\n");

  return [
    "FamilyContext:",
    request.prompt.familyContext,
    "",
    "ConversationHistory:",
    history,
    "",
    "ParentMessage:",
    request.prompt.parentMessage,
  ].join("\n");
}

function mapHttpError(status: number, message: string): ProviderExecutionError {
  if (status === 401 || status === 403) {
    return new ProviderExecutionError({
      code: "AUTH_FAILED",
      message: `OpenAI authentication failed: ${message}`,
      retryable: false,
      statusCode: status,
    });
  }

  if (status === 429) {
    return new ProviderExecutionError({
      code: "RATE_LIMIT",
      message: `OpenAI rate limit: ${message}`,
      retryable: true,
      statusCode: status,
    });
  }

  if (status >= 500) {
    return new ProviderExecutionError({
      code: "PROVIDER_UNAVAILABLE",
      message: `OpenAI unavailable: ${message}`,
      retryable: true,
      statusCode: status,
    });
  }

  return new ProviderExecutionError({
    code: "NETWORK_ERROR",
    message: `OpenAI request failed: ${message}`,
    retryable: false,
    statusCode: status,
  });
}

export class OpenAIProvider implements TalkV2Provider {
  readonly name = "openai" as const;

  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly transport: OpenAITransport;

  constructor(config: OpenAIProviderConfig) {
    this.endpoint = config.endpoint ?? "https://api.openai.com/v1/chat/completions";
    this.apiKey = config.apiKey;
    this.transport = config.transport ?? defaultTransport;
  }

  async execute(request: LLMRequest): Promise<ProviderExecutionResult> {
    if (!this.apiKey) {
      throw new ProviderExecutionError({
        code: "AUTH_FAILED",
        message: "Missing OpenAI API key",
        retryable: false,
      });
    }

    let response: OpenAITransportResponse;
    try {
      response = await this.transport(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.prompt.modelConfiguration.model,
          temperature: request.prompt.modelConfiguration.temperature,
          max_tokens: request.prompt.modelConfiguration.maxTokens,
          messages: [
            {
              role: "system",
              content: request.prompt.systemInstruction,
            },
            {
              role: "user",
              content: toUserContent(request),
            },
          ],
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network request failed";
      throw new ProviderExecutionError({
        code: "NETWORK_ERROR",
        message,
        retryable: true,
      });
    }

    if (!response.ok) {
      throw mapHttpError(response.status, `HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawOutput = data?.choices?.[0]?.message?.content;
    if (typeof rawOutput !== "string") {
      throw new ProviderExecutionError({
        code: "INVALID_RESPONSE",
        message: "OpenAI response missing content",
        retryable: false,
        statusCode: response.status,
      });
    }

    return {
      rawOutput,
      model: request.prompt.modelConfiguration.model,
      requestId: response.headers?.get("x-request-id") || undefined,
      statusCode: response.status,
    };
  }
}
