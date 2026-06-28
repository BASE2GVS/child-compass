import path from "path";
import { readJsonlFile } from "@/lib/server/local-file-log";
import { readPilotConfig } from "@/lib/pilot/config";
import { readProductAnalytics, summariseAnalytics } from "@/lib/pilot/product-analytics";
import { readAILogs } from "@/lib/pilot/ai-logger";

export async function buildDiagnostics() {
  const config = await readPilotConfig();
  const analytics = await readProductAnalytics(500);
  const aiLogs = await readAILogs(100);

  const pilotFeedbackLines = (
    await readJsonlFile<unknown>(path.join(process.cwd(), "data", "pilot-feedback.jsonl"), 10_000)
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    checks: {
      Supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      "AI provider": Boolean(process.env.OPENAI_API_KEY),
      "Product analytics": process.env.PRODUCT_ANALYTICS_ENABLED === "true",
      "Observability": process.env.OBSERVABILITY_ENABLED === "true",
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      llmConfigured: Boolean(process.env.OPENAI_API_KEY),
      pilotAdminEnabled: process.env.PILOT_ADMIN_ENABLED === "true",
      pilotFeedbackEnv: process.env.PILOT_FEEDBACK_ENABLED === "true",
      productAnalyticsEnv: process.env.PRODUCT_ANALYTICS_ENABLED === "true",
    },
    pilotConfig: config,
    analyticsSummary: summariseAnalytics(analytics),
    analyticsEventCount: analytics.length,
    aiLogCount: aiLogs.length,
    pilotFeedbackCount: pilotFeedbackLines,
    recentAILogs: aiLogs.slice(-10),
  };
}
