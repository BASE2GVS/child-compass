import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { hashId } from "@/lib/pilot/product-analytics";

export type AILogEntry = {
  ts: string;
  source: "debrief" | "coach" | "insight" | "report" | "weekly_review";
  childHash: string;
  confidence?: number;
  summary: string;
};

const LOG_PATH = path.join(process.cwd(), "data", "ai-logs.jsonl");

export async function logAIInteraction(entry: Omit<AILogEntry, "ts">): Promise<void> {
  const row: AILogEntry = { ts: new Date().toISOString(), ...entry };
  await mkdir(path.dirname(LOG_PATH), { recursive: true });
  await appendFile(LOG_PATH, `${JSON.stringify(row)}\n`, "utf8");
}

export async function logAIForChild(
  source: AILogEntry["source"],
  childId: string,
  summary: string,
  confidence?: number,
): Promise<void> {
  await logAIInteraction({
    source,
    childHash: hashId(childId),
    summary: summary.slice(0, 240),
    confidence,
  });
}

export async function readAILogs(limit = 100): Promise<AILogEntry[]> {
  try {
    const raw = await readFile(LOG_PATH, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as AILogEntry);
  } catch {
    return [];
  }
}
