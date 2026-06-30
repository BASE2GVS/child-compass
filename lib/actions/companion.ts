"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const RESPONSE_LABELS: Record<string, string> = {
  better: "Better than expected",
  same: "About the same",
  harder: "More difficult than expected",
};

export async function saveEveningReflection(formData: FormData) {
  const childId = String(formData.get("childId") || "").trim();
  const responseKey = String(formData.get("response") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!childId || !(responseKey in RESPONSE_LABELS)) {
    redirect(`/today?child=${childId}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const responseLabel = RESPONSE_LABELS[responseKey];

  const description = note
    ? `Today felt ${responseLabel.toLowerCase()}. Parent note: ${note}`
    : `Today felt ${responseLabel.toLowerCase()}.`;

  const { error } = await supabase.from("timeline_events").insert({
    child_id: childId,
    user_id: user.id,
    event_type: "note",
    title: `Evening Reflection: ${responseLabel}`,
    description,
    event_date: new Date().toISOString(),
    metadata: {
      observation_kind: "reflection",
      reflection_response: responseKey,
      reflection_source: "companion_home",
    },
  });

  if (error) {
    redirect(`/today?child=${childId}&reflectionError=1`);
  }

  redirect(`/today?child=${childId}&reflectionSaved=1`);
}
