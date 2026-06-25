export type PlanTier = "pilot" | "family" | "family_plus" | "enterprise";

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  monthlyPriceGbp: number | null;
  trialDays: number;
  limits: {
    children: number;
    checkinsPerDay: number;
    reportsPerMonth: number;
    coachMessagesPerDay: number;
  };
  features: string[];
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  pilot: {
    id: "pilot",
    name: "Pilot",
    monthlyPriceGbp: null,
    trialDays: 0,
    limits: { children: 5, checkinsPerDay: 10, reportsPerMonth: 50, coachMessagesPerDay: 30 },
    features: ["all_core", "intelligence", "reports", "school_hub", "therapy_hub", "health_hub"],
  },
  family: {
    id: "family",
    name: "Family",
    monthlyPriceGbp: 12.99,
    trialDays: 14,
    limits: { children: 3, checkinsPerDay: 5, reportsPerMonth: 20, coachMessagesPerDay: 15 },
    features: ["all_core", "intelligence", "reports", "school_hub", "therapy_hub"],
  },
  family_plus: {
    id: "family_plus",
    name: "Family Plus",
    monthlyPriceGbp: 19.99,
    trialDays: 14,
    limits: { children: 5, checkinsPerDay: 10, reportsPerMonth: 50, coachMessagesPerDay: 30 },
    features: ["all_core", "intelligence", "reports", "school_hub", "therapy_hub", "health_hub", "longitudinal"],
  },
  enterprise: {
    id: "enterprise",
    name: "Organisation",
    monthlyPriceGbp: null,
    trialDays: 30,
    limits: { children: 999, checkinsPerDay: 999, reportsPerMonth: 999, coachMessagesPerDay: 999 },
    features: ["all_core", "intelligence", "reports", "care_team", "org_dashboard"],
  },
};

export type FeatureFlag =
  | "all_core"
  | "intelligence"
  | "reports"
  | "school_hub"
  | "therapy_hub"
  | "health_hub"
  | "longitudinal"
  | "care_team"
  | "org_dashboard"
  | "offline";

export function getActivePlan(): PlanTier {
  const env = process.env.COMMERCIAL_PLAN_TIER as PlanTier | undefined;
  return env && PLANS[env] ? env : "pilot";
}

export function hasFeature(feature: FeatureFlag, tier: PlanTier = getActivePlan()): boolean {
  return PLANS[tier].features.includes(feature);
}

export function isWithinLimit(
  metric: keyof PlanDefinition["limits"],
  current: number,
  tier: PlanTier = getActivePlan(),
): boolean {
  return current < PLANS[tier].limits[metric];
}
