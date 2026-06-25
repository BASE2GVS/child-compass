"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseListInput } from "@/lib/utils/format";
import type { SupportContact } from "@/lib/types/database";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("fullName") as string,
      country: (formData.get("country") as string) || null,
      timezone: (formData.get("timezone") as string) || "UTC",
      relationship_to_child: (formData.get("relationship") as string) || null,
      emergency_contact: {
        name: formData.get("emergencyName") as string,
        phone: formData.get("emergencyPhone") as string,
        relationship: formData.get("emergencyRelationship") as string,
      },
      notification_preferences: {
        daily_checkin: formData.get("notifyCheckin") === "on",
        weekly_summary: formData.get("notifyWeekly") === "on",
        new_insight: formData.get("notifyInsight") === "on",
        appointments: formData.get("notifyAppointments") === "on",
        school_reminder: formData.get("notifySchool") === "on",
      },
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  redirect("/profile");
}

export async function updateChildProfile(childId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: childError } = await supabase
    .from("children")
    .update({
      first_name: formData.get("firstName") as string,
      nickname: (formData.get("nickname") as string) || null,
      date_of_birth: (formData.get("dateOfBirth") as string) || null,
      gender: (formData.get("gender") as string) || null,
      school: (formData.get("school") as string) || null,
      grade: (formData.get("grade") as string) || null,
      diagnosis: parseListInput(formData.get("diagnosis") as string),
      support_needs: parseListInput(formData.get("supportNeeds") as string),
      interests: parseListInput(formData.get("interests") as string),
      favourite_activities: parseListInput(formData.get("favouriteActivities") as string),
    })
    .eq("id", childId);

  if (childError) throw new Error(childError.message);

  const { error: profileError } = await supabase
    .from("child_profiles")
    .update({
      strengths: parseListInput(formData.get("strengths") as string),
      known_triggers: parseListInput(formData.get("knownTriggers") as string),
      calming_strategies: parseListInput(formData.get("calmingStrategies") as string),
      favourite_things: parseListInput(formData.get("favouriteThings") as string),
      challenges: parseListInput(formData.get("challenges") as string),
      successful_strategies: parseListInput(formData.get("successfulStrategies") as string),
      medication: parseListInput(formData.get("medication") as string),
      medical_history: (formData.get("medicalHistory") as string) || null,
      emergency_notes: (formData.get("emergencyNotes") as string) || null,
      notes: (formData.get("notes") as string) || null,
      school_contacts: parseContacts(formData.get("schoolContacts") as string),
      doctors: parseContacts(formData.get("doctors") as string),
      therapists: parseContacts(formData.get("therapists") as string),
    })
    .eq("child_id", childId);

  if (profileError) throw new Error(profileError.message);
  redirect(`/children/${childId}`);
}

function parseContacts(raw: string): SupportContact[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, role, phone] = line.split("|").map((s) => s.trim());
      return { name: name || line, role, phone };
    });
}

export async function addChild(formData: FormData) {
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

  if (!membership) throw new Error("No family found");

  const { data: child, error } = await supabase
    .from("children")
    .insert({
      family_id: membership.family_id,
      first_name: formData.get("firstName") as string,
      nickname: (formData.get("nickname") as string) || null,
      date_of_birth: (formData.get("dateOfBirth") as string) || null,
      gender: (formData.get("gender") as string) || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("child_profiles").insert({ child_id: child.id });
  redirect(`/children/${child.id}`);
}
