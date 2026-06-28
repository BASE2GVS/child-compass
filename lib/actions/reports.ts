"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateReportContent, getReportTitle } from "@/lib/services/report-generator";
import { getCheckins, getDebriefs, getPatterns, getCompanionInsights } from "@/lib/data/queries";
import { isSmartDocumentType, loadDocumentInput } from "@/lib/documents";
import type { ReportContent } from "@/lib/services/report-generator";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import { logAIForChild } from "@/lib/pilot/ai-logger";
import { loadFamilySubscription, subscriptionFeature, subscriptionUsage } from "@/lib/commercial/gate";
import { incrementUsage } from "@/lib/commercial/subscription-service";
import type { ReportType } from "@/lib/types/database";

const LONGITUDINAL_TYPES: ReportType[] = ["review_30d", "review_90d", "review_6mo", "review_annual"];

export async function generateReport(childId: string, reportType: ReportType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  if (!child) return { error: "Child not found" };

  const snapshot = await loadFamilySubscription(child.family_id);
  if (LONGITUDINAL_TYPES.includes(reportType)) {
    const gate = subscriptionFeature(snapshot, "longitudinal");
    if (!gate.allowed) return { error: gate.message };
  }

  const usageGate = subscriptionUsage(snapshot, "reportsPerMonth");
  if (!usageGate.allowed) return { error: usageGate.message };

  const checkinLimit = LONGITUDINAL_TYPES.includes(reportType) ? 365 : 30;

  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle();

  const [checkins, debriefs, patterns, companionInsights, documentInput] = await Promise.all([
    getCheckins(childId, checkinLimit),
    getDebriefs(childId),
    getPatterns(childId),
    getCompanionInsights(childId),
    isSmartDocumentType(reportType) ? loadDocumentInput(childId) : Promise.resolve(null),
  ]);

  const content = generateReportContent(
    reportType,
    child,
    profile,
    checkins,
    debriefs,
    patterns,
    companionInsights,
    documentInput,
  );

  const childName = child.nickname || child.first_name;
  const title = getReportTitle(reportType, childName);

  const { data: report, error } = await supabase
    .from("generated_reports")
    .insert({
      child_id: childId,
      family_id: child.family_id,
      user_id: user.id,
      report_type: reportType,
      title,
      content,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await incrementUsage(child.family_id, "reports_month");
    await logAIForChild("report", childId, `${reportType}: ${title}`, undefined);
    await trackProductEvent({
      event: "report_generated",
      feature: reportType,
      familyId: child.family_id,
    });
  } catch {
    /* logging must not fail report generation on serverless */
  }

  return { report };
}

export async function generateReportWithContent(
  childId: string,
  reportType: ReportType,
  content: ReportContent,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  if (!child) return { error: "Child not found" };

  const snapshot = await loadFamilySubscription(child.family_id);
  if (LONGITUDINAL_TYPES.includes(reportType)) {
    const gate = subscriptionFeature(snapshot, "longitudinal");
    if (!gate.allowed) return { error: gate.message };
  }

  const usageGate = subscriptionUsage(snapshot, "reportsPerMonth");
  if (!usageGate.allowed) return { error: usageGate.message };

  const childName = child.nickname || child.first_name;
  const title = getReportTitle(reportType, childName);

  const { data: report, error } = await supabase
    .from("generated_reports")
    .insert({
      child_id: childId,
      family_id: child.family_id,
      user_id: user.id,
      report_type: reportType,
      title,
      content,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await incrementUsage(child.family_id, "reports_month");
    await logAIForChild("report", childId, `${reportType}: ${title}`, undefined);
    await trackProductEvent({
      event: "report_generated",
      feature: reportType,
      familyId: child.family_id,
    });
  } catch {
    /* logging must not fail report generation on serverless */
  }

  return { report };
}
