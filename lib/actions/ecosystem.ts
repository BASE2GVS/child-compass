"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseListInput } from "@/lib/utils/format";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { assembleChildContext, memoryForMessage } from "@/lib/ai/child-context";
import { getCheckins, getDebriefs, getPatterns } from "@/lib/data/queries";
import { logAIForChild } from "@/lib/pilot/ai-logger";
import { trackProductEvent } from "@/lib/pilot/product-analytics";
import { isReflectionMode } from "@/lib/ai/coach-mode";
import type { ParentMood } from "@/lib/companion/parent-checkin";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function sendCoachMessage(payload: {
  childId: string;
  sessionId: string;
  message: string;
  preferReflection?: boolean;
  parentMood?: ParentMood | null;
}) {
  const { supabase, user } = await requireAuth();
  const text = payload.message.trim();
  if (!text) return { error: "Message is required" };

  const { rateLimitUserAction } = await import("@/lib/security/rate-limit");
  const limited = await rateLimitUserAction(user.id, "coach");
  if (limited.error) return { error: limited.error };

  const { data: child } = await supabase.from("children").select("*").eq("id", payload.childId).single();
  if (!child) return { error: "Child not found" };

  const { loadFamilySubscription, subscriptionUsage } = await import("@/lib/commercial/gate");
  const { incrementUsage } = await import("@/lib/commercial/subscription-service");
  const snapshot = await loadFamilySubscription(child.family_id);
  const usageGate = subscriptionUsage(snapshot, "coachMessagesPerDay");
  if (!usageGate.allowed) return { error: usageGate.message };

  const { data: priorMessages } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .eq("session_id", payload.sessionId)
    .order("created_at", { ascending: true });

  const conversationHistory = (priorMessages || []).map((m) => ({
    role: m.role as "parent" | "assistant",
    content: m.content,
  }));

  const coachMessagesWithDates = (priorMessages || []).map((m) => ({
    role: m.role as string,
    content: m.content,
    created_at: m.created_at,
  }));

  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", payload.childId)
    .maybeSingle();

  const [checkins, debriefs, patterns] = await Promise.all([
    getCheckins(payload.childId, 30),
    getDebriefs(payload.childId),
    getPatterns(payload.childId),
  ]);

  const { loadFamilyBrainInput } = await import("@/lib/intelligence/family-brain");
  const brainInput = await loadFamilyBrainInput(payload.childId);

  const context = assembleChildContext(
    child,
    profile,
    checkins,
    debriefs,
    patterns,
    brainInput?.timelineEvents ?? [],
    brainInput,
  );

  try {
    const { generateCoachResponse } = await import("@/lib/ai/coach-engine");
    const { response, trace, mode, enrichment } = await generateCoachResponse(text, context, conversationHistory, {
      preferReflection: payload.preferReflection,
      parentMood: payload.parentMood ?? null,
      coachMessages: coachMessagesWithDates,
    });
    const memoryRef = memoryForMessage(context, text);
    const formatted = formatCoachResponse(
      response,
      context,
      memoryRef,
      text,
      conversationHistory,
      mode,
      enrichment,
    );

    const pipeline = {
      ...trace,
      responseFormatted: Boolean(formatted),
      persisted: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.info("[coach-pipeline]", JSON.stringify({ ...pipeline, mode }, null, 2));
    }

    if (isReflectionMode(mode)) {
      await supabase.from("parent_debriefs").insert({
        child_id: payload.childId,
        user_id: user.id,
        parent_message: text,
        likely_trigger: response.likely_trigger,
        behaviour_explanation: response.behaviour_explanation,
        emotional_interpretation: response.emotional_interpretation,
        suggested_response: response.suggested_response,
        things_not_to_say: response.things_not_to_say,
        tomorrow_plan: response.tomorrow_plan,
        long_term_recommendation: response.long_term_recommendation,
        confidence_level: response.confidence_level,
        follow_up_questions: response.follow_up_questions,
      });

      if (child.family_id) {
        try {
          await trackProductEvent({
            event: "debrief_completed",
            feature: "ask_child_compass_reflection",
            familyId: child.family_id,
          });
        } catch {
          /* analytics must not block reflection */
        }
      }
    }

    const { data: parentRow } = await supabase
      .from("coach_messages")
      .insert({
        session_id: payload.sessionId,
        role: "parent",
        content: text,
      })
      .select("id")
      .single();

    const { data: assistantRow } = await supabase
      .from("coach_messages")
      .insert({
        session_id: payload.sessionId,
        role: "assistant",
        content: formatted,
        metadata: {
          confidence: response.confidence_level,
          generated_by: "coach",
          pipeline: { ...pipeline, persisted: true },
        },
      })
      .select("id")
      .single();

    await incrementUsage(child.family_id, "coach_today");

    try {
      await logAIForChild("coach", payload.childId, response.likely_trigger, response.confidence_level);
      if (child.family_id) {
        await trackProductEvent({
          event: "coach_message_sent",
          feature: "ask_child_compass",
          familyId: child.family_id,
        });
      }
    } catch {
      /* file logging must never fail Talk on serverless */
    }

    return {
      success: true,
      assistantMessage: formatted,
      parentMessageId: parentRow?.id,
      assistantMessageId: assistantRow?.id,
      pipeline: { ...pipeline, persisted: true },
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Coach response failed";
    const isFilesystem =
      /ENOENT|EACCES|EPERM|read-only|mkdir|\/var\/task/i.test(raw);
    const message = isFilesystem
      ? "Something went wrong on our side. Please try again."
      : raw;
    return { error: `Child Compass couldn't complete that response. ${message}` };
  }
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
  if (error) redirect(`/school?child=${childId}&saveError=1`);
  redirect(`/school?child=${childId}&saved=1`);
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
  if (error) redirect(`/therapy?child=${childId}&saveError=1`);
  redirect(`/therapy?child=${childId}&saved=1`);
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

  if (error) redirect("/settings?saveError=1");
  redirect("/settings?saved=1");
}
