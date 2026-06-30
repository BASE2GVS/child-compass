import type { ProviderError } from "@/lib/talk-v2/contracts";

export class ProviderExecutionError extends Error {
  code: ProviderError["code"];
  statusCode?: number;
  retryable: boolean;

  constructor(params: {
    code: ProviderError["code"];
    message: string;
    retryable: boolean;
    statusCode?: number;
  }) {
    super(params.message);
    this.name = "ProviderExecutionError";
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.retryable = params.retryable;
  }
}

export function mapUnknownProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderExecutionError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      statusCode: error.statusCode,
    };
  }

  const message = error instanceof Error ? error.message : "Unknown provider error";
  return {
    code: "UNKNOWN",
    message,
    retryable: false,
  };
}
