import { createHash } from "crypto";
import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";
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

  await mkdir(path.dirname(ANALYTICS_PATH), { recursive: true });
  await appendFile(ANALYTICS_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function readProductAnalytics(limit = 200): Promise<ProductEvent[]> {
  try {
    const raw = await readFile(ANALYTICS_PATH, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as ProductEvent);
  } catch {
    return [];
  }
}

export function summariseAnalytics(events: ProductEvent[]) {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1;
  }
  return counts;
}
