import { redirect } from "next/navigation";
import { getChild, getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { GlassCard, PageHeader, PageShell, PremiumCard } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function CalmPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");
  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const { profile: childProfile } = await getChild(child.id);
  const strategies = childProfile?.calming_strategies || [];
  const triggers = childProfile?.known_triggers || [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Emergency"
        title="Emergency Calm Plan™"
        description="One-tap support when things feel overwhelming — breathe, strategies, and contacts."
        familyChildren={children}
        activeChildId={child.id}
      />

      <PremiumCard className="border-[#14B8A6]/20 bg-gradient-to-br from-white to-[#14B8A6]/5" padding="lg">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Breathe together</p>
        <p className="mt-2 text-sm text-[#64748B]">Inhale 4 · Hold 4 · Exhale 6 · Repeat 5 times</p>
        <div className="mt-6 flex h-36 items-center justify-center">
          <div className="h-28 w-28 animate-gentle-pulse rounded-full border-8 border-[#14B8A6]/30 bg-[#14B8A6]/10" />
        </div>
      </PremiumCard>

      <div className="grid gap-5 sm:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#14B8A6]">What usually works</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
            {(strategies.length ? strategies : ["Quiet corner", "Deep pressure", "Favourite activity"]).map((s) => (
              <li key={s} className="rounded-xl bg-[#FAF8F4] px-4 py-2">
                {s}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-rose-500">What to avoid</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
            {(triggers.length ? triggers : ["Rushing transitions", "Loud demands", "Public correction"]).map((t) => (
              <li key={t} className="rounded-xl bg-rose-50/50 px-4 py-2">
                {t}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#14B8A6]">Calming activities</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
            {child.interests?.length ? child.interests.join(" · ") : "Add calming interests in the child profile"}
          </p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#14B8A6]">Emergency contacts</h2>
          <p className="mt-3 text-sm text-[#64748B]">
            {profile.emergency_contact?.name
              ? `${profile.emergency_contact.name} (${profile.emergency_contact.phone || "No number"})`
              : "Add emergency contact in Profile settings"}
          </p>
          <p className="mt-3 text-xs text-[#94A3B8]">Sensory toolkit: headphones, water, weighted item, visual timer.</p>
        </GlassCard>
      </div>
    </PageShell>
  );
}
