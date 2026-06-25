"use server";

import { createClient } from "@/lib/supabase/server";
import { guardAdminPage } from "@/lib/admin/access";
import { buildDiagnostics } from "@/lib/pilot/diagnostics";
import { readProductAnalytics, summariseAnalytics } from "@/lib/pilot/product-analytics";
import { readAILogs } from "@/lib/pilot/ai-logger";
import { readRecentErrors } from "@/lib/observability/metrics";
import { readPackMeta, publishDraft } from "@/lib/knowledge/manager";
import { changePlan, cancelSubscription } from "@/lib/commercial/subscription-service";
import type { PlanTier } from "@/lib/commercial/plans";

export async function getAdminDashboardData() {
  await guardAdminPage();
  const supabase = await createClient();

  const [
    diagnostics,
    analytics,
    aiLogs,
    errors,
    packMeta,
    families,
    subscriptions,
    tickets,
    flags,
    announcements,
  ] = await Promise.all([
    buildDiagnostics(),
    readProductAnalytics(1000),
    readAILogs(100),
    readRecentErrors(50),
    readPackMeta(),
    supabase.from("families").select("id, name, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("family_subscriptions").select("*").order("updated_at", { ascending: false }).limit(50),
    supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("feature_flags").select("*"),
    supabase.from("system_announcements").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const analyticsSummary = summariseAnalytics(analytics);
  const checkins = analytics.filter((e) => e.event === "checkin_completed").length;
  const debriefs = analytics.filter((e) => e.event === "debrief_completed").length;
  const reports = analytics.filter((e) => e.event === "report_generated").length;

  return {
    diagnostics,
    analyticsSummary,
    engagement: { checkins, debriefs, reports, totalEvents: analytics.length },
    aiLogs: aiLogs.slice(-20),
    errors,
    packMeta,
    families: families.data || [],
    subscriptions: subscriptions.data || [],
    tickets: tickets.data || [],
    featureFlags: flags.data || [],
    announcements: announcements.data || [],
  };
}

export async function adminUpdateSubscription(formData: FormData) {
  await guardAdminPage();
  const familyId = formData.get("familyId") as string;
  const plan = formData.get("planTier") as PlanTier;
  const action = (formData.get("action") as "upgrade" | "downgrade") || "upgrade";
  await changePlan(familyId, plan, action);
  return { success: true };
}

export async function adminCancelSubscription(familyId: string) {
  await guardAdminPage();
  await cancelSubscription(familyId);
  return { success: true };
}

export async function adminPublishKnowledgePack(formData: FormData) {
  await guardAdminPage();
  const changelog = (formData.get("changelog") as string) || "Published via admin";
  const evidence = (formData.get("evidenceNotes") as string) || "";
  await publishDraft(changelog, evidence);

  const supabase = await createClient();
  await supabase.from("knowledge_pack_versions").insert({
    version: (await readPackMeta()).version,
    status: "published",
    changelog,
    evidence_notes: evidence,
    published_at: new Date().toISOString(),
  });

  return { success: true };
}

export async function adminSetFeatureFlag(key: string, enabled: boolean) {
  await guardAdminPage();
  const supabase = await createClient();
  await supabase.from("feature_flags").upsert({ key, enabled, updated_at: new Date().toISOString() });
  return { success: true };
}

export async function adminCreateAnnouncement(formData: FormData) {
  await guardAdminPage();
  const supabase = await createClient();
  await supabase.from("system_announcements").insert({
    title: formData.get("title") as string,
    message: formData.get("message") as string,
    severity: (formData.get("severity") as string) || "info",
    is_active: true,
  });
  return { success: true };
}

export async function guardAdminPortalPage(): Promise<void> {
  await guardAdminPage();
}
