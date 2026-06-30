import assert from "node:assert/strict";
import { TALK_V2_CONTRACT_VERSION, type LLMResponse } from "@/lib/talk-v2/contracts";
import { validateLLMResponse } from "@/lib/talk-v2/validation/response-validator";

function makeResponse(rawOutput: string): LLMResponse {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    rawOutput,
    metadata: {
      provider: "openai",
      model: "gpt-4o-mini",
      requestId: "req-1",
      statusCode: 200,
      latencyMs: 42,
      attempts: 1,
    },
  };
}

function testValidResponse() {
  const payload = makeResponse("This is a valid response.");
  const result = validateLLMResponse(payload);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected valid result");
  assert.equal(result.validated.text, "This is a valid response.");
  assert.equal(result.validated.metadata.normalizationApplied.newlineNormalized, false);
  assert.equal(result.validated.metadata.normalizationApplied.invalidCharsRemoved, 0);
}

function testBytePreservation() {
  const payload = makeResponse("Same bytes please.");
  const a = validateLLMResponse(payload);
  const b = validateLLMResponse(payload);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  if (!a.ok || !b.ok) throw new Error("Expected valid result");
  assert.equal(a.validated.text, b.validated.text);
  assert.equal(a.validated.text, payload.rawOutput);
}

function testEmptyResponse() {
  const payload = makeResponse("");
  const result = validateLLMResponse(payload);
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected empty failure");
  assert.equal(result.error.code, "EMPTY_RESPONSE");
}

function testInvalidPayload() {
  const result = validateLLMResponse({ version: TALK_V2_CONTRACT_VERSION });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected invalid schema failure");
  assert.equal(result.error.code, "INVALID_SCHEMA");
}

function testOversizedResponse() {
  const text = "a".repeat(120);
  const payload = makeResponse(text);
  const result = validateLLMResponse(payload, { maxLength: 100 });
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected oversized failure");
  assert.equal(result.error.code, "OVERSIZED_RESPONSE");
}

function testInvalidEncoding() {
  const payload = makeResponse("Bad char: \uFFFD");
  const result = validateLLMResponse(payload);
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected invalid encoding failure");
  assert.equal(result.error.code, "INVALID_ENCODING");
}

function testUnsupportedPayload() {
  const result = validateLLMResponse("not-an-object");
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected unsupported payload failure");
  assert.equal(result.error.code, "UNSUPPORTED_PAYLOAD");
}

function testAllowedTechnicalNormalization() {
  const payload = makeResponse("\uFEFFHello\r\nworld\u0000");
  const result = validateLLMResponse(payload, { trimEdgeWhitespace: false });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected normalized valid result");
  assert.equal(result.validated.text, "Hello\nworld");
  assert.equal(result.validated.metadata.normalizationApplied.bomRemoved, true);
  assert.equal(result.validated.metadata.normalizationApplied.newlineNormalized, true);
  assert.equal(result.validated.metadata.normalizationApplied.invalidCharsRemoved, 1);
}

function run() {
  testValidResponse();
  testBytePreservation();
  testEmptyResponse();
  testInvalidPayload();
  testOversizedResponse();
  testInvalidEncoding();
  testUnsupportedPayload();
  testAllowedTechnicalNormalization();
  console.log("Talk V2 response validation checks passed.");
}

run();
