import { PLANS, type FeatureFlag, type PlanDefinition } from "@/lib/commercial/plans";
import {
  checkUsageLimit,
  hasSubscriptionFeature,
  resetUsageIfNeeded,
} from "@/lib/commercial/subscription";
import { getFamilySubscription } from "@/lib/commercial/subscription-service";
import type { SubscriptionSnapshot } from "@/lib/commercial/types";

type UsageMetric = keyof PlanDefinition["limits"];
type UsageField = "reports_month" | "coach_today" | "checkins_today";

const METRIC_TO_FIELD: Record<UsageMetric, UsageField> = {
  checkinsPerDay: "checkins_today",
  reportsPerMonth: "reports_month",
  coachMessagesPerDay: "coach_today",
  children: "checkins_today",
};

export async function loadFamilySubscription(familyId: string): Promise<SubscriptionSnapshot> {
  return getFamilySubscription(familyId);
}

export function subscriptionFeature(
  snapshot: SubscriptionSnapshot,
  feature: FeatureFlag,
): { allowed: true } | { allowed: false; message: string } {
  if (!snapshot.canUseProduct) {
    return {
      allowed: false,
      message:
        "Your free trial has ended. Upgrade in Settings to continue using Child Compass with your family's history intact.",
    };
  }
  if (!hasSubscriptionFeature(snapshot, feature)) {
    return {
      allowed: false,
      message: `${featureLabel(feature)} is available on Family Plus. Upgrade in Settings to unlock it.`,
    };
  }
  return { allowed: true };
}

export function subscriptionUsage(
  snapshot: SubscriptionSnapshot,
  metric: UsageMetric,
): { allowed: true; current: number; limit: number } | { allowed: false; message: string; limit: number } {
  if (!snapshot.canUseProduct) {
    return {
      allowed: false,
      message: "Your trial has ended. Please choose a plan in Settings.",
      limit: 0,
    };
  }

  const field = METRIC_TO_FIELD[metric];
  const usage = resetUsageIfNeeded(snapshot.subscription.usage);
  const current = usage[field] ?? 0;
  const result = checkUsageLimit(snapshot, metric, current);

  if (!result.allowed) {
    const tier = snapshot.effectiveTier;
    const planName = PLANS[tier as keyof typeof PLANS]?.name ?? "your plan";
    return {
      allowed: false,
      message: `You've reached today's limit on ${usageLabel(metric)} for ${planName}. Upgrade for more capacity.`,
      limit: result.limit,
    };
  }

  return { allowed: true, current, limit: result.limit };
}

function featureLabel(feature: FeatureFlag): string {
  const labels: Partial<Record<FeatureFlag, string>> = {
    health_hub: "Health Hub",
    longitudinal: "Longitudinal reviews",
    school_hub: "School Hub",
    therapy_hub: "Therapist Hub",
  };
  return labels[feature] ?? feature;
}

function usageLabel(metric: UsageMetric): string {
  const labels: Record<UsageMetric, string> = {
    checkinsPerDay: "check-ins",
    reportsPerMonth: "reports",
    coachMessagesPerDay: "coach messages",
    children: "children",
  };
  return labels[metric];
}
