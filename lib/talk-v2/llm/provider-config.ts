import type { LLMProviderName } from "@/lib/talk-v2/contracts";

export type LLMRetryPolicy = {
  maxRetries: number;
  retryDelayMs: number;
};

export type LLMProviderConfig = {
  provider: LLMProviderName;
  timeoutMs: number;
  retryPolicy: LLMRetryPolicy;
};

export function defaultProviderConfig(provider: LLMProviderName = "openai"): LLMProviderConfig {
  return {
    provider,
    timeoutMs: 12000,
    retryPolicy: {
      maxRetries: 1,
      retryDelayMs: 100,
    },
  };
}
