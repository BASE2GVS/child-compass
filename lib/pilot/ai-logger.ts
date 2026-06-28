import path from "path";
import { appendJsonlLine, readJsonlFile } from "@/lib/server/local-file-log";
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
  await appendJsonlLine(LOG_PATH, { ts: new Date().toISOString(), ...entry });
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
  return readJsonlFile<AILogEntry>(LOG_PATH, limit);
}
