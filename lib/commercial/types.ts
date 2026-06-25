import type { PlanTier } from "@/lib/commercial/plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "grace"
  | "canceled"
  | "expired";

export type FamilySubscription = {
  id: string;
  family_id: string;
  plan_tier: PlanTier | "trial";
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string | null;
  grace_ends_at: string | null;
  canceled_at: string | null;
  usage: {
    reports_month?: number;
    coach_today?: number;
    checkins_today?: number;
    usage_date?: string | null;
  };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SubscriptionSnapshot = {
  subscription: FamilySubscription;
  effectiveTier: PlanTier | "trial";
  isActive: boolean;
  isTrialing: boolean;
  inGrace: boolean;
  daysLeftInTrial: number | null;
  canUseProduct: boolean;
};
