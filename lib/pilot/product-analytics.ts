import { createHash } from "crypto";
import path from "path";
import { appendJsonlLine, readJsonlFile } from "@/lib/server/local-file-log";
import { readPilotConfig } from "@/lib/pilot/config";

export type ProductEventName =
  | "checkin_completed"
  | "debrief_completed"
  | "coach_message_sent"
  | "report_generated"
  | "onboarding_completed"
  | "login"
  | "page_view"
  | "pilot_feedback_submitted";

export type ProductEvent = {
  ts: string;
  event: ProductEventName;
  feature?: string;
  familyHash?: string;
  metadata?: Record<string, string | number | boolean>;
};

const ANALYTICS_PATH = path.join(process.cwd(), "data", "product-analytics.jsonl");

const inMemoryEvents: ProductEvent[] = [];
const IN_MEMORY_CAP = 500;

export function hashId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export async function trackProductEvent(input: {
  event: ProductEventName;
  feature?: string;
  familyId?: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<void> {
  const config = await readPilotConfig();
  if (!config.analyticsEnabled && process.env.PRODUCT_ANALYTICS_ENABLED !== "true") {
    return;
  }

  const entry: ProductEvent = {
    ts: new Date().toISOString(),
    event: input.event,
    feature: input.feature,
    familyHash: input.familyId ? hashId(input.familyId) : undefined,
    metadata: input.metadata,
  };

  inMemoryEvents.push(entry);
  if (inMemoryEvents.length > IN_MEMORY_CAP) {
    inMemoryEvents.splice(0, inMemoryEvents.length - IN_MEMORY_CAP);
  }

  await appendJsonlLine(ANALYTICS_PATH, entry);
}

export async function readProductAnalytics(limit = 200): Promise<ProductEvent[]> {
  const fromDisk = await readJsonlFile<ProductEvent>(ANALYTICS_PATH, limit);
  if (fromDisk.length > 0) return fromDisk;
  return inMemoryEvents.slice(-limit);
}

export function summariseAnalytics(events: ProductEvent[]) {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1;
  }
  return counts;
}
