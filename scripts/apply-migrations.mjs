/**
 * Apply SQL migration files to Supabase via direct Postgres connection.
 * Requires DATABASE_URL in .env.local (Supabase → Settings → Database → Connection string).
 */
import { readFileSync, readdirSync } from "fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const files = readdirSync("supabase/migrations")
  .filter((name) => /^(007|008)_.*\.sql$/.test(name))
  .sort();

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const file of files) {
    const sql = readFileSync(`supabase/migrations/${file}`, "utf8");
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`Applied ${file}`);
  }
  console.log("Migrations applied successfully.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await client.end();
}
