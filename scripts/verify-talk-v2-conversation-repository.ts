import assert from "node:assert/strict";
import {
  TALK_V2_CONTRACT_VERSION,
  type ConversationRepositoryRequest,
  type ValidatedResponse,
} from "@/lib/talk-v2/contracts";
import { DbConversationRepository } from "@/lib/talk-v2/repository/db-conversation-repository";
import { TALK_V2_PIPELINE_VERSION } from "@/lib/talk-v2/repository/constants";

type QueryEntry = { sql: string; params?: unknown[] };

type FakeClientMode = "success" | "duplicate" | "transaction-fail" | "transaction-and-rollback-fail";

class FakeDbClient {
  entries: QueryEntry[] = [];
  released = false;
  private mode: FakeClientMode;
  private assistantId = "assistant-1";

  constructor(mode: FakeClientMode) {
    this.mode = mode;
  }

  async query(sql: string, params?: unknown[]) {
    this.entries.push({ sql, params });
    const trimmed = sql.trim().toUpperCase();

    if (trimmed === "BEGIN") return { rows: [], rowCount: 0 };

    if (trimmed.startsWith("SELECT ID, CREATED_AT")) {
      if (this.mode === "duplicate") {
        return {
          rows: [{ id: this.assistantId, created_at: "2026-06-30T10:00:00.000Z" }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }

    if (trimmed.startsWith("INSERT INTO COACH_MESSAGES") && trimmed.includes("'PARENT'")) {
      if (this.mode === "transaction-fail" || this.mode === "transaction-and-rollback-fail") {
        throw new Error("parent insert failed");
      }
      return { rows: [{ id: "parent-1" }], rowCount: 1 };
    }

    if (trimmed.startsWith("INSERT INTO COACH_MESSAGES") && trimmed.includes("'ASSISTANT'")) {
      if (this.mode === "transaction-fail" || this.mode === "transaction-and-rollback-fail") {
        throw new Error("assistant insert failed");
      }
      return { rows: [{ id: this.assistantId }], rowCount: 1 };
    }

    if (trimmed === "ROLLBACK") {
      if (this.mode === "transaction-and-rollback-fail") {
        throw new Error("rollback failed");
      }
      return { rows: [], rowCount: 0 };
    }

    if (trimmed === "COMMIT") {
      return { rows: [], rowCount: 0 };
    }

    return { rows: [], rowCount: 0 };
  }

  release() {
    this.released = true;
  }
}

class FakeDbConnection {
  public readonly client: FakeDbClient;

  constructor(mode: FakeClientMode) {
    this.client = new FakeDbClient(mode);
  }

  async connect() {
    return this.client;
  }
}

function makeValidatedResponse(text = "Validated assistant response"): ValidatedResponse {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    text,
    metadata: {
      validatorVersion: "1.0.0",
      contractVersion: TALK_V2_CONTRACT_VERSION,
      originalLength: text.length,
      validatedLength: text.length,
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
      requestId: "req-provider-1",
      statusCode: 200,
      latencyMs: 32,
      attempts: 1,
    },
  };
}

function makeRequest(overrides?: Partial<ConversationRepositoryRequest>): ConversationRepositoryRequest {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    requestId: "req-1",
    sessionId: "session-1",
    parentMessage: "Parent message",
    validatedAssistantResponse: makeValidatedResponse(),
    pipelineVersion: TALK_V2_PIPELINE_VERSION,
    timestampIso: "2026-06-30T10:00:00.000Z",
    ...overrides,
  };
}

async function testSuccessfulSave() {
  const db = new FakeDbConnection("success");
  const repo = new DbConversationRepository(db);
  const result = await repo.saveConversation(makeRequest());

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected successful save");
  assert.equal(result.record.status, "saved");
  if (result.record.status !== "saved") throw new Error("Expected saved record");
  assert.equal(result.record.parentMessageId, "parent-1");
  assert.equal(result.record.assistantMessageId, "assistant-1");

  const sql = db.client.entries.map((x) => x.sql.trim().toUpperCase());
  assert.ok(sql.includes("BEGIN"));
  assert.ok(sql.includes("COMMIT"));
  assert.equal(db.client.released, true);
}

async function testDuplicateHandling() {
  const db = new FakeDbConnection("duplicate");
  const repo = new DbConversationRepository(db);
  const result = await repo.saveConversation(makeRequest());

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Expected duplicate save result");
  assert.equal(result.record.status, "duplicate");
  assert.equal(result.record.assistantMessageId, "assistant-1");

  const insertQueries = db.client.entries.filter((x) => x.sql.toUpperCase().includes("INSERT INTO COACH_MESSAGES"));
  assert.equal(insertQueries.length, 0);
}

async function testTransactionRollback() {
  const db = new FakeDbConnection("transaction-fail");
  const repo = new DbConversationRepository(db);
  const result = await repo.saveConversation(makeRequest());

  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected transaction failure");
  assert.equal(result.error.code, "TRANSACTION_FAILED");

  const rollbackIssued = db.client.entries.some((x) => x.sql.trim().toUpperCase() === "ROLLBACK");
  assert.equal(rollbackIssued, true);
}

async function testRollbackFailure() {
  const db = new FakeDbConnection("transaction-and-rollback-fail");
  const repo = new DbConversationRepository(db);
  const result = await repo.saveConversation(makeRequest());

  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected rollback failure");
  assert.equal(result.error.code, "ROLLBACK_FAILED");
}

async function testPersistenceFailureInvalidInput() {
  const db = new FakeDbConnection("success");
  const repo = new DbConversationRepository(db);
  const result = await repo.saveConversation(
    makeRequest({
      parentMessage: "   ",
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected invalid input failure");
  assert.equal(result.error.code, "INVALID_INPUT");
}

async function testMetadataPersistence() {
  const db = new FakeDbConnection("success");
  const repo = new DbConversationRepository(db);
  await repo.saveConversation(makeRequest({ requestId: "req-meta" }));

  const insert = db.client.entries.find((x) =>
    x.sql.toUpperCase().includes("INSERT INTO COACH_MESSAGES") && x.sql.toUpperCase().includes("'ASSISTANT'"),
  );
  assert.ok(insert);
  if (!insert || !insert.params) throw new Error("Expected assistant insert params");

  const metadataJson = String(insert.params[2]);
  const parsed = JSON.parse(metadataJson) as Record<string, unknown>;
  assert.equal(parsed.request_id, "req-meta");
  assert.equal(parsed.pipeline_version, TALK_V2_PIPELINE_VERSION);
}

async function run() {
  await testSuccessfulSave();
  await testDuplicateHandling();
  await testTransactionRollback();
  await testRollbackFailure();
  await testPersistenceFailureInvalidInput();
  await testMetadataPersistence();
  console.log("Talk V2 conversation repository checks passed.");
}

run();
