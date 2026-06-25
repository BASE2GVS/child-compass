import { PLANS, type PlanTier, type FeatureFlag, hasFeature as tierHasFeature } from "@/lib/commercial/plans";
import type { FamilySubscription, SubscriptionSnapshot } from "@/lib/commercial/types";

const TRIAL_DAYS = 14;

export function defaultTrialEnd(): Date {
  const d = new Date();
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

export function buildNewSubscription(familyId: string): Omit<FamilySubscription, "id" | "created_at" | "updated_at"> {
  const trialEnd = defaultTrialEnd();
  return {
    family_id: familyId,
    plan_tier: "trial",
    status: "trialing",
    trial_ends_at: trialEnd.toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: trialEnd.toISOString(),
    grace_ends_at: null,
    canceled_at: null,
    usage: { reports_month: 0, coach_today: 0, checkins_today: 0, usage_date: null },
    metadata: { source: "onboarding" },
  };
}

export function resolveSubscriptionSnapshot(sub: FamilySubscription | null): SubscriptionSnapshot {
  const now = Date.now();

  if (!sub) {
    const fallbackTier = (process.env.COMMERCIAL_PLAN_TIER as PlanTier) || "pilot";
    return {
      subscription: {
        id: "",
        family_id: "",
        plan_tier: fallbackTier,
        status: "active",
        trial_ends_at: null,
        current_period_start: new Date().toISOString(),
        current_period_end: null,
        grace_ends_at: null,
        canceled_at: null,
        usage: {},
        metadata: { env_fallback: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      effectiveTier: fallbackTier,
      isActive: true,
      isTrialing: false,
      inGrace: false,
      daysLeftInTrial: null,
      canUseProduct: true,
    };
  }

  const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : null;
  const graceEnd = sub.grace_ends_at ? new Date(sub.grace_ends_at).getTime() : null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;

  let status = sub.status;
  if (status === "trialing" && trialEnd && now > trialEnd) {
    status = "expired";
  }
  if (status === "past_due" && graceEnd && now <= graceEnd) {
    status = "grace";
  }
  if (status === "grace" && graceEnd && now > graceEnd) {
    status = "expired";
  }
  if (status === "active" && periodEnd && now > periodEnd) {
    status = "past_due";
  }

  const isTrialing = status === "trialing";
  const inGrace = status === "grace";
  const isActive = ["trialing", "active", "grace"].includes(status);
  const canUseProduct = isActive;

  const effectiveTier: PlanTier | "trial" =
    sub.plan_tier === "trial" && isTrialing ? "family_plus" : (sub.plan_tier as PlanTier);

  const daysLeftInTrial =
    isTrialing && trialEnd
      ? Math.max(0, Math.ceil((trialEnd - now) / 86400000))
      : null;

  return {
    subscription: { ...sub, status },
    effectiveTier,
    isActive,
    isTrialing,
    inGrace,
    daysLeftInTrial,
    canUseProduct,
  };
}

export function resetUsageIfNeeded(usage: FamilySubscription["usage"]): FamilySubscription["usage"] {
  const today = new Date().toISOString().split("T")[0];
  const month = today.slice(0, 7);
  const usageDate = usage.usage_date || "";

  if (!usageDate.startsWith(today)) {
    return { ...usage, coach_today: 0, checkins_today: 0, usage_date: today };
  }
  if (!usageDate.startsWith(month)) {
    return { ...usage, reports_month: 0, usage_date: today };
  }
  return usage;
}

export function hasSubscriptionFeature(
  snapshot: SubscriptionSnapshot,
  feature: FeatureFlag,
): boolean {
  if (!snapshot.canUseProduct) return false;
  return tierHasFeature(feature, snapshot.effectiveTier as PlanTier);
}

export function checkUsageLimit(
  snapshot: SubscriptionSnapshot,
  metric: keyof (typeof PLANS)["family"]["limits"],
  current: number,
): { allowed: boolean; limit: number; upgradeTier?: PlanTier } {
  const tier = snapshot.effectiveTier as PlanTier;
  const limit = PLANS[tier]?.limits[metric] ?? PLANS.family.limits[metric];
  if (current >= limit) {
    const upgradeTier: PlanTier = tier === "family" ? "family_plus" : "family_plus";
    return { allowed: false, limit, upgradeTier };
  }
  return { allowed: true, limit };
}

export function planDisplayName(tier: PlanTier | "trial"): string {
  if (tier === "trial") return "Free trial";
  return PLANS[tier as PlanTier]?.name ?? tier;
}

export function formatPriceZar(tier: PlanTier): string | null {
  const prices: Partial<Record<PlanTier, number>> = {
    family: 149,
    family_plus: 249,
  };
  const zar = prices[tier];
  return zar != null ? `R${zar}/month` : null;
}

export function usageSnapshot(snapshot: SubscriptionSnapshot) {
  const usage = resetUsageIfNeeded(snapshot.subscription.usage);
  const tier = snapshot.effectiveTier as PlanTier;
  const limits = PLANS[tier]?.limits ?? PLANS.family.limits;
  return {
    checkins: { used: usage.checkins_today ?? 0, limit: limits.checkinsPerDay },
    reports: { used: usage.reports_month ?? 0, limit: limits.reportsPerMonth },
    coach: { used: usage.coach_today ?? 0, limit: limits.coachMessagesPerDay },
  };
}
