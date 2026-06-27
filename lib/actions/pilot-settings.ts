"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isPilotAdminEnabled,
  isPilotAdminUser,
  readPilotConfig,
  writePilotConfig,
} from "@/lib/pilot/config";
import { buildDiagnostics } from "@/lib/pilot/diagnostics";
import { readAILogs } from "@/lib/pilot/ai-logger";
import { readProductAnalytics, summariseAnalytics } from "@/lib/pilot/product-analytics";
import { resetDemoChildren, seedDemoChildren } from "@/lib/pilot/demo-seed";

async function requirePilotAdmin() {
  if (!isPilotAdminEnabled()) redirect("/today");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const allowed = await isPilotAdminUser(user.email);
  if (!allowed) redirect("/today");
  return { supabase, user };
}

export async function getPilotSettingsData() {
  const { supabase, user } = await requirePilotAdmin();
  const config = await readPilotConfig();
  const diagnostics = await buildDiagnostics();
  const analytics = await readProductAnalytics(300);
  const aiLogs = await readAILogs(50);

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return {
    config,
    diagnostics,
    analyticsSummary: summariseAnalytics(analytics),
    analyticsRecent: analytics.slice(-20),
    aiLogs,
    familyId: membership?.family_id || null,
    userEmail: user.email,
  };
}

export async function updatePilotConfig(formData: FormData) {
  await requirePilotAdmin();
  const patch = {
    pilotFeedbackEnabled: formData.get("pilotFeedbackEnabled") === "on",
    demoDataEnabled: formData.get("demoDataEnabled") === "on",
    analyticsEnabled: formData.get("analyticsEnabled") === "on",
  };
  await writePilotConfig(patch);
  return { success: true };
}

export async function runDemoSeed() {
  const { supabase, user } = await requirePilotAdmin();
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership?.family_id) return { error: "No family found" };

  const result = await seedDemoChildren(supabase, membership.family_id, user.id);
  if (result.error) return { error: result.error };
  await writePilotConfig({ demoDataEnabled: true });
  return { success: true, created: result.created };
}

export async function runDemoReset() {
  const { supabase, user } = await requirePilotAdmin();
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership?.family_id) return { error: "No family found" };

  const result = await resetDemoChildren(supabase, membership.family_id);
  if (result.error) return { error: result.error };
  return { success: true, removed: result.removed };
}

export async function exportDiagnosticsJson(): Promise<string> {
  await requirePilotAdmin();
  const diagnostics = await buildDiagnostics();
  return JSON.stringify(diagnostics, null, 2);
}

export async function guardPilotSettingsPage(): Promise<void> {
  if (!isPilotAdminEnabled()) redirect("/today");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const allowed = await isPilotAdminUser(user.email);
  if (!allowed) redirect("/today");
}
