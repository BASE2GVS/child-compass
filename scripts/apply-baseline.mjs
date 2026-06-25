/**
 * Apply the production baseline to a brand-new Supabase Postgres database.
 * Requires DATABASE_URL in .env.local (Supabase → Project Settings → Database → URI).
 *
 * Usage: node scripts/apply-baseline.mjs
 */
import { readFileSync } from "fs";
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
  console.error("Add your Supabase Postgres connection string, then re-run.");
  process.exit(1);
}

const sql = readFileSync("supabase/baseline/001_production_schema.sql", "utf8");
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Applying supabase/baseline/001_production_schema.sql ...");
  await client.query(sql);
  console.log("Production baseline applied successfully.");
} catch (error) {
  console.error("Baseline apply failed:", error);
  process.exit(1);
} finally {
  await client.end();
}
