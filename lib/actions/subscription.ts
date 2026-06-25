"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { changePlan, cancelSubscription } from "@/lib/commercial/subscription-service";
import type { PlanTier } from "@/lib/commercial/plans";

export async function selectPlan(formData: FormData) {
  const familyId = formData.get("familyId") as string;
  const targetPlan = formData.get("planTier") as PlanTier;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await changePlan(familyId, targetPlan, "upgrade");
  redirect("/settings?upgraded=1");
}

export async function upgradePlan(familyId: string, targetPlan: PlanTier) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await changePlan(familyId, targetPlan, "upgrade");
  redirect("/settings?upgraded=1");
}

export async function downgradePlan(familyId: string, targetPlan: PlanTier) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await changePlan(familyId, targetPlan, "downgrade");
  redirect("/settings?downgraded=1");
}

export async function cancelFamilySubscription(familyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await cancelSubscription(familyId);
  redirect("/settings?canceled=1");
}

export async function submitSupportTicket(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ticket = {
    family_id: (formData.get("familyId") as string) || null,
    user_id: user?.id || null,
    ticket_type: formData.get("ticketType") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const { error } = await supabase.from("support_tickets").insert(ticket);
  if (error) return { error: error.message };

  const { trackProductEvent } = await import("@/lib/pilot/product-analytics");
  await trackProductEvent({ event: "page_view", feature: `support_${ticket.ticket_type}` });

  return { success: true };
}

export async function requestAccountDeletion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const confirm = formData.get("confirm") as string;
  if (confirm !== "DELETE") return { error: "Please type DELETE to confirm." };

  await supabase.from("support_tickets").insert({
    user_id: user.id,
    ticket_type: "deletion",
    subject: "Account deletion request",
    message: (formData.get("reason") as string) || "User requested account deletion via settings.",
  });

  return { success: true, message: "Your deletion request has been received. Our team will confirm within 48 hours." };
}
