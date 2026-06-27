import { redirect } from "next/navigation";
import { getFamilyContext, getHealthObservations, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { summariseHealthObservations } from "@/lib/hubs/health-service";
import { loadFamilySubscription, subscriptionFeature } from "@/lib/commercial/gate";
import HealthExperience, { HealthGateExperience } from "@/components/experience/HealthExperience";

export const dynamic = "force-dynamic";

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
    return <HealthGateExperience message={healthGate.message} />;
  }

  const observations = await getHealthObservations(child.id);
  const summary = summariseHealthObservations(observations);

  return (
    <HealthExperience
      child={child}
      familyChildren={children}
      observations={observations}
      summary={summary}
      parentName={profile.full_name}
    />
  );
}
