import { guardPilotSettingsPage, getPilotSettingsData } from "@/lib/actions/pilot-settings";
import PilotSettingsPanel from "@/components/pilot/PilotSettingsPanel";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function PilotSettingsPage() {
  await guardPilotSettingsPage();
  const data = await getPilotSettingsData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Developer"
        title="Pilot settings"
        description="Hidden admin tools for the Version 1.0 pilot. Not visible to families."
      />
      <PilotSettingsPanel
        config={data.config}
        diagnostics={data.diagnostics}
        analyticsSummary={data.analyticsSummary}
        aiLogs={data.aiLogs}
        envFeedback={process.env.PILOT_FEEDBACK_ENABLED === "true"}
        envAdmin={process.env.PILOT_ADMIN_ENABLED === "true"}
      />
    </PageShell>
  );
}
