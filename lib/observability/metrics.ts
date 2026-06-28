import path from "path";
import { appendJsonlLine, readJsonlFile } from "@/lib/server/local-file-log";

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

export async function logError(source: string, error: unknown): Promise<void> {
  if (process.env.OBSERVABILITY_ENABLED !== "true") return;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  await appendJsonlLine(ERROR_LOG, { ts: new Date().toISOString(), source, message, stack } satisfies ErrorEvent);
}

export async function logPerformance(
  operation: string,
  durationMs: number,
  metadata?: Record<string, string | number>,
): Promise<void> {
  if (process.env.OBSERVABILITY_ENABLED !== "true") return;
  await appendJsonlLine(PERF_LOG, { ts: new Date().toISOString(), operation, durationMs, metadata } satisfies PerformanceMetric);
}

export async function readRecentErrors(limit = 50): Promise<ErrorEvent[]> {
  return readJsonlFile<ErrorEvent>(ERROR_LOG, limit);
}

export async function withPerformance<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    await logPerformance(operation, Date.now() - start);
  }
}
