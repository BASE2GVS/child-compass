"use client";

import Link from "next/link";
import { selectPlan } from "@/lib/actions/subscription";
import { formatPriceZar, planDisplayName, usageSnapshot } from "@/lib/commercial/subscription";
import type { SubscriptionSnapshot } from "@/lib/commercial/types";
import type { PlanTier } from "@/lib/commercial/plans";
import { Button, GlassCard } from "@/components/design-system";

type SubscriptionCardProps = {
  familyId: string;
  snapshot: SubscriptionSnapshot;
};

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-[#64748B]">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-[#E8E4DC]">
        <div className="h-2 rounded-full bg-[#14B8A6] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SubscriptionCard({ familyId, snapshot }: SubscriptionCardProps) {
  const tier = snapshot.effectiveTier as PlanTier;
  const usage = usageSnapshot(snapshot);
  const currentTier = snapshot.subscription.plan_tier === "trial" ? "trial" : tier;

  return (
    <GlassCard padding="lg">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Your plan</p>
      <h2 className="mt-2 text-2xl font-bold text-[#0F172A]">{planDisplayName(currentTier)}</h2>

      {snapshot.isTrialing && snapshot.daysLeftInTrial != null && (
        <p className="mt-2 text-sm text-[#64748B]">
          {snapshot.daysLeftInTrial} day{snapshot.daysLeftInTrial === 1 ? "" : "s"} left in your free trial — full
          Family Plus access included.
        </p>
      )}

      {snapshot.inGrace && (
        <p className="mt-2 text-sm text-amber-700">
          Your subscription is in a grace period. You still have access while we process your request.
        </p>
      )}

      {!snapshot.canUseProduct && (
        <p className="mt-2 text-sm text-rose-700">
          Your trial has ended. Choose a plan below to continue with your family&apos;s history intact.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <UsageMeter label="Check-ins today" used={usage.checkins.used} limit={usage.checkins.limit} />
        <UsageMeter label="Reports this month" used={usage.reports.used} limit={usage.reports.limit} />
        <UsageMeter label="Coach messages today" used={usage.coach.used} limit={usage.coach.limit} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5">
          <p className="font-semibold text-[#0F172A]">Family</p>
          <p className="mt-1 text-sm text-[#64748B]">{formatPriceZar("family")} · up to 3 children</p>
          <form action={selectPlan} className="mt-4">
            <input type="hidden" name="familyId" value={familyId} />
            <input type="hidden" name="planTier" value="family" />
            <Button type="submit" variant="secondary" className="w-full" disabled={tier === "family" && !snapshot.isTrialing}>
              {tier === "family" && !snapshot.isTrialing ? "Current plan" : "Choose Family"}
            </Button>
          </form>
        </div>
        <div className="rounded-2xl border border-[#14B8A6]/30 bg-[#14B8A6]/5 p-5">
          <p className="font-semibold text-[#0F172A]">Family Plus</p>
          <p className="mt-1 text-sm text-[#64748B]">{formatPriceZar("family_plus")} · Health Hub + longitudinal reviews</p>
          <form action={selectPlan} className="mt-4">
            <input type="hidden" name="familyId" value={familyId} />
            <input type="hidden" name="planTier" value="family_plus" />
            <Button type="submit" className="w-full" disabled={tier === "family_plus" && !snapshot.isTrialing}>
              {tier === "family_plus" && !snapshot.isTrialing ? "Current plan" : "Upgrade to Family Plus"}
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#94A3B8]">
        Secure payments via Stripe and regional providers will be available soon. Prices in South African Rand (ZAR).
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/help/faq" className="font-semibold text-[#14B8A6] hover:underline">
          Billing FAQ
        </Link>
        <Link href="/help/contact" className="font-semibold text-[#14B8A6] hover:underline">
          Contact support
        </Link>
      </div>
    </GlassCard>
  );
}
