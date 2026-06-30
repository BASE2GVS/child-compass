import type { LLMRequest, LLMProviderName } from "@/lib/talk-v2/contracts";

export type ProviderExecutionResult = {
  rawOutput: string;
  model: string;
  requestId?: string;
  statusCode?: number;
};

export interface TalkV2Provider {
  readonly name: LLMProviderName;
  execute(request: LLMRequest): Promise<ProviderExecutionResult>;
}
