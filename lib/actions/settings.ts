"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateFamilySettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const familyId = formData.get("familyId") as string;

  const { error } = await supabase
    .from("families")
    .update({
      name: formData.get("familyName") as string,
      country: (formData.get("country") as string) || null,
      timezone: (formData.get("timezone") as string) || "UTC",
    })
    .eq("id", familyId);

  if (error) throw new Error(error.message);
  redirect("/settings");
}

export async function inviteCaregiver(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const familyId = formData.get("familyId") as string;
  const email = formData.get("email") as string;

  const { error } = await supabase.from("family_members").insert({
    family_id: familyId,
    invited_email: email,
    role: "caregiver",
  });

  if (error) throw new Error(error.message);
  redirect("/settings");
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_preferences: {
        daily_checkin: formData.get("daily_checkin") === "on",
        weekly_summary: formData.get("weekly_summary") === "on",
        new_insight: formData.get("new_insight") === "on",
        appointments: formData.get("appointments") === "on",
        school_reminder: formData.get("school_reminder") === "on",
      },
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  redirect("/settings");
}

export async function exportFamilyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return { error: "No family found" };

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("family_id", membership.family_id);

  return {
    exportedAt: new Date().toISOString(),
    children: children || [],
  };
}
