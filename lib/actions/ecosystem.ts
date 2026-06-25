"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseListInput } from "@/lib/utils/format";
import { helpEngine } from "@/lib/ai/help-engine";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { assembleChildContext, memoryForMessage } from "@/lib/ai/child-context";
import { getCheckins, getDebriefs, getPatterns } from "@/lib/data/queries";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import { logAIForChild } from "@/lib/pilot/ai-logger";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function sendCoachMessage(payload: { childId: string; sessionId: string; message: string }) {
  const { supabase, user } = await requireAuth();
  const text = payload.message.trim();
  if (!text) return { error: "Message is required" };

  const { rateLimitUserAction } = await import("@/lib/security/rate-limit");
  const limited = await rateLimitUserAction(user.id, "coach");
  if (limited.error) return { error: limited.error };

  await supabase.from("coach_messages").insert({
    session_id: payload.sessionId,
    role: "parent",
    content: text,
  });

  const { data: child } = await supabase.from("children").select("*").eq("id", payload.childId).single();
  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", payload.childId)
    .maybeSingle();
  if (!child) return { error: "Child not found" };

  const { loadFamilySubscription, subscriptionUsage } = await import("@/lib/commercial/gate");
  const { incrementUsage } = await import("@/lib/commercial/subscription-service");
  const snapshot = await loadFamilySubscription(child.family_id);
  const usageGate = subscriptionUsage(snapshot, "coachMessagesPerDay");
  if (!usageGate.allowed) return { error: usageGate.message };

  const [checkins, debriefs, patterns] = await Promise.all([
    getCheckins(payload.childId, 14),
    getDebriefs(payload.childId),
    getPatterns(payload.childId),
  ]);

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("child_id", payload.childId)
    .order("event_date", { ascending: false })
    .limit(30);

  const response = await helpEngine(
    text,
    child,
    profile,
    checkins,
    debriefs,
    patterns,
    timeline || [],
  );

  const context = assembleChildContext(child, profile, checkins, debriefs, patterns, timeline || []);
  const memoryRef = memoryForMessage(context, text);
  const formatted = formatCoachResponse(response, memoryRef, text);

  await supabase.from("coach_messages").insert({
    session_id: payload.sessionId,
    role: "assistant",
    content: formatted,
    metadata: {
      confidence: response.confidence_level,
      generated_by: "coach",
    },
  });

  await incrementUsage(child.family_id, "coach_today");
  await logAIForChild("coach", payload.childId, response.likely_trigger, response.confidence_level);
  if (child.family_id) {
    await trackProductEvent({
      event: "coach_message_sent",
      feature: "ask_child_compass",
      familyId: child.family_id,
    });
  }

  await supabase.from("timeline_events").insert({
    child_id: payload.childId,
    user_id: user.id,
    event_type: "ai_insight",
    title: "AI Child Coach session updated",
    description: response.likely_trigger,
    event_date: new Date().toISOString(),
  });

  return { success: true };
}

export async function addGoal(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("child_goals").insert({
    child_id: childId,
    family_id: child.family_id,
    user_id: user.id,
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    target_value: Number(formData.get("targetValue") || 5),
    current_value: 0,
  });
  if (error) throw new Error(error.message);
  redirect(`/goals?child=${childId}`);
}

export async function updateGoalProgress(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const goalId = formData.get("goalId") as string;
  const childId = formData.get("childId") as string;
  const progress = Number(formData.get("progressValue") || 1);
  const note = (formData.get("note") as string) || null;

  const { data: goal } = await supabase
    .from("child_goals")
    .select("current_value, target_value")
    .eq("id", goalId)
    .single();
  if (!goal) throw new Error("Goal not found");

  const nextValue = Math.max(0, (goal.current_value || 0) + progress);
  const isCompleted = goal.target_value && nextValue >= goal.target_value;

  await supabase.from("goal_updates").insert({
    goal_id: goalId,
    child_id: childId,
    user_id: user.id,
    progress_value: progress,
    note,
  });

  await supabase
    .from("child_goals")
    .update({
      current_value: nextValue,
      status: isCompleted ? "completed" : "active",
      celebration_note: isCompleted ? "Amazing progress! Celebrate this achievement." : null,
    })
    .eq("id", goalId);

  redirect(`/goals?child=${childId}`);
}

export async function addHabit(formData: FormData) {
  const { supabase } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("habits").insert({
    child_id: childId,
    family_id: child.family_id,
    title: formData.get("title") as string,
    icon: (formData.get("icon") as string) || "✅",
  });
  if (error) throw new Error(error.message);
  redirect(`/habits?child=${childId}`);
}

export async function toggleHabit(formData: FormData) {
  const { supabase } = await requireAuth();
  const habitId = formData.get("habitId") as string;
  const childId = formData.get("childId") as string;
  const date = (formData.get("entryDate") as string) || new Date().toISOString().split("T")[0];
  const completed = formData.get("completed") === "true";

  await supabase.from("habit_entries").upsert(
    {
      habit_id: habitId,
      child_id: childId,
      entry_date: date,
      completed,
    },
    { onConflict: "habit_id,entry_date" },
  );

  redirect(`/habits?child=${childId}`);
}

export async function addVisualSchedule(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const steps = parseListInput(formData.get("steps") as string);
  const { data: schedule, error } = await supabase
    .from("visual_schedules")
    .insert({
      child_id: childId,
      family_id: child.family_id,
      title: formData.get("title") as string,
      schedule_type: formData.get("scheduleType") as string,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (steps.length > 0) {
    await supabase.from("visual_schedule_items").insert(
      steps.map((label, idx) => ({
        schedule_id: schedule.id,
        label,
        icon: "🧩",
        position: idx,
      })),
    );
  }

  redirect(`/schedules?child=${childId}`);
}

export async function addSchoolHubEntry(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("school_hub_entries").insert({
    child_id: childId,
    family_id: child.family_id,
    user_id: user.id,
    entry_type: formData.get("entryType") as string,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  });
  if (error) throw new Error(error.message);
  redirect(`/school?child=${childId}`);
}

export async function addTherapySession(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("therapy_sessions").insert({
    child_id: childId,
    family_id: child.family_id,
    user_id: user.id,
    therapist_name: (formData.get("therapistName") as string) || null,
    session_date: (formData.get("sessionDate") as string) || new Date().toISOString().split("T")[0],
    notes: (formData.get("notes") as string) || null,
    recommendations: parseListInput(formData.get("recommendations") as string),
    goals: parseListInput(formData.get("goals") as string),
    exercises: parseListInput(formData.get("exercises") as string),
    progress: (formData.get("progress") as string) || null,
  });
  if (error) throw new Error(error.message);
  redirect(`/therapy?child=${childId}`);
}

export async function inviteSharedAccess(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) throw new Error("No family found");

  const { error } = await supabase.from("family_access_invites").insert({
    family_id: membership.family_id,
    invited_email: formData.get("email") as string,
    invited_role: formData.get("role") as string,
    permissions: {
      timeline: formData.get("permTimeline") === "on",
      reports: formData.get("permReports") === "on",
      therapy: formData.get("permTherapy") === "on",
      school: formData.get("permSchool") === "on",
      health: formData.get("permHealth") === "on",
      observations: formData.get("permObservations") === "on",
    },
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  redirect("/settings");
}
