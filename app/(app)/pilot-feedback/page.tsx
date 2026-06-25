import { getFamilyContext } from "@/lib/data/queries";
import { guardPilotFeedbackPage } from "@/lib/actions/pilot-feedback";
import PilotFeedbackForm from "@/components/pilot/PilotFeedbackForm";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function PilotFeedbackPage() {
  await guardPilotFeedbackPage();
  const { family } = await getFamilyContext();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Pilot programme</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0F172A]">Pilot feedback</h1>
        <p className="mt-2 text-[#64748B]">
          Your honest feedback helps Child Compass improve for every family. This page is only available during the
          pilot.
        </p>
      </div>
      <PilotFeedbackForm familyId={family?.id || ""} />
    </div>
  );
}
