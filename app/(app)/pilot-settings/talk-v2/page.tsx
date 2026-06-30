import { PageHeader, PageShell } from "@/components/design-system";
import TalkV2FounderHarnessPanel from "@/components/pilot/TalkV2FounderHarnessPanel";
import { guardPilotSettingsPage } from "@/lib/actions/pilot-settings";
import { getTalkV2FounderHarnessData } from "@/lib/actions/talk-v2-founder";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function TalkV2FounderHarnessPage() {
  await guardPilotSettingsPage();
  const data = await getTalkV2FounderHarnessData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Founder"
        title="Talk V2 founder harness"
        description="Internal acceptance testing for Talk V2 only."
      />
      <TalkV2FounderHarnessPanel initialData={data} />
    </PageShell>
  );
}
