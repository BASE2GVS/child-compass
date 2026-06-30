import type {
  ConversationRepositoryRequest,
  ConversationRepositoryResult,
} from "@/lib/talk-v2/contracts";
import type { TalkV2ConversationRepository } from "@/lib/talk-v2/repository/repository-interface";

export type DbQueryResult<T = Record<string, unknown>> = {
  rows: T[];
  rowCount: number;
};

export type DbTransactionClient = {
  query: (sql: string, params?: unknown[]) => Promise<DbQueryResult>;
};

export type DbConnection = {
  connect: () => Promise<DbTransactionClient & { release: () => void }>;
};

function nowIso(input?: string): string {
  return input || new Date().toISOString();
}

function invalidInput(message: string): ConversationRepositoryResult {
  return {
    ok: false,
    error: {
      code: "INVALID_INPUT",
      message,
      retryable: false,
    },
  };
}

function buildMetadata(request: ConversationRepositoryRequest): string {
  return JSON.stringify({
    request_id: request.requestId,
    pipeline_version: request.pipelineVersion,
    validation: request.validatedAssistantResponse.metadata,
    provider: request.validatedAssistantResponse.providerMetadata,
    contract_version: request.version,
  });
}

export class DbConversationRepository implements TalkV2ConversationRepository {
  constructor(private readonly db: DbConnection) {}

  async saveConversation(request: ConversationRepositoryRequest): Promise<ConversationRepositoryResult> {
    if (!request.sessionId.trim()) return invalidInput("sessionId is required");
    if (!request.requestId.trim()) return invalidInput("requestId is required");
    if (!request.parentMessage.trim()) return invalidInput("parentMessage is required");
    if (!request.validatedAssistantResponse.text.trim()) {
      return invalidInput("validated assistant response is required");
    }

    const createdAt = nowIso(request.timestampIso);
    const metadata = buildMetadata(request);

    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const duplicate = await client.query(
        `
          SELECT id, created_at
          FROM coach_messages
          WHERE session_id = $1
            AND role = 'assistant'
            AND metadata->>'request_id' = $2
          LIMIT 1
        `,
        [request.sessionId, request.requestId],
      );

      if (duplicate.rowCount > 0) {
        await client.query("COMMIT");
        const row = duplicate.rows[0] as { id: string; created_at?: string };
        return {
          ok: true,
          record: {
            status: "duplicate",
            assistantMessageId: row.id,
            createdAt: row.created_at || createdAt,
          },
        };
      }

      const parentInsert = await client.query(
        `
          INSERT INTO coach_messages (session_id, role, content, metadata, created_at)
          VALUES ($1, 'parent', $2, $3::jsonb, $4)
          RETURNING id
        `,
        [request.sessionId, request.parentMessage, metadata, createdAt],
      );

      const assistantInsert = await client.query(
        `
          INSERT INTO coach_messages (session_id, role, content, metadata, created_at)
          VALUES ($1, 'assistant', $2, $3::jsonb, $4)
          RETURNING id
        `,
        [request.sessionId, request.validatedAssistantResponse.text, metadata, createdAt],
      );

      await client.query("COMMIT");

      const parentRow = parentInsert.rows[0] as { id: string };
      const assistantRow = assistantInsert.rows[0] as { id: string };

      return {
        ok: true,
        record: {
          status: "saved",
          parentMessageId: parentRow.id,
          assistantMessageId: assistantRow.id,
          createdAt,
        },
      };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        return {
          ok: false,
          error: {
            code: "ROLLBACK_FAILED",
            message: "Transaction rollback failed",
            retryable: true,
          },
        };
      }

      const message = error instanceof Error ? error.message : "Persistence failure";
      return {
        ok: false,
        error: {
          code: "TRANSACTION_FAILED",
          message,
          retryable: true,
        },
      };
    } finally {
      client.release();
    }
  }
}
