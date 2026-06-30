import {
  TALK_V2_CONTRACT_VERSION,
  type LLMProviderResult,
  type LLMRequest,
} from "@/lib/talk-v2/contracts";
import type { TalkV2Provider } from "@/lib/talk-v2/llm/provider-interface";
import { mapUnknownProviderError, ProviderExecutionError } from "@/lib/talk-v2/llm/provider-errors";

function nowMs(): number {
  return Date.now();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new ProviderExecutionError({
          code: "TIMEOUT",
          message: "Provider request timed out",
          retryable: true,
        }),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

export type ExecuteLLMOptions = {
  provider: TalkV2Provider;
  retryDelayMs?: number;
};

export async function executeLLMRequest(
  request: LLMRequest,
  options: ExecuteLLMOptions,
): Promise<LLMProviderResult> {
  const startedAt = nowMs();
  let attempts = 0;
  const maxAttempts = Math.max(1, request.maxRetries + 1);

  while (attempts < maxAttempts) {
    attempts += 1;

    try {
      const result = await withTimeout(options.provider.execute(request), request.timeoutMs);
      const latencyMs = nowMs() - startedAt;

      return {
        ok: true,
        response: {
          version: TALK_V2_CONTRACT_VERSION,
          rawOutput: result.rawOutput,
          metadata: {
            provider: options.provider.name,
            model: result.model,
            requestId: result.requestId,
            statusCode: result.statusCode,
            latencyMs,
            attempts,
          },
        },
      };
    } catch (error) {
      const mapped = mapUnknownProviderError(error);
      const canRetry = mapped.retryable && attempts < maxAttempts;
      if (canRetry) {
        await delay(options.retryDelayMs ?? 0);
        continue;
      }

      const latencyMs = nowMs() - startedAt;
      return {
        ok: false,
        error: mapped,
        metadata: {
          provider: options.provider.name,
          model: request.prompt.modelConfiguration.model,
          statusCode: mapped.statusCode,
          latencyMs,
          attempts,
        },
      };
    }
  }

  return {
    ok: false,
    error: {
      code: "UNKNOWN",
      message: "Provider adapter reached an unexpected state",
      retryable: false,
    },
    metadata: {
      provider: options.provider.name,
      model: request.prompt.modelConfiguration.model,
      latencyMs: nowMs() - startedAt,
      attempts,
    },
  };
}
