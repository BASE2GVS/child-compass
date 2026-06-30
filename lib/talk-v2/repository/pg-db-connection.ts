import type {
  DbConnection,
  DbQueryResult,
} from "@/lib/talk-v2/repository/db-conversation-repository";

type PgClient = {
  query: (sql: string, params?: unknown[]) => Promise<DbQueryResult>;
  release: () => void;
};

type PgPool = {
  connect: () => Promise<PgClient>;
};

let pool: PgPool | null = null;

function loadPgPool(): PgPool {
  if (pool) return pool;

  // Use require here so this module remains independent from TypeScript pg typings.
  const pg = require("pg") as { Pool: new (config: { connectionString: string }) => PgPool };

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool = new pg.Pool({ connectionString });
  return pool;
}

export function createPgDbConnection(): DbConnection {
  return {
    async connect() {
      const currentPool = loadPgPool();
      const client = await currentPool.connect();
      return {
        query: (sql: string, params?: unknown[]) => client.query(sql, params),
        release: () => client.release(),
      };
    },
  };
}
