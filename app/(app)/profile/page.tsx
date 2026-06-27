import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import ProfileExperience from "@/components/experience/ProfileExperience";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return <ProfileExperience profile={profile} />;
}
