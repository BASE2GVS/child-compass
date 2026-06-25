import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";

export type ErrorEvent = {
  ts: string;
  source: string;
  message: string;
  stack?: string;
};

export type PerformanceMetric = {
  ts: string;
  operation: string;
  durationMs: number;
  metadata?: Record<string, string | number>;
};

const ERROR_LOG = path.join(process.cwd(), "data", "error-events.jsonl");
const PERF_LOG = path.join(process.cwd(), "data", "performance-metrics.jsonl");

async function appendJsonl(file: string, row: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
}

export async function logError(source: string, error: unknown): Promise<void> {
  if (process.env.OBSERVABILITY_ENABLED !== "true") return;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  await appendJsonl(ERROR_LOG, { ts: new Date().toISOString(), source, message, stack } satisfies ErrorEvent);
}

export async function logPerformance(
  operation: string,
  durationMs: number,
  metadata?: Record<string, string | number>,
): Promise<void> {
  if (process.env.OBSERVABILITY_ENABLED !== "true") return;
  await appendJsonl(PERF_LOG, { ts: new Date().toISOString(), operation, durationMs, metadata } satisfies PerformanceMetric);
}

export async function readRecentErrors(limit = 50): Promise<ErrorEvent[]> {
  try {
    const raw = await readFile(ERROR_LOG, "utf8");
    return raw.trim().split("\n").filter(Boolean).slice(-limit).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export async function withPerformance<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    await logPerformance(operation, Date.now() - start);
  }
}
