import type { SupabaseClient } from "@supabase/supabase-js";
import { runIntelligenceAnalysis } from "@/lib/services/intelligence-engine";

type DemoProfile = {
  firstName: string;
  nickname: string;
  diagnosis: string[];
  supportNeeds: string[];
  interests: string[];
  strengths: string[];
  triggers: string[];
  calming: string[];
  ageYears: number;
};

const DEMO_CHILDREN: DemoProfile[] = [
  {
    firstName: "Erkie",
    nickname: "Erkie",
    diagnosis: ["PDA", "Autism"],
    supportNeeds: ["Low demands", "Sensory breaks", "Flexible transitions"],
    interests: ["Minecraft", "Dinosaurs", "Swimming"],
    strengths: ["Creative", "Loyal", "Funny when regulated"],
    triggers: ["Rushed mornings", "Unexpected changes", "Crowded shops"],
    calming: ["Deep pressure", "Two choices", "Quiet time with iPad"],
    ageYears: 8,
  },
  {
    firstName: "Maya",
    nickname: "Maya",
    diagnosis: ["Autism", "Anxiety"],
    supportNeeds: ["Predictable routines", "Visual schedules", "Quiet spaces"],
    interests: ["Drawing", "Cats", "Nature documentaries"],
    strengths: ["Observant", "Kind", "Strong memory"],
    triggers: ["Loud assemblies", "Homework pressure", "Visitors"],
    calming: ["Weighted blanket", "Headphones", "Advance warnings"],
    ageYears: 10,
  },
  {
    firstName: "Leo",
    nickname: "Leo",
    diagnosis: ["ADHD"],
    supportNeeds: ["Movement breaks", "Short tasks", "Clear instructions"],
    interests: ["Football", "Lego", "Science experiments"],
    strengths: ["Energetic", "Curious", "Social when engaged"],
    triggers: ["Long sitting", "Evening homework", "Overstimulation"],
    calming: ["Outdoor run", "Fidget tools", "Snack break"],
    ageYears: 12,
  },
];

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function checkinForDay(profile: DemoProfile, dayIndex: number, userId: string, childId: string, familyId: string) {
  const isMonday = new Date(dateDaysAgo(dayIndex)).getDay() === 1;
  const sleep = dayIndex % 7 === 0 ? 2 : dayIndex % 3 === 0 ? 3 : 4;
  const anxiety = isMonday ? 4 : dayIndex % 5 === 0 ? 4 : 2;
  const mood = sleep <= 2 ? 2 : anxiety >= 4 ? 3 : 4;
  const school = isMonday && profile.diagnosis.includes("PDA") ? 2 : mood >= 4 ? 4 : 3;
  const sensory = dayIndex % 6 === 0 ? 4 : 2;

  const wins =
    dayIndex % 4 === 0
      ? [`Offering two choices helped ${profile.nickname} transition calmly`]
      : dayIndex % 7 === 2
        ? ["Completed morning routine without rushing"]
        : [];

  const challenges =
    isMonday
      ? ["School transition felt hard"]
      : dayIndex % 6 === 0
        ? ["Sensory overload after shopping trip"]
        : [];

  return {
    child_id: childId,
    family_id: familyId,
    user_id: userId,
    checkin_date: dateDaysAgo(dayIndex),
    sleep_quality: sleep,
    mood,
    energy: Math.max(2, mood),
    school_rating: school,
    anxiety,
    sensory_overload: sensory,
    demand_tolerance: mood >= 4 ? 4 : 2,
    appetite: 3,
    social_battery: mood >= 4 ? 4 : 2,
    wins,
    challenges,
    notes:
      dayIndex % 6 === 0
        ? "Busy shop — weather was rainy"
        : isMonday
          ? "Monday morning — school anxiety"
          : null,
  };
}

export async function seedDemoChildren(
  supabase: SupabaseClient,
  familyId: string,
  userId: string,
): Promise<{ created: string[]; error?: string }> {
  const created: string[] = [];

  for (const profile of DEMO_CHILDREN) {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - profile.ageYears);

    const { data: existing } = await supabase
      .from("children")
      .select("id")
      .eq("family_id", familyId)
      .eq("first_name", profile.firstName)
      .maybeSingle();

    let childId = existing?.id;

    if (!childId) {
      const { data: child, error } = await supabase
        .from("children")
        .insert({
          family_id: familyId,
          first_name: profile.firstName,
          nickname: profile.nickname,
          date_of_birth: dob.toISOString().split("T")[0],
          diagnosis: profile.diagnosis,
          support_needs: profile.supportNeeds,
          interests: profile.interests,
          favourite_activities: profile.interests,
        })
        .select("id")
        .single();

      if (error || !child) return { created, error: error?.message || "Failed to create demo child" };
      childId = child.id;

      await supabase.from("child_profiles").insert({
        child_id: childId,
        family_id: familyId,
        strengths: profile.strengths,
        known_triggers: profile.triggers,
        calming_strategies: profile.calming,
        successful_strategies: ["Two choices", "Visual schedule", "Quiet recovery time"],
        challenges: ["Transitions", "Sensory overload"],
      });
    }

    const checkins = Array.from({ length: 21 }, (_, i) =>
      checkinForDay(profile, 20 - i, userId, childId!, familyId),
    );

    const { error: checkinError } = await supabase
      .from("daily_checkins")
      .upsert(checkins, { onConflict: "child_id,checkin_date" });

    if (checkinError) return { created, error: checkinError.message };

    await supabase.from("timeline_events").insert({
      child_id: childId,
      user_id: userId,
      event_type: "victory",
      title: "Demo data seeded",
      description: `Pilot demo profile for ${profile.diagnosis.join(" + ")} — 21 days of check-ins`,
      event_date: new Date().toISOString(),
    });

    await runIntelligenceAnalysis(childId, familyId);
    created.push(profile.firstName);
  }

  return { created };
}

export async function resetDemoChildren(
  supabase: SupabaseClient,
  familyId: string,
): Promise<{ removed: number; error?: string }> {
  const names = DEMO_CHILDREN.map((c) => c.firstName);
  const { data: children } = await supabase
    .from("children")
    .select("id")
    .eq("family_id", familyId)
    .in("first_name", names);

  if (!children?.length) return { removed: 0 };

  for (const child of children) {
    await supabase.from("daily_checkins").delete().eq("child_id", child.id);
    await supabase.from("timeline_events").delete().eq("child_id", child.id);
    await supabase.from("pattern_findings").delete().eq("child_id", child.id);
    await supabase.from("parent_debriefs").delete().eq("child_id", child.id);
    await supabase.from("generated_reports").delete().eq("child_id", child.id);
    await supabase.from("child_profiles").delete().eq("child_id", child.id);
    await supabase.from("children").delete().eq("id", child.id);
  }

  return { removed: children.length };
}
