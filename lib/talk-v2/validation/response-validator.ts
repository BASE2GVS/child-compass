import {
  TALK_V2_CONTRACT_VERSION,
  type LLMResponse,
  type ValidationMetadata,
  type ValidationResult,
} from "@/lib/talk-v2/contracts";
import {
  DEFAULT_VALIDATION_MAX_LENGTH,
  TALK_V2_VALIDATOR_VERSION,
} from "@/lib/talk-v2/validation/constants";

export type ValidateResponseOptions = {
  maxLength?: number;
  trimEdgeWhitespace?: boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProviderMetadata(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    typeof value.provider === "string" &&
    typeof value.model === "string" &&
    typeof value.latencyMs === "number" &&
    typeof value.attempts === "number"
  );
}

function isLLMResponse(value: unknown): value is LLMResponse {
  if (!isObject(value)) return false;
  return (
    value.version === TALK_V2_CONTRACT_VERSION &&
    typeof value.rawOutput === "string" &&
    isProviderMetadata(value.metadata)
  );
}

function hasInvalidEncodingSignals(text: string): boolean {
  // U+FFFD usually indicates decoding failure from byte streams.
  return text.includes("\uFFFD");
}

function removeInvalidCharacters(text: string): { next: string; removed: number } {
  let removed = 0;
  const next = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, () => {
    removed += 1;
    return "";
  });
  return { next, removed };
}

function normalizeNewlines(text: string): { next: string; changed: boolean } {
  const next = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return { next, changed: next !== text };
}

function trimEdges(text: string, enabled: boolean): { next: string; trimmed: boolean } {
  if (!enabled) return { next: text, trimmed: false };
  const next = text.trim();
  return { next, trimmed: next !== text };
}

function buildMetadata(params: {
  originalLength: number;
  validatedLength: number;
  newlineNormalized: boolean;
  invalidCharsRemoved: number;
  bomRemoved: boolean;
  edgeWhitespaceTrimmed: boolean;
  maxLength: number;
}): ValidationMetadata {
  return {
    validatorVersion: TALK_V2_VALIDATOR_VERSION,
    contractVersion: TALK_V2_CONTRACT_VERSION,
    originalLength: params.originalLength,
    validatedLength: params.validatedLength,
    normalizationApplied: {
      newlineNormalized: params.newlineNormalized,
      invalidCharsRemoved: params.invalidCharsRemoved,
      bomRemoved: params.bomRemoved,
      edgeWhitespaceTrimmed: params.edgeWhitespaceTrimmed,
    },
    maxLength: params.maxLength,
  };
}

export function validateLLMResponse(
  payload: unknown,
  options?: ValidateResponseOptions,
): ValidationResult {
  if (!isObject(payload)) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_PAYLOAD",
        message: "Provider payload must be an object",
      },
    };
  }

  if (!isLLMResponse(payload)) {
    return {
      ok: false,
      error: {
        code: "INVALID_SCHEMA",
        message: "Payload does not match LLMResponse schema",
      },
    };
  }

  const maxLength = options?.maxLength ?? DEFAULT_VALIDATION_MAX_LENGTH;
  const trimEdgeWhitespace = options?.trimEdgeWhitespace ?? false;

  const original = payload.rawOutput;
  if (typeof original !== "string") {
    return {
      ok: false,
      error: {
        code: "MISSING_CONTENT",
        message: "Provider response content is missing",
      },
      providerMetadata: payload.metadata,
    };
  }

  if (original.length === 0) {
    return {
      ok: false,
      error: {
        code: "EMPTY_RESPONSE",
        message: "Provider response content is empty",
      },
      providerMetadata: payload.metadata,
    };
  }

  if (hasInvalidEncodingSignals(original)) {
    return {
      ok: false,
      error: {
        code: "INVALID_ENCODING",
        message: "Provider response contains invalid encoding markers",
      },
      providerMetadata: payload.metadata,
    };
  }

  const hadBom = original.charCodeAt(0) === 0xfeff;
  let next = hadBom ? original.slice(1) : original;

  const newlineResult = normalizeNewlines(next);
  next = newlineResult.next;

  const invalidCharsResult = removeInvalidCharacters(next);
  next = invalidCharsResult.next;

  const trimResult = trimEdges(next, trimEdgeWhitespace);
  next = trimResult.next;

  if (next.length === 0) {
    const metadata = buildMetadata({
      originalLength: original.length,
      validatedLength: next.length,
      newlineNormalized: newlineResult.changed,
      invalidCharsRemoved: invalidCharsResult.removed,
      bomRemoved: hadBom,
      edgeWhitespaceTrimmed: trimResult.trimmed,
      maxLength,
    });
    return {
      ok: false,
      error: {
        code: "EMPTY_RESPONSE",
        message: "Response became empty after technical validation",
      },
      metadata,
      providerMetadata: payload.metadata,
    };
  }

  if (next.length > maxLength) {
    const metadata = buildMetadata({
      originalLength: original.length,
      validatedLength: next.length,
      newlineNormalized: newlineResult.changed,
      invalidCharsRemoved: invalidCharsResult.removed,
      bomRemoved: hadBom,
      edgeWhitespaceTrimmed: trimResult.trimmed,
      maxLength,
    });

    return {
      ok: false,
      error: {
        code: "OVERSIZED_RESPONSE",
        message: "Response exceeds configured maximum length",
      },
      metadata,
      providerMetadata: payload.metadata,
    };
  }

  const metadata = buildMetadata({
    originalLength: original.length,
    validatedLength: next.length,
    newlineNormalized: newlineResult.changed,
    invalidCharsRemoved: invalidCharsResult.removed,
    bomRemoved: hadBom,
    edgeWhitespaceTrimmed: trimResult.trimmed,
    maxLength,
  });

  return {
    ok: true,
    validated: {
      version: TALK_V2_CONTRACT_VERSION,
      text: next,
      metadata,
      providerMetadata: payload.metadata,
    },
  };
}
