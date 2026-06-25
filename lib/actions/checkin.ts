"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runIntelligenceAnalysis } from "@/lib/services/intelligence-engine";
import { notificationService } from "@/lib/services/notification-service";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import type { NotificationPreferences } from "@/lib/types/database";

export async function saveCheckin(data: {
  childId: string;
  sleepQuality: number;
  mood: number;
  energy: number;
  schoolRating: number;
  anxiety: number;
  sensoryOverload: number;
  demandTolerance: number;
  appetite: number;
  socialBattery: number;
  wins: string[];
  challenges: string[];
  notes: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: child } = await supabase
    .from("children")
    .select("family_id")
    .eq("id", data.childId)
    .single();

  const { data: existingCheckin } = await supabase
    .from("daily_checkins")
    .select("id")
    .eq("child_id", data.childId)
    .eq("checkin_date", today)
    .maybeSingle();

  if (child?.family_id && !existingCheckin) {
    const { loadFamilySubscription, subscriptionUsage } = await import("@/lib/commercial/gate");
    const snapshot = await loadFamilySubscription(child.family_id);
    const gate = subscriptionUsage(snapshot, "checkinsPerDay");
    if (!gate.allowed) return { error: gate.message };
  }

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      child_id: data.childId,
      user_id: user.id,
      checkin_date: today,
      sleep_quality: data.sleepQuality,
      mood: data.mood,
      energy: data.energy,
      school_rating: data.schoolRating,
      anxiety: data.anxiety,
      sensory_overload: data.sensoryOverload,
      demand_tolerance: data.demandTolerance,
      appetite: data.appetite,
      social_battery: data.socialBattery,
      wins: data.wins.filter(Boolean),
      challenges: data.challenges.filter(Boolean),
      notes: data.notes || null,
    },
    { onConflict: "child_id,checkin_date" },
  );

  if (error) return { error: error.message };

  await supabase.from("timeline_events").insert({
    child_id: data.childId,
    user_id: user.id,
    event_type: "checkin",
    title: "Daily check-in completed",
    description: `Mood: ${data.mood}/5 · Energy: ${data.energy}/5 · Anxiety: ${data.anxiety}/5`,
    event_date: new Date().toISOString(),
  });

  if (child?.family_id) {
    if (!existingCheckin) {
      const { incrementUsage } = await import("@/lib/commercial/subscription-service");
      await incrementUsage(child.family_id, "checkins_today");
    }
    await runIntelligenceAnalysis(data.childId, child.family_id);
    await trackProductEvent({
      event: "checkin_completed",
      feature: "daily_checkin",
      familyId: child.family_id,
    });
  }

  const { count } = await supabase
    .from("daily_checkins")
    .select("*", { count: "exact", head: true })
    .eq("child_id", data.childId);

  const isFirstCheckin = (count ?? 0) <= 1;
  redirect(`/dashboard?child=${data.childId}${isFirstCheckin ? "&first-checkin=1" : ""}`);
}

export async function addTimelineEvent(data: {
  childId: string;
  eventType: string;
  title: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("timeline_events").insert({
    child_id: data.childId,
    user_id: user.id,
    event_type: data.eventType,
    title: data.title,
    description: data.description || null,
    event_date: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  redirect(`/timeline?child=${data.childId}`);
}

export async function markInsightRead(insightId: string) {
  const supabase = await createClient();
  await supabase.from("ai_insights").update({ is_read: true }).eq("id", insightId);
}

export async function scheduleNotifications(childId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: child } = await supabase
    .from("children")
    .select("family_id, first_name, nickname")
    .eq("id", childId)
    .single();

  if (!profile || !child) return;

  const prefs = (profile.notification_preferences || {}) as NotificationPreferences;
  const childName = child.nickname || child.first_name;

  if (notificationService.shouldNotify(prefs, "daily_checkin")) {
    const notif = notificationService.buildDailyCheckinReminder(
      user.id,
      child.family_id,
      childId,
      childName,
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
}
