export const dynamic = "force-dynamic";

import { getProfile } from "@/lib/data/queries";
import { redirect } from "next/navigation";
import HelpCentreExperience from "@/components/experience/HelpCentreExperience";

export const metadata = { title: "Help — Child Compass" };

/** Help inside the app shell — no context switch for logged-in parents */
export default async function HelpPage() {
  const profile = await getProfile();
  if (!profile) redirect("/help/faq");

  return <HelpCentreExperience parentName={profile.full_name} />;
}
