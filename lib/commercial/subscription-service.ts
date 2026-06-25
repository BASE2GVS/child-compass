import { createClient } from "@/lib/supabase/server";
import {
  buildNewSubscription,
  resetUsageIfNeeded,
  resolveSubscriptionSnapshot,
} from "@/lib/commercial/subscription";
import type { FamilySubscription } from "@/lib/commercial/types";
import type { PlanTier } from "@/lib/commercial/plans";

export async function getFamilySubscription(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_subscriptions")
    .select("*")
    .eq("family_id", familyId)
    .maybeSingle();

  if (!data) return resolveSubscriptionSnapshot(null);
  return resolveSubscriptionSnapshot(data as FamilySubscription);
}

export async function ensureFamilySubscription(familyId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("family_subscriptions")
    .select("*")
    .eq("family_id", familyId)
    .maybeSingle();

  if (existing) return resolveSubscriptionSnapshot(existing as FamilySubscription);

  const seed = buildNewSubscription(familyId);
  const { data: inserted } = await supabase
    .from("family_subscriptions")
    .insert(seed)
    .select()
    .single();

  return resolveSubscriptionSnapshot((inserted || null) as FamilySubscription | null);
}

export async function incrementUsage(
  familyId: string,
  field: "reports_month" | "coach_today" | "checkins_today",
) {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("family_subscriptions")
    .select("*")
    .eq("family_id", familyId)
    .maybeSingle();

  if (!sub) return;

  const usage = resetUsageIfNeeded((sub as FamilySubscription).usage);
  const next = { ...usage, [field]: (usage[field] ?? 0) + 1, usage_date: new Date().toISOString().split("T")[0] };

  await supabase
    .from("family_subscriptions")
    .update({ usage: next })
    .eq("family_id", familyId);
}

export async function changePlan(familyId: string, planTier: PlanTier, action: "upgrade" | "downgrade") {
  const supabase = await createClient();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const patch =
    action === "downgrade"
      ? {
          plan_tier: planTier,
          status: "active" as const,
          current_period_end: periodEnd.toISOString(),
          metadata: { last_downgrade: new Date().toISOString() },
        }
      : {
          plan_tier: planTier,
          status: "active" as const,
          trial_ends_at: null,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          metadata: { last_upgrade: new Date().toISOString() },
        };

  await supabase.from("family_subscriptions").update(patch).eq("family_id", familyId);
}

export async function cancelSubscription(familyId: string) {
  const supabase = await createClient();
  const graceEnd = new Date();
  graceEnd.setDate(graceEnd.getDate() + 7);

  await supabase
    .from("family_subscriptions")
    .update({
      status: "grace",
      canceled_at: new Date().toISOString(),
      grace_ends_at: graceEnd.toISOString(),
    })
    .eq("family_id", familyId);
}
