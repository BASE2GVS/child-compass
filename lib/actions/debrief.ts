"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateDebriefResponse } from "@/lib/ai/debrief-engine";
import { assembleChildContext } from "@/lib/ai/child-context";
import { getCheckins, getDebriefs, getPatterns } from "@/lib/data/queries";
import { notificationService } from "@/lib/services/notification-service";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import { logAIForChild } from "@/lib/pilot/ai-logger";
import type { ParentDebrief } from "@/lib/types/database";

export async function createDebrief(
  childId: string,
  parentMessage: string,
): Promise<{ debrief?: ParentDebrief; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  if (!child) return { error: "Child not found" };

  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle();

  const [checkins, debriefs, patterns] = await Promise.all([
    getCheckins(childId, 30),
    getDebriefs(childId),
    getPatterns(childId),
  ]);

  const { loadFamilyBrainInput } = await import("@/lib/intelligence/family-brain");
  const brainInput = await loadFamilyBrainInput(childId);

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("child_id", childId)
    .order("event_date", { ascending: false })
    .limit(30);

  const context = assembleChildContext(
    child,
    profile,
    checkins,
    debriefs,
    patterns,
    (brainInput?.timelineEvents ?? timeline) || [],
    brainInput,
  );
  const response = await generateDebriefResponse(parentMessage, context);

  const { data: debrief, error } = await supabase
    .from("parent_debriefs")
    .insert({
      child_id: childId,
      user_id: user.id,
      parent_message: parentMessage,
      likely_trigger: response.likely_trigger,
      behaviour_explanation: response.behaviour_explanation,
      emotional_interpretation: response.emotional_interpretation,
      suggested_response: response.suggested_response,
      things_not_to_say: response.things_not_to_say,
      tomorrow_plan: response.tomorrow_plan,
      long_term_recommendation: response.long_term_recommendation,
      confidence_level: response.confidence_level,
      follow_up_questions: response.follow_up_questions,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const { data: childRow } = await supabase.from("children").select("family_id").eq("id", childId).single();

  try {
    await logAIForChild("debrief", childId, response.likely_trigger, response.confidence_level);
    if (childRow?.family_id) {
      await trackProductEvent({
        event: "debrief_completed",
        feature: "parent_debrief",
        familyId: childRow.family_id,
      });
    }
  } catch {
    /* observability must not block debrief save on serverless */
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  const prefs = userProfile?.notification_preferences;
  if (prefs?.new_insight !== false) {
    const notif = notificationService.buildNewInsightNotification(
      user.id,
      child.family_id,
      childId,
      "New debrief guidance available",
    );
    await supabase.from("notification_queue").insert({
      user_id: notif.userId,
      family_id: notif.familyId,
      child_id: notif.childId ?? null,
      notification_type: notif.notificationType,
      title: notif.title,
      body: notif.body,
      scheduled_for: notif.scheduledFor.toISOString(),
      status: "pending",
      metadata: notif.metadata ?? {},
    });
  }

  return { debrief: debrief as ParentDebrief };
}
