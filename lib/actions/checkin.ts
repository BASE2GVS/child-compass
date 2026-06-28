"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runIntelligenceAnalysis } from "@/lib/services/intelligence-engine";
import { notificationService } from "@/lib/services/notification-service";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import type { NotificationPreferences } from "@/lib/types/database";

export async function saveCheckin(data: {
  childId: string;
  dayType?: import("@/lib/types/database").TimelineDayType;
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

  const { inferDayType } = await import("@/lib/timeline/day-type");
  const dayType = data.dayType ?? inferDayType(new Date(today));

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      child_id: data.childId,
      user_id: user.id,
      checkin_date: today,
      day_type: dayType,
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

  if (child?.family_id) {
    if (!existingCheckin) {
      const { incrementUsage } = await import("@/lib/commercial/subscription-service");
      await incrementUsage(child.family_id, "checkins_today");
    }
    await runIntelligenceAnalysis(data.childId, child.family_id);
    try {
      await trackProductEvent({
        event: "checkin_completed",
        feature: "daily_checkin",
        familyId: child.family_id,
      });
    } catch {
      /* analytics must not block check-in save */
    }
  }

  const { count } = await supabase
    .from("daily_checkins")
    .select("*", { count: "exact", head: true })
    .eq("child_id", data.childId);

  const isFirstCheckin = (count ?? 0) <= 1;
  redirect(`/today?child=${data.childId}${isFirstCheckin ? "&first-checkin=1" : ""}`);
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
  redirect(`/timeline?child=${data.childId}&saved=1`);
}

export async function addTimelineEventFromForm(formData: FormData) {
  const childId = formData.get("childId") as string;
  const eventType = (formData.get("eventType") as string) || "note";
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  const observationKind = (formData.get("observationKind") as string) || "observation";

  if (!childId || !title) redirect(`/timeline?child=${childId || ""}&saveError=1`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { inferDayType } = await import("@/lib/timeline/day-type");
  const resolvedDayType =
    (formData.get("dayType") as import("@/lib/types/database").TimelineDayType) ||
    inferDayType();

  const { error } = await supabase.from("timeline_events").insert({
    child_id: childId,
    user_id: user.id,
    event_type: eventType,
    title,
    description: description || null,
    event_date: new Date().toISOString(),
    metadata: { observation_kind: observationKind, day_type: resolvedDayType },
  });

  if (error) redirect(`/timeline?child=${childId}&saveError=1`);
  redirect(`/timeline?child=${childId}&saved=1`);
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
