import { redirect } from "next/navigation";
import { addHealthObservation } from "@/lib/actions/health";
import { getFamilyContext, getHealthObservations, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { summariseHealthObservations } from "@/lib/hubs/health-service";
import { loadFamilySubscription, subscriptionFeature } from "@/lib/commercial/gate";
import { actionCopy } from "@/lib/presentation/copy";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PageHeader,
  PageShell,
  PremiumCard,
  Select,
  Textarea,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

const OBSERVATION_TYPES = [
  { value: "medication", label: "Medication" },
  { value: "appointment", label: "Appointment" },
  { value: "sleep", label: "Sleep" },
  { value: "nutrition", label: "Nutrition" },
  { value: "exercise", label: "Exercise" },
  { value: "growth", label: "Growth" },
  { value: "note", label: "General note" },
] as const;

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children, family } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const snapshot = family ? await loadFamilySubscription(family.id) : null;
  const healthGate = snapshot ? subscriptionFeature(snapshot, "health_hub") : { allowed: false, message: "Plan required." };

  if (!healthGate.allowed) {
    return (
      <PageShell>
        <PageHeader
          title="Health Hub"
          description={healthGate.message}
        />
        <GlassCard padding="lg">
          <p className="text-sm text-[#64748B]">
            Health Hub is included with Family Plus. Upgrade in Settings to track medication, appointments, sleep, and
            nutrition alongside your daily check-ins.
          </p>
          <a href="/settings" className="mt-4 inline-block text-sm font-semibold text-[#14B8A6] hover:underline">
            View plans in Settings
          </a>
        </GlassCard>
      </PageShell>
    );
  }

  const observations = await getHealthObservations(child.id);
  const summary = summariseHealthObservations(observations);
  const childName = child.nickname || child.first_name;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Wellbeing"
        title="Health Hub"
        description={`Optional health tracking for ${childName} — supports, never replaces, professional care.`}
        familyChildren={children}
        activeChildId={child.id}
      />

      <PremiumCard>
        <h2 className="text-lg font-bold text-[#0F172A]">Add observation</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Track medication, appointments, sleep, nutrition, and growth alongside your daily check-ins.
        </p>
        <form action={addHealthObservation} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="childId" value={child.id} />
          <Select name="observationType">
            {OBSERVATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Input name="observedDate" type="date" />
          <Input name="title" required placeholder="Title" className="sm:col-span-2" />
          <Textarea name="notes" rows={3} placeholder="Notes (optional)" className="sm:col-span-2" />
          <Button type="submit" className="sm:col-span-2">
            {actionCopy.saveObservation}
          </Button>
        </form>
      </PremiumCard>

      {observations.length === 0 ? (
        <EmptyState
          illustration="compass"
          title="No health observations yet"
          description="Add medication notes, appointments, or sleep observations to enrich Child Compass guidance."
          why="Health context helps connect sleep, nutrition, and regulation — always alongside professional advice."
          actionLabel="Add first observation"
          actionHref={`/health?child=${child.id}`}
          secondaryActionLabel="View child profile"
          secondaryActionHref={`/children/${child.id}`}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {Object.entries(summary).map(([key, items]) =>
            items.length ? (
              <GlassCard key={key} padding="sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#14B8A6]">
                  {key.replace(/([A-Z])/g, " $1")}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </GlassCard>
            ) : null,
          )}
        </div>
      )}
    </PageShell>
  );
}
