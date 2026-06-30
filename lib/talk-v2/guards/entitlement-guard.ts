import { loadFamilySubscription, subscriptionUsage } from "@/lib/commercial/gate";
import { rateLimitUserAction } from "@/lib/security/rate-limit";

export type TalkV2ChildRecord = {
  id: string;
  family_id: string;
};

export type TalkV2EntitlementInput = {
  supabase: any;
  userId: string;
  childId: string;
};

export type TalkV2EntitlementResult =
  | { ok: true; child: TalkV2ChildRecord }
  | { ok: false; error: string };

export async function ensureTalkV2Entitlement(
  input: TalkV2EntitlementInput,
): Promise<TalkV2EntitlementResult> {
  const limited = await rateLimitUserAction(input.userId, "talk_v2");
  if (limited.error) {
    return { ok: false, error: limited.error };
  }

  const { data: child } = await input.supabase
    .from("children")
    .select("id, family_id")
    .eq("id", input.childId)
    .single();

  if (!child) {
    return { ok: false, error: "Child not found" };
  }

  const snapshot = await loadFamilySubscription(child.family_id);
  const usageGate = subscriptionUsage(snapshot, "coachMessagesPerDay");
  if (!usageGate.allowed) {
    return { ok: false, error: usageGate.message };
  }

  return { ok: true, child };
}
