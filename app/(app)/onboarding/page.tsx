import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/data/queries";
import OnboardingWizard from "@/components/app/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (profile?.onboarding_completed) redirect("/today");

  return (
    <div>
      <div className="mb-6 text-center lg:hidden">
        <Link href="/" className="text-lg font-bold text-[#0F172A]">
          Child Compass™
        </Link>
      </div>
      <OnboardingWizard />
    </div>
  );
}
