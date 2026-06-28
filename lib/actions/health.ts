"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HealthObservationType } from "@/lib/types/database";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addHealthObservation(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("health_observations").insert({
    child_id: childId,
    family_id: child.family_id,
    user_id: user.id,
    observation_type: formData.get("observationType") as HealthObservationType,
    title: formData.get("title") as string,
    notes: (formData.get("notes") as string) || null,
    value: (formData.get("value") as string) || null,
    observed_date: (formData.get("observedDate") as string) || new Date().toISOString().split("T")[0],
  });
  if (error) redirect(`/health?child=${childId}&saveError=1`);
  redirect(`/health?child=${childId}&saved=1`);
}

export async function addCareTeamObservation(formData: FormData) {
  const { supabase, user } = await requireAuth();
  const childId = formData.get("childId") as string;
  const { data: child } = await supabase.from("children").select("family_id").eq("id", childId).single();
  if (!child) throw new Error("Child not found");

  const { error } = await supabase.from("care_team_observations").insert({
    child_id: childId,
    family_id: child.family_id,
    user_id: user.id,
    observer_role: (formData.get("observerRole") as string) || "parent",
    observer_name: (formData.get("observerName") as string) || null,
    observation: formData.get("observation") as string,
    observed_date: (formData.get("observedDate") as string) || new Date().toISOString().split("T")[0],
    shared_with_care_team: true,
  });
  if (error) throw new Error(error.message);
  redirect(`/children/${childId}`);
}

export async function cacheOfflineBundle(childId: string) {
  const { buildOfflineBundle } = await import("@/lib/offline/bundle-server");
  return buildOfflineBundle(childId);
}
